<?php

namespace App\Services;

use App\Exceptions\DelhiveryApiException;
use App\Models\Order;
use App\Models\OrderTracking;
use App\Models\Product;
use App\Models\ShippingApiLog;
use App\Models\ShippingShipment;
use App\Support\IndianMobileNumber;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class DelhiveryService
{
    private ?int $logOrderId = null;

    private ?int $logShipmentId = null;

    /**
     * Create a Delhivery shipment.
     *
     * POST /api/cmu/create.json as x-www-form-urlencoded:
     * format=json
     * data={json payload}
     *
     * @param  array<string, mixed>  $shipmentData
     * @return array<string, mixed>
     */
    public function createShipment(array $shipmentData, string $pickupLocationName): array
    {
        if ($pickupLocationName === '') {
            throw new DelhiveryApiException('Delhivery pickup location name is required.');
        }

        if ($shipmentData === []) {
            throw new DelhiveryApiException('Delhivery shipment data is required.');
        }

        $payload = [
            'pickup_location' => [
                'name' => $pickupLocationName,
            ],
            'shipments' => [$shipmentData],
        ];

        $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($encoded === false) {
            throw new DelhiveryApiException('Unable to encode Delhivery shipment payload as JSON.');
        }

        $form = [
            'format' => 'json',
            'data' => $encoded,
        ];

        $response = $this->sendForm('POST', '/api/cmu/create.json', $form);
        $body = $this->jsonOrFail($response, 'create shipment');

        $package = $this->firstPackage($body);

        if ($this->packageFailed($body, $package)) {
            throw new DelhiveryApiException(
                $this->extractErrorMessage($body, $response->body(), 'Delhivery rejected the shipment.'),
                $response->status(),
                $body,
            );
        }

        $waybill = (string) ($package['waybill'] ?? '');

        if ($waybill === '') {
            throw new DelhiveryApiException(
                $this->extractErrorMessage($body, $response->body(), 'Delhivery did not return a waybill.'),
                $response->status(),
                $body,
            );
        }

        return $body;
    }

    public function isEnabled(): bool
    {
        return (bool) config('services.delhivery.enabled', true)
            && $this->token() !== '';
    }

    public function createShipmentForOrder(Order $order): ShippingShipment
    {
        if (! $this->isEnabled()) {
            throw new RuntimeException('Delhivery shipping is not configured.');
        }

        if (! $this->orderIsEligibleForShipment($order)) {
            throw new RuntimeException('Order is not eligible for Delhivery shipment creation.');
        }

        $existing = ShippingShipment::query()->where('order_id', $order->id)->first();

        if ($existing?->hasAwb()) {
            return $existing;
        }

        $order->loadMissing(['items', 'user']);
        $shipmentData = $this->buildShipmentPayload($order);

        $shipment = $existing ?? ShippingShipment::query()->create([
            'order_id' => $order->id,
            'warehouse_id' => $this->pickupLocationName(),
            'courier_name' => 'Delhivery',
            'shipment_status' => ShippingShipment::STATUS_PENDING,
            'weight' => $shipmentData['weight'] ?? $this->defaultWeight(),
            'length' => $shipmentData['shipment_length'] ?? $this->defaultLength(),
            'breadth' => $shipmentData['shipment_width'] ?? $this->defaultWidth(),
            'height' => $shipmentData['shipment_height'] ?? $this->defaultHeight(),
        ]);

        try {
            $this->usingLogContext($order, $shipment);
            $response = $this->createShipment($shipmentData, $this->pickupLocationName());

            $package = $this->firstPackage($response);
            $waybill = (string) ($package['waybill'] ?? '');

            $shipment->fill($this->mapCreateResponse($response, $package, $shipmentData));
            $shipment->shipment_status = ShippingShipment::STATUS_CREATED;
            $shipment->failure_reason = null;
            $shipment->save();

            $this->recordShipmentTracking($order, $shipment);
            $this->syncOrderStatusFromTracking($order, (string) ($shipment->tracking_status ?? 'shipped'));

            Log::channel('delhivery')->info('Delhivery shipment created', [
                'order_number' => $order->order_number,
                'awb' => $waybill,
                'upload_wbn' => $response['upload_wbn'] ?? null,
            ]);

            return $shipment->fresh();
        } catch (Throwable $exception) {
            $updates = [
                'shipment_status' => ShippingShipment::STATUS_FAILED,
                'failure_reason' => Str::limit($exception->getMessage(), 1000),
            ];

            if ($exception instanceof DelhiveryApiException && is_array($exception->responseBody)) {
                $existingApiResponse = $shipment->api_response ?? [];

                $updates['api_response'] = array_merge(
                    is_array($existingApiResponse) ? $existingApiResponse : [],
                    ['last_error' => $exception->responseBody],
                );
            }

            $shipment->update($updates);

            throw $exception;
        }
    }

    public function tryCreateShipmentForOrder(Order $order): ?ShippingShipment
    {
        if (! config('services.delhivery.auto_create_on_order', true)) {
            return null;
        }

        if (! $this->isEnabled() || ! $this->orderIsEligibleForShipment($order)) {
            return null;
        }

        $existing = ShippingShipment::query()->where('order_id', $order->id)->first();

        if ($existing?->hasAwb()) {
            return $existing;
        }

        try {
            return $this->createShipmentForOrder($order);
        } catch (Throwable $exception) {
            Log::channel('delhivery')->error('Automatic Delhivery shipment creation failed', [
                'order_number' => $order->order_number,
                'message' => $exception->getMessage(),
            ]);

            return ShippingShipment::query()->where('order_id', $order->id)->first();
        }
    }

    public function trackShipment(ShippingShipment $shipment): ShippingShipment
    {
        if (! $shipment->hasAwb()) {
            throw new RuntimeException('Shipment does not have an AWB number yet.');
        }

        $shipment->loadMissing('order');
        $order = $shipment->order;
        $this->usingLogContext($order, $shipment);

        $response = $this->sendJson(
            'GET',
            '/api/v1/packages/json/',
            ['waybill' => $shipment->awb_number],
        );
        $body = $this->jsonOrFail($response, 'track shipment');

        $tracking = $this->extractTrackingPayload($body);

        $shipment->update([
            'tracking_status' => $tracking['status'] ?? $shipment->tracking_status,
            'last_tracked_at' => now(),
            'delivery_date' => $tracking['delivery_date'] ?? $shipment->delivery_date,
            'api_response' => array_merge($shipment->api_response ?? [], ['last_tracking' => $body]),
        ]);

        if ($order) {
            $this->appendTrackingEvent(
                $order,
                $tracking['status'] ?? 'tracking_updated',
                $tracking['remarks'] ?? 'Shipment status refreshed from Delhivery.',
            );
            $this->syncOrderStatusFromTracking($order, (string) ($tracking['status'] ?? ''));
        }

        if ($this->isDeliveredStatus((string) ($tracking['status'] ?? ''))) {
            $shipment->update([
                'shipment_status' => ShippingShipment::STATUS_DELIVERED,
            ]);
        }

        return $shipment->fresh();
    }

    public function cancelShipment(ShippingShipment $shipment): ShippingShipment
    {
        if (! $shipment->isCancellable()) {
            throw new RuntimeException('This shipment cannot be cancelled.');
        }

        $shipment->loadMissing('order');
        $order = $shipment->order;
        $this->usingLogContext($order, $shipment);

        $response = $this->sendJson(
            'POST',
            '/api/p/edit',
            [
                'waybill' => $shipment->awb_number,
                'cancellation' => 'true',
            ],
        );
        $body = $this->jsonOrFail($response, 'cancel shipment');

        $cancelled = ($body['status'] ?? $body['success'] ?? true) !== false;

        if (! $cancelled) {
            throw new DelhiveryApiException(
                $this->extractErrorMessage($body, $response->body(), 'Delhivery could not cancel the shipment.'),
                $response->status(),
                $body,
            );
        }

        $shipment->update([
            'shipment_status' => ShippingShipment::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'tracking_status' => 'cancelled',
            'api_response' => array_merge($shipment->api_response ?? [], ['last_cancel' => $body]),
        ]);

        if ($order) {
            $this->appendTrackingEvent($order, 'shipment_cancelled', 'Shipment cancelled in Delhivery.');
        }

        return $shipment->fresh();
    }

    public function cancelShipmentForOrder(Order $order): void
    {
        $shipment = $order->shipment ?? ShippingShipment::query()->where('order_id', $order->id)->first();

        if (! $shipment || $shipment->shipment_status === ShippingShipment::STATUS_CANCELLED) {
            return;
        }

        if ($shipment->shipment_status === ShippingShipment::STATUS_DELIVERED) {
            return;
        }

        if (! $shipment->hasAwb()) {
            $shipment->update([
                'shipment_status' => ShippingShipment::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'tracking_status' => 'cancelled',
            ]);

            $this->appendTrackingEvent($order, 'shipment_cancelled', 'Shipment cancelled before an AWB was created.');

            return;
        }

        if (! $this->isEnabled()) {
            throw new RuntimeException('Cannot cancel the Delhivery pickup because Delhivery is not configured.');
        }

        $this->cancelShipment($shipment);
    }

    public function syncActiveShipments(): int
    {
        $shipments = ShippingShipment::query()
            ->whereNotNull('awb_number')
            ->whereNotIn('shipment_status', [
                ShippingShipment::STATUS_CANCELLED,
                ShippingShipment::STATUS_DELIVERED,
                ShippingShipment::STATUS_FAILED,
            ])
            ->where(function ($query) {
                $query->whereNull('last_tracked_at')
                    ->orWhere('last_tracked_at', '<=', now()->subMinutes(30));
            })
            ->with('order')
            ->limit(50)
            ->get();

        $synced = 0;

        foreach ($shipments as $shipment) {
            try {
                $this->trackShipment($shipment);
                $synced++;
            } catch (Throwable $exception) {
                Log::channel('delhivery')->warning('Delhivery shipment sync failed', [
                    'shipment_id' => $shipment->id,
                    'order_id' => $shipment->order_id,
                    'message' => $exception->getMessage(),
                ]);
            }
        }

        return $synced;
    }

    public function orderIsEligibleForShipment(Order $order): bool
    {
        if (in_array($order->order_status, ['cancelled', 'pending_payment'], true)) {
            return false;
        }

        if ($order->payment_method === 'razorpay' && $order->payment_status !== 'paid') {
            return false;
        }

        return filled($order->shipping_address_snapshot['pincode'] ?? null);
    }

    /**
     * @return array<string, mixed>
     */
    public function buildShipmentPayload(Order $order): array
    {
        $address = $order->shipping_address_snapshot ?? [];
        $isCod = $order->payment_method === 'cod';
        $quantity = max(1, (int) $order->items->sum('quantity'));

        return [
            'name' => trim((string) ($address['full_name'] ?? $order->user?->name ?? 'Customer')) ?: 'Customer',
            'add' => $this->fullAddress($address),
            'pin' => (string) ($address['pincode'] ?? ''),
            'city' => (string) ($address['city'] ?? ''),
            'state' => (string) ($address['state'] ?? ''),
            'country' => (string) ($address['country'] ?? 'India') ?: 'India',
            'phone' => $this->phone($address, $order),
            'order' => $order->order_number,
            'payment_mode' => $isCod ? 'COD' : 'Prepaid',
            'products_desc' => $order->items->pluck('product_name')->filter()->implode(', ') ?: 'Mahadev order',
            'cod_amount' => $isCod ? (float) $order->grand_total : 0,
            'order_date' => ($order->placed_at ?? now())->format('Y-m-d'),
            'total_amount' => (float) $order->grand_total,
            'quantity' => (string) $quantity,
            'seller_gst_tin' => $this->sellerGstTin(),
            'hsn_code' => $this->hsnCode(),
            'weight' => $this->resolvePackageWeight($order),
            'shipment_height' => $this->defaultHeight(),
            'shipment_width' => $this->defaultWidth(),
            'shipment_length' => $this->defaultLength(),
        ];
    }

    /**
     * @param  array<string, mixed>  $response
     * @param  array<string, mixed>  $package
     * @param  array<string, mixed>  $shipmentData
     * @return array<string, mixed>
     */
    private function mapCreateResponse(array $response, array $package, array $shipmentData): array
    {
        $waybill = (string) ($package['waybill'] ?? '');

        return [
            'velocity_order_id' => $response['upload_wbn'] ?? null,
            'velocity_shipment_id' => $waybill !== '' ? $waybill : null,
            'awb_number' => $waybill !== '' ? $waybill : null,
            'courier_name' => 'Delhivery',
            'warehouse_id' => $this->pickupLocationName(),
            'tracking_url' => $waybill !== '' ? $this->publicTrackingUrl($waybill) : null,
            'tracking_status' => $package['status'] ?? 'created',
            'weight' => $shipmentData['weight'] ?? null,
            'length' => $shipmentData['shipment_length'] ?? null,
            'breadth' => $shipmentData['shipment_width'] ?? null,
            'height' => $shipmentData['shipment_height'] ?? null,
            'api_response' => $response,
        ];
    }

    /**
     * @param  array<string, mixed>  $response
     * @return array{status: ?string, remarks: ?string, delivery_date: ?string}
     */
    private function extractTrackingPayload(array $response): array
    {
        $shipment = data_get($response, 'ShipmentData.0.Shipment', []);

        if (! is_array($shipment) || $shipment === []) {
            $shipment = $response['Shipment'] ?? $response;
        }

        $statusBlock = is_array($shipment['Status'] ?? null) ? $shipment['Status'] : [];
        $status = $statusBlock['Status'] ?? $shipment['status'] ?? $response['status'] ?? null;
        $remarks = $statusBlock['Instructions'] ?? $statusBlock['StatusType'] ?? $shipment['Remarks'] ?? null;
        $deliveryDate = $shipment['DeliveryDate'] ?? $statusBlock['StatusDateTime'] ?? null;

        if (is_string($deliveryDate) && ! $this->isDeliveredStatus((string) $status)) {
            $deliveryDate = null;
        }

        return [
            'status' => is_string($status) ? $status : null,
            'remarks' => is_string($remarks) ? $remarks : null,
            'delivery_date' => is_string($deliveryDate) ? $deliveryDate : null,
        ];
    }

    /**
     * @param  array<string, mixed>  $form
     */
    private function sendForm(string $method, string $endpoint, array $form): Response
    {
        return $this->send($method, $endpoint, $form, asForm: true);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function sendJson(string $method, string $endpoint, array $payload): Response
    {
        return $this->send($method, $endpoint, $payload, asForm: false);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function send(string $method, string $endpoint, array $payload, bool $asForm): Response
    {
        $token = $this->token();

        if ($token === '') {
            throw new DelhiveryApiException('DELHIVERY_API_TOKEN is not configured.');
        }

        $request = Http::baseUrl($this->baseUrl())
            ->acceptJson()
            ->withToken($token, 'Token')
            ->timeout($this->timeout());

        $request = $asForm ? $request->asForm() : $request->asJson();

        try {
            $path = ltrim($endpoint, '/');

            $response = match (strtoupper($method)) {
                'GET' => $request->get($path, $payload),
                'PUT' => $request->put($path, $payload),
                'PATCH' => $request->patch($path, $payload),
                'DELETE' => $request->delete($path, $payload),
                default => $request->post($path, $payload),
            };
        } catch (ConnectionException $exception) {
            $this->logApiCall($endpoint, $method, $payload, null, 0, $exception->getMessage());

            throw new DelhiveryApiException('Delhivery API connection timed out.', 0, null, $exception);
        }

        $json = $response->json();
        $error = $response->successful() ? null : $this->extractErrorMessage(
            is_array($json) ? $json : null,
            $response->body(),
        );

        $this->logApiCall(
            $endpoint,
            $method,
            $payload,
            is_array($json) ? $json : ['raw' => Str::limit($response->body(), 2000)],
            $response->status(),
            $error,
            $response->transferStats?->getTransferTime() ?? null,
        );

        return $response;
    }

    /**
     * @return array<string, mixed>
     */
    private function jsonOrFail(Response $response, string $action): array
    {
        $json = $response->json();

        if ($response->failed()) {
            throw new DelhiveryApiException(
                $this->extractErrorMessage(
                    is_array($json) ? $json : null,
                    $response->body(),
                    "Delhivery {$action} request failed.",
                ),
                $response->status(),
                is_array($json) ? $json : null,
            );
        }

        if (! is_array($json)) {
            throw new DelhiveryApiException(
                "Delhivery {$action} returned a non-JSON response.",
                $response->status(),
            );
        }

        return $json;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>|null  $responseBody
     */
    private function logApiCall(
        string $endpoint,
        string $method,
        array $payload,
        ?array $responseBody,
        int $status,
        ?string $errorMessage,
        ?float $transferTime = null,
    ): void {
        $durationMs = $transferTime !== null ? (int) round($transferTime * 1000) : null;

        try {
            ShippingApiLog::query()->create([
                'order_id' => $this->logOrderId,
                'shipping_shipment_id' => $this->logShipmentId,
                'endpoint' => $endpoint,
                'method' => strtoupper($method),
                'response_status' => $status > 0 ? $status : null,
                'request_headers' => ['Authorization' => 'Token [redacted]'],
                'request_body' => $this->sanitizeLogPayload($payload),
                'response_body' => $responseBody,
                'duration_ms' => $durationMs,
                'error_message' => $errorMessage,
                'created_at' => now(),
            ]);
        } catch (Throwable $exception) {
            Log::channel('delhivery')->warning('Failed to persist Delhivery API log', [
                'endpoint' => $endpoint,
                'message' => $exception->getMessage(),
            ]);
        }

        Log::channel('delhivery')->info('Delhivery API call', [
            'endpoint' => $endpoint,
            'method' => $method,
            'status' => $status,
            'order_id' => $this->logOrderId,
            'shipment_id' => $this->logShipmentId,
            'duration_ms' => $durationMs,
            'error' => $errorMessage,
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function sanitizeLogPayload(array $payload): array
    {
        unset($payload['token'], $payload['api_token']);

        if (isset($payload['data']) && is_string($payload['data'])) {
            $decoded = json_decode($payload['data'], true);

            if (is_array($decoded)) {
                $payload['data'] = $decoded;
            }
        }

        return $payload;
    }

    private function usingLogContext(?Order $order, ?ShippingShipment $shipment): void
    {
        $this->logOrderId = $order?->id;
        $this->logShipmentId = $shipment?->id;
    }

    /**
     * @param  array<string, mixed>  $response
     * @return array<string, mixed>
     */
    private function firstPackage(array $response): array
    {
        $packages = $response['packages'] ?? $response['package'] ?? [];

        if (isset($packages[0]) && is_array($packages[0])) {
            return $packages[0];
        }

        return is_array($packages) && $packages !== [] && ! array_is_list($packages)
            ? $packages
            : [];
    }

    /**
     * @param  array<string, mixed>  $response
     * @param  array<string, mixed>  $package
     */
    private function packageFailed(array $response, array $package): bool
    {
        $packageStatus = Str::lower((string) ($package['status'] ?? ''));

        if (in_array($packageStatus, ['fail', 'failed', 'error', 'failure'], true)) {
            return true;
        }

        if (array_key_exists('success', $response) && $response['success'] === false) {
            return true;
        }

        return false;
    }

    /**
     * @param  array<string, mixed>|null  $json
     */
    private function extractErrorMessage(?array $json, ?string $fallbackBody = null, string $default = 'Unknown Delhivery error.'): string
    {
        if (is_array($json)) {
            $package = $this->firstPackage($json);
            $remarks = $package['remarks'] ?? null;

            if (is_array($remarks)) {
                $joined = collect($remarks)->filter(fn ($item) => is_string($item) && trim($item) !== '')->implode('; ');

                if ($joined !== '') {
                    return $joined;
                }
            }

            if (is_string($remarks) && trim($remarks) !== '') {
                return trim($remarks);
            }

            foreach (['rmk', 'remark', 'message', 'error', 'Error', 'detail'] as $key) {
                $value = $json[$key] ?? null;

                if (is_string($value) && trim($value) !== '') {
                    return trim($value);
                }
            }
        }

        if (is_string($fallbackBody) && trim($fallbackBody) !== '' && ! str_starts_with(trim($fallbackBody), '{')) {
            return Str::limit(trim(strip_tags($fallbackBody)), 500);
        }

        return $default;
    }

    private function recordShipmentTracking(Order $order, ShippingShipment $shipment): void
    {
        $remarks = collect([
            $shipment->courier_name ? 'Courier: '.$shipment->courier_name : null,
            $shipment->awb_number ? 'AWB: '.$shipment->awb_number : null,
        ])->filter()->implode('. ');

        $this->appendTrackingEvent($order, 'shipment_created', $remarks !== '' ? $remarks : 'Shipment created in Delhivery.');

        if (! $shipment->hasAwb()) {
            return;
        }

        if ($order->order_status === 'pending') {
            $order->update(['order_status' => 'confirmed']);
            $this->appendTrackingEvent(
                $order,
                'confirmed',
                $order->payment_method === 'cod'
                    ? 'COD order confirmed. Payment due on delivery.'
                    : 'Order confirmed.',
            );
            $order->refresh();
        }

        if ($order->order_status === 'confirmed') {
            $order->update(['order_status' => 'processing']);
            $this->appendTrackingEvent($order, 'processing', 'Order is being prepared for dispatch.');
        }
    }

    private function appendTrackingEvent(Order $order, string $status, string $remarks): void
    {
        $latest = $order->trackings()->latest('id')->first();

        if ($latest && $latest->status === $status && $latest->remarks === $remarks) {
            return;
        }

        OrderTracking::query()->create([
            'order_id' => $order->id,
            'status' => $status,
            'remarks' => $remarks,
        ]);
    }

    private function syncOrderStatusFromTracking(Order $order, string $trackingStatus): void
    {
        $normalized = Str::lower(str_replace([' ', '-'], '_', $trackingStatus));

        $mapped = match (true) {
            str_contains($normalized, 'deliver') => 'delivered',
            str_contains($normalized, 'out_for_delivery') => 'shipped',
            str_contains($normalized, 'transit') => 'shipped',
            str_contains($normalized, 'manifest') => 'processing',
            str_contains($normalized, 'ship') => 'shipped',
            str_contains($normalized, 'pickup') => 'processing',
            str_contains($normalized, 'cancel') => 'cancelled',
            default => null,
        };

        if ($mapped === null || $order->order_status === $mapped) {
            return;
        }

        if (! $this->canApplyTrackingStatus($order->order_status, $mapped)) {
            return;
        }

        $updates = ['order_status' => $mapped];

        if (
            $mapped === 'delivered'
            && $order->payment_method === 'cod'
            && $order->payment_status === 'pending'
        ) {
            $updates['payment_status'] = 'paid';
        }

        $order->update($updates);
        $this->appendTrackingEvent($order, $mapped, 'Order status updated from Delhivery tracking.');

        if (isset($updates['payment_status'])) {
            $this->appendTrackingEvent($order, 'payment_collected', 'Cash on delivery payment collected.');
        }
    }

    private function canApplyTrackingStatus(string $current, string $mapped): bool
    {
        if ($current === 'cancelled') {
            return false;
        }

        if ($current === 'delivered') {
            return false;
        }

        if ($mapped === 'cancelled') {
            return true;
        }

        return $this->fulfillmentRank($mapped) > $this->fulfillmentRank($current);
    }

    private function fulfillmentRank(string $status): int
    {
        return match ($status) {
            'pending', 'pending_payment' => 0,
            'confirmed' => 1,
            'processing' => 2,
            'shipped' => 3,
            'delivered' => 4,
            default => -1,
        };
    }

    private function isDeliveredStatus(string $status): bool
    {
        return str_contains(Str::lower($status), 'deliver');
    }

    private function resolvePackageWeight(Order $order): float
    {
        $productIds = $order->items->pluck('product_id')->filter()->unique()->values();
        $weights = Product::query()->whereIn('id', $productIds)->pluck('weight', 'id');

        $total = 0.0;

        foreach ($order->items as $item) {
            $weight = (float) ($weights[$item->product_id] ?? 0);
            $total += max($weight, 0) * $item->quantity;
        }

        return max($total, $this->defaultWeight());
    }

    /**
     * @param  array<string, mixed>  $address
     */
    private function fullAddress(array $address): string
    {
        $line = collect([
            $address['address_line_1'] ?? null,
            $address['address_line_2'] ?? null,
            $address['landmark'] ?? null,
        ])->filter(fn ($part) => filled($part))->implode(', ');

        return $line !== '' ? $line : 'Address not provided';
    }

    /**
     * @param  array<string, mixed>  $address
     */
    private function phone(array $address, Order $order): string
    {
        $raw = (string) ($address['phone'] ?? $order->user?->phone ?? '');
        $normalized = IndianMobileNumber::normalize($raw);

        return $normalized ?? preg_replace('/\D+/', '', $raw) ?? '';
    }

    private function publicTrackingUrl(string $waybill): string
    {
        return 'https://www.delhivery.com/track/package/'.$waybill;
    }

    private function token(): string
    {
        return trim((string) config('services.delhivery.token', ''));
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.delhivery.base_url', 'https://track.delhivery.com'), '/');
    }

    private function pickupLocationName(): string
    {
        return (string) config('services.delhivery.pickup_location', 'BHULIKA B2C');
    }

    private function sellerGstTin(): string
    {
        return (string) config('services.delhivery.seller_gst_tin', '21AAPCB0914N1Z1');
    }

    private function hsnCode(): string
    {
        return (string) config('services.delhivery.hsn_code', '6109');
    }

    private function timeout(): int
    {
        return (int) config('services.delhivery.timeout', 30);
    }

    private function defaultWeight(): float
    {
        return (float) config('services.delhivery.default_weight_kg', 0.5);
    }

    private function defaultLength(): float
    {
        return (float) config('services.delhivery.default_length_cm', 25);
    }

    private function defaultWidth(): float
    {
        return (float) config('services.delhivery.default_width_cm', 20);
    }

    private function defaultHeight(): float
    {
        return (float) config('services.delhivery.default_height_cm', 5);
    }
}
