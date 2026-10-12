<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\VerifyPaymentRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Services\CheckoutService;
use App\Services\OrderService;
use App\Services\ShippingService;
use App\Services\StorefrontProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CheckoutController extends Controller
{
    public function index(
        Request $request,
        CheckoutService $checkout,
        StorefrontProductService $products,
        ShippingService $shipping,
    ): Response|RedirectResponse {
        if ($request->query('source') === 'cart') {
            $checkout->clearBuyNowForCartCheckout($request);
        }

        $payload = $checkout->pagePayload($request, $products);
        $isBuyNow = ($payload['checkoutMode'] ?? 'cart') === 'buy_now';

        if (($payload['cartItems'] ?? []) === []) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $isBuyNow
                    ? __('Your buy now session has expired. Please select the product again.')
                    : __('Your cart is empty.'),
            ]);

            return redirect()->route($isBuyNow ? 'home' : 'cart.index');
        }

        if (! $isBuyNow && (empty($payload['addresses']) || empty($payload['selectedAddressId']))) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Please add and select a delivery address before checkout.'),
            ]);

            return redirect()->route('cart.index');
        }

        return Inertia::render('checkout/index', [
            'checkoutMode' => $payload['checkoutMode'],
            'cartTotals' => $payload['cartTotals'],
            'cartItems' => $payload['cartItems'],
            'addresses' => $payload['addresses'],
            'selectedAddressId' => $payload['selectedAddressId'],
            'appliedCoupon' => $payload['appliedCoupon'],
            'codEnabled' => $shipping->codEnabled(),
            'estimatedDeliveryDate' => $payload['estimatedDeliveryDate'],
            'deliveryDays' => $shipping->defaultDeliveryDays(),
            'preferredPaymentMethod' => $request->session()->pull('preferred_payment_method'),
        ]);
    }

    public function store(Request $request, OrderService $orders, ShippingService $shipping): RedirectResponse
    {
        $validated = $request->validate([
            'payment_method' => ['required', Rule::in(['razorpay', 'cod'])],
        ]);

        $method = $validated['payment_method'];

        if ($method === 'cod' && ! $shipping->codEnabled()) {
            throw ValidationException::withMessages([
                'payment_method' => __('Cash on Delivery is currently unavailable.'),
            ]);
        }

        $context = $orders->validateCheckout($request);

        if ($method === 'cod') {
            $order = $orders->createCodOrder($request, $context);

            return redirect()
                ->route('checkout.success', [
                    'orderNumber' => $order->order_number,
                    'placed' => 1,
                ])
                ->with('showOrderConfirmation', true);
        }

        if ((float) $context['totals']['grandTotal'] <= 0) {
            throw ValidationException::withMessages([
                'checkout' => __('Online payment requires an order total greater than zero.'),
            ]);
        }

        try {
            $result = $orders->createPendingOrder($request, $context);
        } catch (Throwable $exception) {
            report($exception);

            throw ValidationException::withMessages([
                'checkout' => __('Unable to start payment. Please try again or choose Cash on Delivery.'),
            ]);
        }

        return back()->with('razorpayCheckout', $result['checkout']);
    }

    public function verify(VerifyPaymentRequest $request, OrderService $orders): RedirectResponse
    {
        $order = Order::query()
            ->where('order_number', $request->string('order_number')->toString())
            ->where('user_id', $request->user()?->id)
            ->firstOrFail();

        $payment = Payment::query()
            ->where('order_id', $order->id)
            ->where('razorpay_order_id', $request->string('razorpay_order_id')->toString())
            ->latest('id')
            ->firstOrFail();

        try {
            $orders->confirmPayment(
                $order,
                $payment,
                $request->string('razorpay_payment_id')->toString(),
                $request->string('razorpay_order_id')->toString(),
                $request->string('razorpay_signature')->toString(),
                $request,
            );
        } catch (Throwable $exception) {
            report($exception);
            $orders->markPaymentFailed($order, $exception->getMessage());

            return redirect()->route('checkout.failed', $order->order_number)
                ->with('toast', ['type' => 'error', 'message' => __('Payment verification failed. Please try again.')]);
        }

        return redirect()
            ->route('checkout.success', [
                'orderNumber' => $order->order_number,
                'placed' => 1,
            ])
            ->with('showOrderConfirmation', true);
    }

    public function retry(Request $request, string $orderNumber, OrderService $orders): RedirectResponse
    {
        $result = $orders->retryPendingOrder($request, $orderNumber);

        return back()->with('razorpayCheckout', $result['checkout']);
    }

    public function abandon(Request $request, OrderService $orders): RedirectResponse
    {
        $validated = $request->validate([
            'order_number' => ['required', 'string'],
        ]);

        $orders->abandonPendingPayment($request, $validated['order_number']);

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => __('Payment cancelled. You can pay online again or choose Cash on Delivery.'),
        ]);

        return redirect()
            ->route('checkout.index')
            ->with('preferred_payment_method', 'cod');
    }

    public function failed(Request $request, string $orderNumber, ShippingService $shipping): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->where('user_id', $request->user()?->id)
            ->firstOrFail();

        return Inertia::render('checkout/failed', [
            'order' => $this->formatOrderSummary($order),
            'codEnabled' => $shipping->codEnabled(),
            'continueShoppingUrl' => route(config('checkout.continue_shopping_route', 'home')),
        ]);
    }

    public function success(Request $request, string $orderNumber): Response|RedirectResponse
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->where('user_id', $request->user()?->id)
            ->with(['items', 'address', 'payments'])
            ->firstOrFail();

        $isCod = $order->payment_method === 'cod';

        if ($order->payment_status !== 'paid' && ! $isCod) {
            return redirect()->route('checkout.failed', $orderNumber);
        }

        $payment = $order->payments->sortByDesc('id')->first();
        $address = $order->shipping_address_snapshot ?? [];

        return Inertia::render('checkout/success', [
            'showConfirmationPopup' => (bool) $request->session()->pull('showOrderConfirmation', false)
                || $request->query('placed') === '1',
            'order' => [
                ...$this->formatOrderSummary($order),
                'paymentId' => $payment?->razorpay_payment_id,
                'placedAt' => $order->placed_at?->toISOString(),
                'estimatedDeliveryDate' => $order->estimated_delivery_date?->toFormattedDateString(),
                'address' => [
                    'fullName' => $address['full_name'] ?? $order->address?->full_name,
                    'phone' => $address['phone'] ?? $order->address?->phone,
                    'line1' => $address['address_line_1'] ?? $order->address?->address_line_1,
                    'line2' => $address['address_line_2'] ?? $order->address?->address_line_2,
                    'city' => $address['city'] ?? $order->address?->city,
                    'state' => $address['state'] ?? $order->address?->state,
                    'pincode' => $address['pincode'] ?? $order->address?->pincode,
                ],
                'items' => $order->items->map(fn ($item) => [
                    'name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'salePrice' => (float) $item->sale_price,
                    'variantLabel' => $item->variant_label,
                ])->values()->all(),
            ],
            'continueShoppingUrl' => route(config('checkout.continue_shopping_route', 'home')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatOrderSummary(Order $order): array
    {
        return [
            'orderNumber' => $order->order_number,
            'grandTotal' => (float) $order->grand_total,
            'paymentStatus' => $order->payment_status,
            'orderStatus' => $order->order_status,
            'paymentMethod' => $order->payment_method,
        ];
    }
}
