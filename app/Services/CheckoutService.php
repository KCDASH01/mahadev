<?php

namespace App\Services;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(
        private BuyNowService $buyNow,
        private CartService $cart,
        private CartTotalsService $totals,
        private CouponService $coupons,
        private ShippingService $shipping,
    ) {}

    public function isBuyNow(Request $request): bool
    {
        return $this->buyNow->isActive($request);
    }

    public function mode(Request $request): string
    {
        return $this->isBuyNow($request) ? 'buy_now' : 'cart';
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function lineItems(Request $request, StorefrontProductService $products): array
    {
        if ($this->isBuyNow($request)) {
            return $this->buyNow->formattedLineItems($request, $products);
        }

        return $this->cart->formattedLineItems($request, $products);
    }

    public function clearBuyNowForCartCheckout(Request $request): void
    {
        $this->buyNow->clear($request);
    }

    public function completeCheckout(Request $request): void
    {
        if ($this->isBuyNow($request)) {
            $this->buyNow->clear($request);

            return;
        }

        $this->cart->clear($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function pagePayload(Request $request, StorefrontProductService $products): array
    {
        $isBuyNow = $this->isBuyNow($request);
        $lineItems = $this->lineItems($request, $products);
        $coupon = $isBuyNow ? null : $this->cart->appliedCoupon($request);

        if ($coupon && $lineItems !== []) {
            try {
                $this->coupons->assertCouponIsUsable($coupon, $lineItems, $request->user());
            } catch (ValidationException) {
                $this->cart->removeCoupon($request);
                $coupon = null;
            }
        }

        $totals = $this->totals->calculate($lineItems, $coupon);
        $addresses = $request->user()
            ? $request->user()->addresses()->orderByDesc('is_default')->latest()->get()
            : collect();

        $selectedAddressId = $this->cart->selectedAddressId($request);

        if (! $selectedAddressId && $addresses->isNotEmpty()) {
            $selectedAddressId = $addresses->firstWhere('is_default', true)?->id
                ?? $addresses->first()?->id;

            if ($selectedAddressId) {
                $this->cart->setSelectedAddress($request, $selectedAddressId);
            }
        }

        return [
            'checkoutMode' => $isBuyNow ? 'buy_now' : 'cart',
            'cartItems' => $lineItems,
            'cartTotals' => $totals,
            'availableOffers' => $isBuyNow
                ? []
                : $this->coupons->activeOffers()
                    ->map(fn (Coupon $offer) => $this->coupons->formatOffer($offer))
                    ->values()
                    ->all(),
            'appliedCoupon' => $coupon ? [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'title' => $coupon->title ?: $coupon->code,
            ] : null,
            'addresses' => $addresses->map(fn ($address) => $this->cart->formatAddress($address))->values()->all(),
            'selectedAddressId' => $selectedAddressId,
            'estimatedDeliveryDate' => $this->shipping->estimatedDeliveryDate()->toFormattedDateString(),
        ];
    }
}
