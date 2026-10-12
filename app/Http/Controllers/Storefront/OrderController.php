<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('user_id', $request->user()?->id)
            ->where('order_status', '!=', 'pending_payment')
            ->where(function ($query) {
                $query->where('order_status', '!=', 'cancelled')
                    ->orWhereIn('payment_status', ['paid', 'refunded']);
            })
            ->latest('placed_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('account/orders/index', [
            'orders' => [
                'data' => $orders->through(fn (Order $order) => [
                    'orderNumber' => $order->order_number,
                    'placedAt' => $order->placed_at?->toISOString(),
                    'grandTotal' => (float) $order->grand_total,
                    'orderStatus' => $order->order_status,
                    'paymentStatus' => $order->payment_status,
                    'paymentMethod' => $order->payment_method,
                    'estimatedDeliveryDate' => $order->estimated_delivery_date?->toFormattedDateString(),
                ])->items(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
                'next_page_url' => $orders->nextPageUrl(),
                'prev_page_url' => $orders->previousPageUrl(),
            ],
        ]);
    }

    public function show(Request $request, string $orderNumber): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->where('user_id', $request->user()?->id)
            ->with(['items', 'trackings', 'payments', 'shipment'])
            ->firstOrFail();

        $shipment = $order->shipment;

        return Inertia::render('account/orders/show', [
            'order' => [
                'orderNumber' => $order->order_number,
                'placedAt' => $order->placed_at?->toISOString(),
                'grandTotal' => (float) $order->grand_total,
                'subtotal' => (float) $order->subtotal,
                'couponDiscount' => (float) $order->coupon_discount,
                'shippingCharge' => (float) $order->shipping_charge,
                'orderStatus' => $order->order_status,
                'paymentStatus' => $order->payment_status,
                'paymentMethod' => $order->payment_method,
                'estimatedDeliveryDate' => $order->estimated_delivery_date?->toFormattedDateString(),
                'couponCode' => $order->coupon_code,
                'items' => $order->items->map(fn ($item) => [
                    'name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'salePrice' => (float) $item->sale_price,
                    'variantLabel' => $item->variant_label,
                ])->values()->all(),
                'trackings' => $order->trackings->sortBy('created_at')->values()->map(fn ($tracking) => [
                    'status' => $tracking->status,
                    'remarks' => $tracking->remarks,
                    'createdAt' => $tracking->created_at?->toISOString(),
                ])->all(),
                'paymentId' => $order->payments->sortByDesc('id')->first()?->razorpay_payment_id,
                'shipment' => $shipment ? [
                    'status' => $shipment->tracking_status ?? $shipment->shipment_status,
                    'courierName' => $shipment->courier_name,
                    'awbNumber' => $shipment->awb_number,
                    'trackingUrl' => $shipment->tracking_url,
                    'estimatedDeliveryDate' => $order->estimated_delivery_date?->toFormattedDateString(),
                ] : null,
            ],
        ]);
    }
}
