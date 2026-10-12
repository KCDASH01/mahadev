<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderTracking;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class OrderService
{
    public function __construct(
        private CartService $cart,
        private CheckoutService $checkout,
        private CartTotalsService $totals,
        private CouponService $coupons,
        private StorefrontProductService $products,
        private RazorpayService $razorpay,
        private ShippingService $shipping,
        private DelhiveryService $delhivery,
    ) {}

    /**
     * @return array{
     *     user: User,
     *     lineItems: array<int, array<string, mixed>>,
     *     address: UserAddress,
     *     coupon: ?Coupon,
     *     totals: array<string, mixed>
     * }
     */
    public function validateCheckout(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            throw ValidationException::withMessages([
                'checkout' => __('Please log in to place an order.'),
            ]);
        }

        $lineItems = $this->checkout->lineItems($request, $this->products);
        $isBuyNow = $this->checkout->isBuyNow($request);

        if ($lineItems === []) {
            throw ValidationException::withMessages([
                'checkout' => $isBuyNow
                    ? __('Your buy now session has expired. Please try again.')
                    : __('Your cart is empty.'),
            ]);
        }

        $addressId = $this->cart->selectedAddressId($request);

        if (! $addressId) {
            throw ValidationException::withMessages([
                'address_id' => __('Please select a delivery address.'),
            ]);
        }

        /** @var UserAddress $address */
        $address = UserAddress::query()
            ->where('user_id', $user->id)
            ->findOrFail($addressId);

        $coupon = $isBuyNow ? null : $this->cart->appliedCoupon($request);

        if ($coupon) {
            $this->coupons->assertCouponIsUsable($coupon, $lineItems, $user);
        }

        foreach ($lineItems as $lineItem) {
            $this->assertStockForLineItem($lineItem);
        }

        $totals = $this->totals->calculate($lineItems, $coupon);

        return compact('user', 'lineItems', 'address', 'coupon', 'totals');
    }

    /**
     * @param  array{
     *     user: User,
     *     lineItems: array<int, array<string, mixed>>,
     *     address: UserAddress,
     *     coupon: ?Coupon,
     *     totals: array<string, mixed>
     * }  $context
     * @return array{order: Order, payment: Payment, checkout: array<string, mixed>}
     */
    public function createPendingOrder(Request $request, array $context): array
    {
        return DB::transaction(function () use ($request, $context): array {
            $user = $context['user'];
            $lineItems = $context['lineItems'];
            $address = $context['address'];
            $coupon = $context['coupon'];
            $totals = $context['totals'];

            $this->cancelPendingPaymentOrdersForUser($user->id);

            $placedAt = now();

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $user->id,
                'address_id' => $address->id,
                'shipping_address_snapshot' => $this->cart->formatAddress($address),
                'coupon_id' => $coupon?->id,
                'coupon_code' => $coupon?->code,
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['productDiscount'],
                'coupon_discount' => $totals['couponDiscount'],
                'shipping_charge' => $totals['shipping'],
                'tax_amount' => $totals['taxAmount'],
                'grand_total' => $totals['grandTotal'],
                'payment_method' => 'razorpay',
                'payment_status' => 'pending',
                'order_status' => 'pending_payment',
                'placed_at' => $placedAt,
                'estimated_delivery_date' => $this->shipping->estimatedDeliveryDate($placedAt),
            ]);

            $this->createOrderItems($order, $lineItems);

            OrderTracking::query()->create([
                'order_id' => $order->id,
                'status' => 'order_placed',
                'remarks' => 'Order placed. Awaiting payment.',
            ]);

            $razorpayOrder = $this->razorpay->createOrder($order);

            $payment = Payment::query()->create([
                'order_id' => $order->id,
                'payment_gateway' => 'razorpay',
                'razorpay_order_id' => $razorpayOrder['id'],
                'amount' => $order->grand_total,
                'currency' => 'INR',
                'status' => 'pending',
            ]);

            $request->session()->put('storefront.checkout.pending_order', $order->order_number);

            Log::info('Pending order created for checkout', [
                'order_number' => $order->order_number,
                'user_id' => $user->id,
                'grand_total' => $order->grand_total,
            ]);

            return [
                'order' => $order,
                'payment' => $payment,
                'checkout' => $this->razorpay->checkoutPayload($order, $payment, $user, $address),
            ];
        });
    }

    /**
     * Create a Cash on Delivery order directly (no payment gateway).
     *
     * @param  array{
     *     user: User,
     *     lineItems: array<int, array<string, mixed>>,
     *     address: UserAddress,
     *     coupon: ?Coupon,
     *     totals: array<string, mixed>
     * }  $context
     */
    public function abandonPendingPayment(Request $request, string $orderNumber): void
    {
        $user = $request->user();

        if (! $user) {
            return;
        }

        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->where('payment_status', 'pending')
            ->whereIn('order_status', ['pending_payment', 'cancelled'])
            ->first();

        if (! $order) {
            $request->session()->forget('storefront.checkout.pending_order');

            return;
        }

        $order->items()->delete();
        $order->trackings()->delete();
        $order->payments()->delete();
        $order->delete();

        $request->session()->forget('storefront.checkout.pending_order');

        Log::info('Pending payment order abandoned and deleted', [
            'order_number' => $orderNumber,
            'user_id' => $user->id,
        ]);
    }

    public function createCodOrder(Request $request, array $context): Order
    {
        $order = DB::transaction(function () use ($request, $context): Order {
            $user = $context['user'];
            $lineItems = $context['lineItems'];
            $address = $context['address'];
            $coupon = $context['coupon'];
            $totals = $context['totals'];

            $this->cancelPendingPaymentOrdersForUser($user->id);

            $placedAt = now();

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $user->id,
                'address_id' => $address->id,
                'shipping_address_snapshot' => $this->cart->formatAddress($address),
                'coupon_id' => $coupon?->id,
                'coupon_code' => $coupon?->code,
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['productDiscount'],
                'coupon_discount' => $totals['couponDiscount'],
                'shipping_charge' => $totals['shipping'],
                'tax_amount' => $totals['taxAmount'],
                'grand_total' => $totals['grandTotal'],
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'order_status' => 'confirmed',
                'placed_at' => $placedAt,
                'estimated_delivery_date' => $this->shipping->estimatedDeliveryDate($placedAt),
            ]);

            $this->createOrderItems($order, $lineItems);

            foreach ($order->items as $item) {
                $this->decrementStockForOrderItem($item);
            }

            if ($coupon) {
                $this->coupons->recordUsage($coupon, $order, $user, (float) $totals['couponDiscount']);
            }

            OrderTracking::query()->create([
                'order_id' => $order->id,
                'status' => 'order_placed',
                'remarks' => 'Order placed with Cash on Delivery.',
            ]);

            OrderTracking::query()->create([
                'order_id' => $order->id,
                'status' => 'confirmed',
                'remarks' => 'Order confirmed. Pay cash on delivery when your order arrives.',
            ]);

            $this->checkout->completeCheckout($request);

            Log::info('COD order created', [
                'order_number' => $order->order_number,
                'user_id' => $user->id,
                'grand_total' => $order->grand_total,
            ]);

            return $order->fresh(['items', 'address']);
        });

        $this->delhivery->tryCreateShipmentForOrder($order);

        return $order->fresh(['items', 'address', 'shipment']);
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     */
    private function createOrderItems(Order $order, array $lineItems): void
    {
        foreach ($lineItems as $lineItem) {
            $variantLabel = trim(($lineItem['color'] ?? '').' / '.($lineItem['size'] ?? ''), ' /');

            OrderItem::query()->create([
                'order_id' => $order->id,
                'product_id' => $lineItem['product']['id'],
                'variant_id' => $lineItem['variantId'],
                'product_name' => $lineItem['product']['name'],
                'sku' => $this->resolveSku($lineItem),
                'variant_label' => $variantLabel !== '' ? $variantLabel : null,
                'original_price' => $lineItem['product']['originalPrice'],
                'sale_price' => $lineItem['product']['price'],
                'quantity' => $lineItem['quantity'],
                'subtotal' => round($lineItem['product']['price'] * $lineItem['quantity'], 2),
            ]);
        }

        $order->load('items');
    }

    public function confirmPayment(
        Order $order,
        Payment $payment,
        string $razorpayPaymentId,
        string $razorpayOrderId,
        string $razorpaySignature,
        Request $request,
    ): Order {
        if ($order->payment_status === 'paid') {
            return $order->load(['items', 'address', 'payments', 'shipment']);
        }

        $order = DB::transaction(function () use (
            $order,
            $payment,
            $razorpayPaymentId,
            $razorpayOrderId,
            $razorpaySignature,
            $request,
        ): Order {
            $order = Order::query()->with('items')->whereKey($order->id)->lockForUpdate()->firstOrFail();
            $payment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();

            if ($order->payment_status === 'paid') {
                return $order->load(['items', 'address', 'payments']);
            }

            if ($payment->status === 'paid') {
                throw new RuntimeException('Payment has already been processed.');
            }

            if ($payment->razorpay_order_id !== $razorpayOrderId) {
                throw new RuntimeException('Invalid Razorpay order reference.');
            }

            $this->razorpay->verifyPaymentSignature(
                $razorpayOrderId,
                $razorpayPaymentId,
                $razorpaySignature,
            );

            $this->razorpay->assertPaymentAmount($razorpayPaymentId, (float) $order->grand_total);

            foreach ($order->items as $item) {
                $this->assertStockForOrderItem($item);
            }

            $payment->update([
                'razorpay_payment_id' => $razorpayPaymentId,
                'razorpay_signature' => $razorpaySignature,
                'transaction_id' => $razorpayPaymentId,
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            $order->update([
                'payment_status' => 'paid',
                'order_status' => 'confirmed',
                'transaction_id' => $razorpayPaymentId,
            ]);

            foreach ($order->items as $item) {
                $this->decrementStockForOrderItem($item);
            }

            if ($order->coupon_id) {
                $coupon = Coupon::query()->find($order->coupon_id);

                if ($coupon) {
                    $this->coupons->recordUsage(
                        $coupon,
                        $order,
                        $order->user,
                        (float) $order->coupon_discount,
                    );
                }
            }

            OrderTracking::query()->create([
                'order_id' => $order->id,
                'status' => 'payment_successful',
                'remarks' => 'Payment received via Razorpay.',
            ]);

            OrderTracking::query()->create([
                'order_id' => $order->id,
                'status' => 'confirmed',
                'remarks' => 'Order confirmed and processing.',
            ]);

            $this->checkout->completeCheckout($request);
            $request->session()->forget('storefront.checkout.pending_order');

            Log::info('Order payment confirmed', [
                'order_number' => $order->order_number,
                'razorpay_payment_id' => $razorpayPaymentId,
            ]);

            return $order->fresh(['items', 'address', 'payments']);
        });

        $this->delhivery->tryCreateShipmentForOrder($order);

        return $order->fresh(['items', 'address', 'payments', 'shipment']);
    }

    /**
     * @return array{order: Order, payment: Payment, checkout: array<string, mixed>}
     */
    public function retryPendingOrder(Request $request, string $orderNumber): array
    {
        $user = $request->user();

        if (! $user) {
            throw ValidationException::withMessages([
                'checkout' => __('Please log in to retry payment.'),
            ]);
        }

        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->where('payment_status', 'pending')
            ->where('order_status', 'pending_payment')
            ->with(['items', 'address'])
            ->firstOrFail();

        foreach ($order->items as $item) {
            $this->assertStockForOrderItem($item);
        }

        $address = UserAddress::withTrashed()->findOrFail($order->address_id);
        $razorpayOrder = $this->razorpay->createOrder($order);

        $payment = Payment::query()->create([
            'order_id' => $order->id,
            'payment_gateway' => 'razorpay',
            'razorpay_order_id' => $razorpayOrder['id'],
            'amount' => $order->grand_total,
            'currency' => 'INR',
            'status' => 'pending',
        ]);

        $request->session()->put('storefront.checkout.pending_order', $order->order_number);

        return [
            'order' => $order,
            'payment' => $payment,
            'checkout' => $this->razorpay->checkoutPayload($order, $payment, $user, $address),
        ];
    }

    public function markPaymentFailed(Order $order, ?string $reason = null): void
    {
        if ($order->payment_status === 'paid') {
            return;
        }

        OrderTracking::query()->create([
            'order_id' => $order->id,
            'status' => 'payment_failed',
            'remarks' => $reason ?: 'Payment was not completed.',
        ]);

        Log::warning('Order payment failed or dismissed', [
            'order_number' => $order->order_number,
            'reason' => $reason,
        ]);
    }

    /**
     * Admin: change the fulfillment status and record it in the history.
     */
    public function updateOrderStatus(Order $order, string $status, ?string $remarks = null): Order
    {
        if ($status === 'cancelled') {
            $this->delhivery->cancelShipmentForOrder($order->loadMissing('shipment'));
            $order->refresh();
        }

        if ($order->order_status === $status) {
            return $order;
        }

        $previous = $order->order_status;

        $order->update(['order_status' => $status]);

        OrderTracking::query()->create([
            'order_id' => $order->id,
            'status' => $status,
            'remarks' => $remarks ?: __('Order status updated from :from to :to by admin.', [
                'from' => $previous,
                'to' => $status,
            ]),
        ]);

        return $order;
    }

    /**
     * Admin: change the payment status (e.g. COD paid on delivery).
     */
    public function updatePaymentStatus(Order $order, string $status, ?string $remarks = null): Order
    {
        $previous = $order->payment_status;

        $order->update(['payment_status' => $status]);

        if ($status === 'paid' && $order->payment_method === 'cod') {
            Payment::query()->updateOrCreate(
                ['order_id' => $order->id, 'payment_gateway' => 'cod'],
                ['amount' => $order->grand_total, 'currency' => 'INR', 'status' => 'paid', 'paid_at' => now()],
            );
        }

        OrderTracking::query()->create([
            'order_id' => $order->id,
            'status' => 'payment_'.$status,
            'remarks' => $remarks ?: __('Payment status updated from :from to :to by admin.', [
                'from' => $previous,
                'to' => $status,
            ]),
        ]);

        return $order;
    }

    private function generateOrderNumber(): string
    {
        do {
            $number = 'H2S-'.now()->format('ymd').'-'.strtoupper(Str::random(6));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }

    /**
     * @param  array<string, mixed>  $lineItem
     */
    private function resolveSku(array $lineItem): string
    {
        if (! empty($lineItem['variantId'])) {
            $variant = ProductVariant::query()->find($lineItem['variantId']);

            if ($variant?->sku) {
                return $variant->sku;
            }
        }

        return 'HS-'.str_pad((string) $lineItem['product']['id'], 4, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $lineItem
     */
    private function assertStockForLineItem(array $lineItem): void
    {
        if (! empty($lineItem['variantId'])) {
            $variant = ProductVariant::query()->find($lineItem['variantId']);

            if (! $variant || $variant->stock < $lineItem['quantity']) {
                throw ValidationException::withMessages([
                    'checkout' => __(':name is no longer available in the requested quantity.', [
                        'name' => $lineItem['product']['name'],
                    ]),
                ]);
            }

            return;
        }

        $product = Product::query()->find($lineItem['product']['id']);

        if (! $product || $product->stock < $lineItem['quantity']) {
            throw ValidationException::withMessages([
                'checkout' => __(':name is no longer available in the requested quantity.', [
                    'name' => $lineItem['product']['name'],
                ]),
            ]);
        }
    }

    private function assertStockForOrderItem(OrderItem $item): void
    {
        if ($item->variant_id) {
            $variant = ProductVariant::query()->find($item->variant_id);

            if (! $variant || $variant->stock < $item->quantity) {
                throw ValidationException::withMessages([
                    'checkout' => __(':name is no longer available in the requested quantity.', [
                        'name' => $item->product_name,
                    ]),
                ]);
            }

            return;
        }

        $product = Product::query()->find($item->product_id);

        if (! $product || $product->stock < $item->quantity) {
            throw ValidationException::withMessages([
                'checkout' => __(':name is no longer available in the requested quantity.', [
                    'name' => $item->product_name,
                ]),
            ]);
        }
    }

    private function decrementStockForOrderItem(OrderItem $item): void
    {
        if ($item->variant_id) {
            ProductVariant::query()
                ->whereKey($item->variant_id)
                ->decrement('stock', (int) $item->quantity);

            return;
        }

        Product::query()
            ->whereKey($item->product_id)
            ->decrement('stock', (int) $item->quantity);
    }

    private function cancelPendingPaymentOrdersForUser(int $userId): void
    {
        $pendingOrders = Order::query()
            ->where('user_id', $userId)
            ->where('payment_status', 'pending')
            ->whereIn('order_status', ['pending_payment', 'cancelled'])
            ->where('payment_method', 'razorpay')
            ->get();

        foreach ($pendingOrders as $order) {
            $order->items()->delete();
            $order->trackings()->delete();
            $order->payments()->delete();
            $order->delete();
        }
    }
}
