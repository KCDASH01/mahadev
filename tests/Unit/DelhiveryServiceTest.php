<?php

namespace Tests\Unit;

use App\Exceptions\DelhiveryApiException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShippingShipment;
use App\Models\User;
use App\Models\UserAddress;
use App\Services\DelhiveryService;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DelhiveryServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.delhivery.enabled' => true,
            'services.delhivery.token' => 'test-delhivery-token',
            'services.delhivery.base_url' => 'https://track.delhivery.com',
            'services.delhivery.pickup_location' => 'BHULIKA B2C',
            'services.delhivery.auto_create_on_order' => true,
            'logging.default' => 'null',
        ]);
    }

    public function test_create_shipment_posts_form_encoded_json_payload(): void
    {
        Http::fake([
            'https://track.delhivery.com/api/cmu/create.json' => Http::response($this->successfulCreateResponse(), 200),
        ]);

        $shipmentData = [
            'name' => 'Customer Name',
            'add' => 'Full Address',
            'pin' => '752101',
            'city' => 'Bhubaneswar',
            'state' => 'Odisha',
            'country' => 'India',
            'phone' => '9668006088',
            'order' => 'H2S-260916-ABC123',
            'payment_mode' => 'Prepaid',
            'products_desc' => 'Product Description',
            'cod_amount' => 0,
            'order_date' => '2026-09-16',
            'total_amount' => 899,
            'quantity' => '1',
            'seller_gst_tin' => '21AAPCB0914N1Z1',
            'hsn_code' => '6109',
            'weight' => 0.5,
            'shipment_height' => 5,
            'shipment_width' => 20,
            'shipment_length' => 25,
        ];

        $response = app(DelhiveryService::class)->createShipment($shipmentData, 'BHULIKA B2C');

        $this->assertSame('UPL123', $response['upload_wbn']);
        $this->assertSame('1234567890123', $response['packages'][0]['waybill']);

        Http::assertSent(function ($request) use ($shipmentData) {
            $data = json_decode((string) $request['data'], true);

            return $request->url() === 'https://track.delhivery.com/api/cmu/create.json'
                && $request->method() === 'POST'
                && $request->hasHeader('Authorization', 'Token test-delhivery-token')
                && $request['format'] === 'json'
                && is_array($data)
                && ($data['pickup_location']['name'] ?? null) === 'BHULIKA B2C'
                && ($data['shipments'][0] ?? []) === $shipmentData;
        });
    }

    public function test_create_shipment_throws_when_package_fails(): void
    {
        Http::fake([
            'https://track.delhivery.com/api/cmu/create.json' => Http::response([
                'success' => false,
                'packages' => [[
                    'status' => 'Fail',
                    'waybill' => '',
                    'remarks' => ['Pincode not serviceable'],
                ]],
            ], 200),
        ]);

        $this->expectException(DelhiveryApiException::class);
        $this->expectExceptionMessage('Pincode not serviceable');

        app(DelhiveryService::class)->createShipment([
            'name' => 'Customer Name',
            'order' => 'H2S-FAIL',
        ], 'BHULIKA B2C');
    }

    public function test_create_shipment_for_order_stores_awb_after_confirmation(): void
    {
        Http::fake([
            'https://track.delhivery.com/api/cmu/create.json' => Http::response($this->successfulCreateResponse(), 200),
        ]);

        $order = $this->confirmedOrder();

        $shipment = app(DelhiveryService::class)->createShipmentForOrder($order);

        $this->assertSame('1234567890123', $shipment->awb_number);
        $this->assertSame('Delhivery', $shipment->courier_name);
        $this->assertSame('BHULIKA B2C', $shipment->warehouse_id);
        $this->assertSame(ShippingShipment::STATUS_CREATED, $shipment->shipment_status);
        $this->assertSame('processing', $order->fresh()->order_status);
        $this->assertDatabaseHas('order_trackings', [
            'order_id' => $order->id,
            'status' => 'shipment_created',
        ]);
    }

    public function test_try_create_shipment_for_order_swallows_api_errors(): void
    {
        Http::fake([
            'https://track.delhivery.com/api/cmu/create.json' => Http::response([
                'success' => false,
                'packages' => [[
                    'status' => 'Fail',
                    'remarks' => ['Warehouse not found'],
                ]],
            ], 200),
        ]);

        $order = $this->confirmedOrder();
        $shipment = app(DelhiveryService::class)->tryCreateShipmentForOrder($order);

        $this->assertNotNull($shipment);
        $this->assertSame(ShippingShipment::STATUS_FAILED, $shipment->shipment_status);
        $this->assertNull($shipment->awb_number);
        $this->assertSame('Warehouse not found', $shipment->failure_reason);
    }

    public function test_tracking_does_not_move_shipped_order_back_to_processing(): void
    {
        $this->fakeTrackingStatus('Manifested');

        $shipment = $this->shipmentForOrder($this->confirmedOrder([
            'order_status' => 'shipped',
        ]));

        app(DelhiveryService::class)->trackShipment($shipment);

        $this->assertSame('shipped', $shipment->order->fresh()->order_status);
    }

    public function test_tracking_advances_processing_order_to_shipped(): void
    {
        $this->fakeTrackingStatus('In Transit');

        $shipment = $this->shipmentForOrder($this->confirmedOrder([
            'order_status' => 'processing',
        ]));

        app(DelhiveryService::class)->trackShipment($shipment);

        $this->assertSame('shipped', $shipment->order->fresh()->order_status);
    }

    public function test_tracking_does_not_move_delivered_order_backwards(): void
    {
        $this->fakeTrackingStatus('In Transit');

        $shipment = $this->shipmentForOrder($this->confirmedOrder([
            'order_status' => 'delivered',
        ]));

        app(DelhiveryService::class)->trackShipment($shipment);

        $this->assertSame('delivered', $shipment->order->fresh()->order_status);
    }

    public function test_tracking_does_not_move_cancelled_order_to_delivered(): void
    {
        $this->fakeTrackingStatus('Delivered');

        $shipment = $this->shipmentForOrder($this->confirmedOrder([
            'order_status' => 'cancelled',
        ]));

        app(DelhiveryService::class)->trackShipment($shipment);

        $this->assertSame('cancelled', $shipment->order->fresh()->order_status);
    }

    public function test_tracking_marks_cod_paid_only_when_delivered(): void
    {
        $this->fakeTrackingStatus('Delivered');

        $shipment = $this->shipmentForOrder($this->confirmedOrder([
            'order_status' => 'shipped',
            'payment_method' => 'cod',
            'payment_status' => 'pending',
        ]));

        app(DelhiveryService::class)->trackShipment($shipment);

        $order = $shipment->order->fresh();

        $this->assertSame('delivered', $order->order_status);
        $this->assertSame('paid', $order->payment_status);
    }

    public function test_cancelling_order_stops_live_delhivery_pickup(): void
    {
        Http::fake([
            'https://track.delhivery.com/api/p/edit' => Http::response(['status' => true], 200),
        ]);

        $order = $this->confirmedOrder(['order_status' => 'processing']);
        $this->shipmentForOrder($order);

        app(OrderService::class)->updateOrderStatus($order->fresh('shipment'), 'cancelled');

        $order = $order->fresh('shipment');

        $this->assertSame('cancelled', $order->order_status);
        $this->assertSame(ShippingShipment::STATUS_CANCELLED, $order->shipment?->shipment_status);

        Http::assertSent(fn ($request) => $request->url() === 'https://track.delhivery.com/api/p/edit'
            && $request['waybill'] === '1234567890123'
            && $request['cancellation'] === 'true');
    }

    public function test_order_is_not_cancelled_when_delhivery_pickup_cannot_be_stopped(): void
    {
        Http::fake([
            'https://track.delhivery.com/api/p/edit' => Http::response([
                'status' => false,
                'error' => 'Package already picked up',
            ], 200),
        ]);

        $order = $this->confirmedOrder(['order_status' => 'processing']);
        $this->shipmentForOrder($order);

        try {
            app(OrderService::class)->updateOrderStatus($order->fresh('shipment'), 'cancelled');
            $this->fail('Expected Delhivery cancellation to fail.');
        } catch (DelhiveryApiException) {
            // Order must stay open so admin knows pickup is still active.
        }

        $this->assertSame('processing', $order->fresh()->order_status);
        $this->assertNotSame(ShippingShipment::STATUS_CANCELLED, $order->fresh('shipment')->shipment?->shipment_status);
    }

    public function test_cancelling_order_without_awb_does_not_call_delhivery(): void
    {
        Http::fake();

        $order = $this->confirmedOrder(['order_status' => 'processing']);
        ShippingShipment::query()->create([
            'order_id' => $order->id,
            'warehouse_id' => 'BHULIKA B2C',
            'courier_name' => 'Delhivery',
            'shipment_status' => ShippingShipment::STATUS_FAILED,
        ]);

        app(OrderService::class)->updateOrderStatus($order->fresh('shipment'), 'cancelled');

        $this->assertSame('cancelled', $order->fresh()->order_status);
        $this->assertSame(ShippingShipment::STATUS_CANCELLED, $order->fresh('shipment')->shipment?->shipment_status);
        Http::assertNothingSent();
    }

    /**
     * @return array<string, mixed>
     */
    private function successfulCreateResponse(): array
    {
        return [
            'success' => true,
            'upload_wbn' => 'UPL123',
            'packages' => [[
                'status' => 'Success',
                'waybill' => '1234567890123',
                'remarks' => [''],
            ]],
        ];
    }

    private function fakeTrackingStatus(string $status): void
    {
        Http::fake([
            'https://track.delhivery.com/api/v1/packages/json*' => Http::response([
                'ShipmentData' => [[
                    'Shipment' => [
                        'Status' => [
                            'Status' => $status,
                            'Instructions' => 'Tracking update',
                        ],
                    ],
                ]],
            ], 200),
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function confirmedOrder(array $overrides = []): Order
    {
        $user = User::factory()->create([
            'phone' => '9668006088',
        ]);

        $address = UserAddress::query()->create([
            'user_id' => $user->id,
            'full_name' => 'Customer Name',
            'phone' => '9668006088',
            'address_line_1' => 'Full Address',
            'city' => 'Bhubaneswar',
            'state' => 'Odisha',
            'country' => 'India',
            'pincode' => '752101',
            'is_default' => true,
        ]);

        $order = Order::query()->create(array_merge([
            'order_number' => 'H2S-260916-'.strtoupper(substr(md5(uniqid('', true)), 0, 6)),
            'user_id' => $user->id,
            'address_id' => $address->id,
            'shipping_address_snapshot' => [
                'full_name' => 'Customer Name',
                'phone' => '9668006088',
                'address_line_1' => 'Full Address',
                'city' => 'Bhubaneswar',
                'state' => 'Odisha',
                'country' => 'India',
                'pincode' => '752101',
            ],
            'subtotal' => 899,
            'grand_total' => 899,
            'payment_method' => 'razorpay',
            'payment_status' => 'paid',
            'order_status' => 'confirmed',
            'placed_at' => now(),
        ], $overrides));

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_name' => 'Product Description',
            'sku' => 'SKU-1',
            'original_price' => 999,
            'sale_price' => 899,
            'quantity' => 1,
            'subtotal' => 899,
        ]);

        return $order->fresh(['items', 'user']);
    }

    private function shipmentForOrder(Order $order): ShippingShipment
    {
        return ShippingShipment::query()->create([
            'order_id' => $order->id,
            'warehouse_id' => 'BHULIKA B2C',
            'courier_name' => 'Delhivery',
            'awb_number' => '1234567890123',
            'shipment_status' => ShippingShipment::STATUS_CREATED,
            'tracking_status' => 'created',
        ])->load('order');
    }
}
