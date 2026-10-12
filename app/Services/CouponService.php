<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CouponService
{
    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     * @return array{coupon: Coupon, discount: float, free_shipping: bool, message: string}
     */
    public function validateAndCalculate(
        string $code,
        array $lineItems,
        ?User $user = null,
    ): array {
        $coupon = Coupon::query()
            ->with(['categories', 'products'])
            ->whereRaw('UPPER(code) = ?', [strtoupper(trim($code))])
            ->first();

        if (! $coupon) {
            throw ValidationException::withMessages([
                'code' => __('Invalid coupon code.'),
            ]);
        }

        $this->assertCouponIsUsable($coupon, $lineItems, $user);

        $subtotal = $this->eligibleSubtotal($coupon, $lineItems);
        $discount = $this->calculateDiscount($coupon, $lineItems, $subtotal);
        $freeShipping = $coupon->type === Coupon::TYPE_FREE_SHIPPING;

        return [
            'coupon' => $coupon,
            'discount' => round($discount, 2),
            'free_shipping' => $freeShipping,
            'message' => __('Coupon applied successfully.'),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     */
    public function assertCouponIsUsable(Coupon $coupon, array $lineItems, ?User $user = null): void
    {
        if (! $coupon->isActive()) {
            throw ValidationException::withMessages([
                'code' => __('This coupon is not active.'),
            ]);
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            throw ValidationException::withMessages([
                'code' => __('This coupon is not active yet.'),
            ]);
        }

        if ($coupon->expiry_date && $coupon->expiry_date->isPast()) {
            throw ValidationException::withMessages([
                'code' => __('This coupon has expired.'),
            ]);
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            throw ValidationException::withMessages([
                'code' => __('This coupon has reached its usage limit.'),
            ]);
        }

        if ($user && $coupon->per_user_limit !== null) {
            $userUsageCount = CouponUsage::query()
                ->where('coupon_id', $coupon->id)
                ->where('user_id', $user->id)
                ->count();

            if ($userUsageCount >= $coupon->per_user_limit) {
                throw ValidationException::withMessages([
                    'code' => __('You have already used this coupon the maximum number of times.'),
                ]);
            }
        }

        if ($coupon->first_order_only || $coupon->type === Coupon::TYPE_FIRST_ORDER) {
            if (! $user) {
                throw ValidationException::withMessages([
                    'code' => __('Please log in to use this first-order coupon.'),
                ]);
            }

            $hasOrders = Order::query()
                ->where('user_id', $user->id)
                ->whereNotIn('order_status', ['cancelled'])
                ->exists();

            if ($hasOrders) {
                throw ValidationException::withMessages([
                    'code' => __('This coupon is valid for first orders only.'),
                ]);
            }
        }

        $eligibleSubtotal = $this->eligibleSubtotal($coupon, $lineItems);

        if ($eligibleSubtotal <= 0) {
            throw ValidationException::withMessages([
                'code' => __('This coupon is not applicable to items in your cart.'),
            ]);
        }

        if ((float) $coupon->minimum_amount > 0 && $eligibleSubtotal < (float) $coupon->minimum_amount) {
            throw ValidationException::withMessages([
                'code' => __('Add items worth ₹:amount or more to unlock this offer.', [
                    'amount' => number_format((float) $coupon->minimum_amount, 0),
                ]),
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     */
    public function calculateDiscount(Coupon $coupon, array $lineItems, ?float $eligibleSubtotal = null): float
    {
        $eligibleSubtotal ??= $this->eligibleSubtotal($coupon, $lineItems);

        return match ($coupon->type) {
            Coupon::TYPE_PERCENTAGE => $this->percentageDiscount($coupon, $eligibleSubtotal),
            Coupon::TYPE_FIXED => min((float) $coupon->value, $eligibleSubtotal),
            Coupon::TYPE_FREE_SHIPPING => 0.0,
            Coupon::TYPE_BUY_X_GET_Y => $this->buyXGetYDiscount($coupon, $lineItems),
            Coupon::TYPE_FIRST_ORDER => $this->percentageDiscount($coupon, $eligibleSubtotal)
                ?: min((float) $coupon->value, $eligibleSubtotal),
            default => min((float) $coupon->value, $eligibleSubtotal),
        };
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     */
    public function eligibleSubtotal(Coupon $coupon, array $lineItems): float
    {
        return collect($lineItems)
            ->filter(fn (array $item) => $this->itemMatchesCoupon($coupon, $item))
            ->sum(fn (array $item) => (float) $item['product']['price'] * (int) $item['quantity']);
    }

    /**
     * @param  array<string, mixed>  $item
     */
    public function itemMatchesCoupon(Coupon $coupon, array $item): bool
    {
        $product = $item['product'];
        $categoryId = $product['categoryId'] ?? null;
        $productId = $product['id'] ?? null;

        $hasCategoryScope = $coupon->relationLoaded('categories')
            ? $coupon->categories->isNotEmpty()
            : $coupon->categories()->exists();
        $hasProductScope = $coupon->relationLoaded('products')
            ? $coupon->products->isNotEmpty()
            : $coupon->products()->exists();

        if ($hasProductScope) {
            return $coupon->products->contains('id', $productId);
        }

        if ($hasCategoryScope) {
            return $coupon->categories->contains('id', $categoryId);
        }

        return true;
    }

    /**
     * @return Collection<int, Coupon>
     */
    public function activeOffers(): Collection
    {
        return Coupon::query()
            ->with(['categories:id,name', 'products:id,name'])
            ->where('status', 'active')
            ->where(function ($query): void {
                $query->whereNull('starts_at')
                    ->orWhereDate('starts_at', '<=', now()->toDateString());
            })
            ->where(function ($query): void {
                $query->whereNull('expiry_date')
                    ->orWhereDate('expiry_date', '>=', now()->toDateString());
            })
            ->where(function ($query): void {
                $query->whereNull('usage_limit')
                    ->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * @return array{id: int, code: string, title: string, description: string, type: string, minimum_amount: float}
     */
    public function formatOffer(Coupon $coupon): array
    {
        return [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'title' => $coupon->title ?: $this->defaultTitle($coupon),
            'description' => $coupon->description ?: $this->defaultDescription($coupon),
            'type' => $coupon->type,
            'minimum_amount' => (float) $coupon->minimum_amount,
        ];
    }

    public function recordUsage(Coupon $coupon, Order $order, User $user, float $discountAmount): CouponUsage
    {
        $usage = CouponUsage::query()->create([
            'coupon_id' => $coupon->id,
            'user_id' => $user->id,
            'order_id' => $order->id,
            'email' => $user->email,
            'discount_amount' => $discountAmount,
            'used_at' => now(),
        ]);

        $coupon->increment('used_count');

        return $usage;
    }

    private function percentageDiscount(Coupon $coupon, float $eligibleSubtotal): float
    {
        $discount = round($eligibleSubtotal * ((float) $coupon->value / 100), 2);

        if ($coupon->max_discount !== null) {
            $discount = min($discount, (float) $coupon->max_discount);
        }

        return min($discount, $eligibleSubtotal);
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     */
    private function buyXGetYDiscount(Coupon $coupon, array $lineItems): float
    {
        $buyQty = (int) ($coupon->buy_quantity ?? 0);
        $getQty = (int) ($coupon->get_quantity ?? 0);

        if ($buyQty < 1 || $getQty < 1) {
            return 0.0;
        }

        $eligibleItems = collect($lineItems)->filter(fn (array $item) => $this->itemMatchesCoupon($coupon, $item));
        $totalQty = (int) $eligibleItems->sum('quantity');

        if ($totalQty < ($buyQty + $getQty)) {
            return 0.0;
        }

        $freeUnits = intdiv($totalQty, $buyQty + $getQty) * $getQty;
        $cheapestUnitPrice = $eligibleItems
            ->flatMap(fn (array $item) => array_fill(0, (int) $item['quantity'], (float) $item['product']['price']))
            ->sort()
            ->take($freeUnits)
            ->sum();

        return round((float) $cheapestUnitPrice, 2);
    }

    private function defaultTitle(Coupon $coupon): string
    {
        return match ($coupon->type) {
            Coupon::TYPE_PERCENTAGE, Coupon::TYPE_FIRST_ORDER => 'Get Flat '.number_format((float) $coupon->value, 0).'% OFF',
            Coupon::TYPE_FREE_SHIPPING => 'Free Shipping',
            Coupon::TYPE_BUY_X_GET_Y => 'Buy '.$coupon->buy_quantity.' Get '.$coupon->get_quantity.' Offer',
            default => 'Get Flat ₹'.number_format((float) $coupon->value, 0).' OFF',
        };
    }

    private function defaultDescription(Coupon $coupon): string
    {
        if ((float) $coupon->minimum_amount > 0) {
            return 'Add items worth ₹'.number_format((float) $coupon->minimum_amount, 0).' or more to unlock this offer';
        }

        return 'Apply this coupon at checkout';
    }
}
