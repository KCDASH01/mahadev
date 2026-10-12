<?php

namespace App\Services;

use App\Models\Coupon;

class CartTotalsService
{
    public function __construct(
        private CouponService $coupons,
        private ShippingService $shipping,
    ) {}

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     * @return array<string, float|int|string|bool|null>
     */
    public function calculate(array $lineItems, ?Coupon $coupon = null): array
    {
        $subtotal = round(collect($lineItems)->sum(
            fn (array $item) => (float) $item['product']['price'] * (int) $item['quantity'],
        ), 2);

        $mrpTotal = round(collect($lineItems)->sum(
            fn (array $item) => (float) $item['product']['originalPrice'] * (int) $item['quantity'],
        ), 2);

        $productDiscount = round(max(0, $mrpTotal - $subtotal), 2);
        $couponDiscount = 0.0;
        $freeShipping = false;

        if ($coupon && $lineItems !== []) {
            try {
                $couponDiscount = $this->coupons->calculateDiscount($coupon, $lineItems);
                $freeShipping = $coupon->type === Coupon::TYPE_FREE_SHIPPING;
            } catch (\Throwable) {
                $couponDiscount = 0.0;
            }
        }

        $shipping = $this->shippingCharge($subtotal, $couponDiscount, $freeShipping);
        $taxAmount = $this->taxAmount($subtotal - $couponDiscount);
        $grandTotal = round(max(0, $subtotal - $couponDiscount + $shipping), 2);
        $totalSavings = round($productDiscount + $couponDiscount, 2);
        $totalQuantity = (int) collect($lineItems)->sum('quantity');

        return [
            'subtotal' => $subtotal,
            'mrpTotal' => $mrpTotal,
            'productDiscount' => $productDiscount,
            'couponDiscount' => round($couponDiscount, 2),
            'shipping' => $shipping,
            'shippingLabel' => $shipping <= 0 ? 'FREE' : '₹'.number_format($shipping, 0),
            'taxAmount' => $taxAmount,
            'taxLabel' => 'Included',
            'grandTotal' => $grandTotal,
            'totalSavings' => $totalSavings,
            'itemCount' => count($lineItems),
            'totalQuantity' => $totalQuantity,
            'freeShipping' => $freeShipping || $shipping <= 0,
        ];
    }

    private function shippingCharge(float $subtotal, float $couponDiscount, bool $freeShipping): float
    {
        if ($freeShipping || $subtotal <= 0) {
            return 0.0;
        }

        $netSubtotal = max(0, $subtotal - $couponDiscount);

        return $this->shipping->chargeForSubtotal($netSubtotal);
    }

    private function taxAmount(float $taxableAmount): float
    {
        if ($taxableAmount <= 0) {
            return 0.0;
        }

        return round($taxableAmount - ($taxableAmount / 1.05), 2);
    }
}
