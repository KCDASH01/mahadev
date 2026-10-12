<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Database\Seeder;

class FashionCouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'title' => 'Flat 10% OFF on First Order',
                'description' => 'Use Code: WELCOME10 on your first purchase',
                'type' => 'first_order',
                'value' => 10,
                'minimum_amount' => 999,
                'max_discount' => 500,
                'usage_limit' => 1000,
                'per_user_limit' => 1,
                'first_order_only' => true,
                'expiry_date' => now()->addYear()->toDateString(),
            ],
            [
                'code' => 'MENS40',
                'title' => "Flat 40% OFF on Men's Collection",
                'description' => "Applies to men's category items in your cart",
                'type' => 'percentage',
                'value' => 40,
                'minimum_amount' => 1499,
                'max_discount' => 2000,
                'usage_limit' => 500,
                'per_user_limit' => 2,
                'expiry_date' => now()->addMonths(6)->toDateString(),
            ],
            [
                'code' => 'FREESHIP',
                'title' => 'Free Shipping Above ₹999',
                'description' => 'No delivery charge on eligible orders',
                'type' => 'free_shipping',
                'value' => 0,
                'minimum_amount' => 999,
                'usage_limit' => null,
                'expiry_date' => now()->addMonths(6)->toDateString(),
            ],
            [
                'code' => 'B2G1TEE',
                'title' => 'Buy 2 Get 1 Free on T-Shirts',
                'description' => 'Cheapest eligible item becomes free',
                'type' => 'buy_x_get_y',
                'value' => 0,
                'buy_quantity' => 2,
                'get_quantity' => 1,
                'minimum_amount' => 0,
                'usage_limit' => null,
                'expiry_date' => now()->addMonths(3)->toDateString(),
            ],
            [
                'code' => 'FLAT200',
                'title' => 'Flat ₹200 OFF',
                'description' => 'Instant discount on orders above ₹1499',
                'type' => 'fixed',
                'value' => 200,
                'minimum_amount' => 1499,
                'usage_limit' => 500,
                'expiry_date' => now()->addMonths(3)->toDateString(),
            ],
        ];

        foreach ($coupons as $couponData) {
            Coupon::updateOrCreate(
                ['code' => $couponData['code']],
                [
                    'title' => $couponData['title'],
                    'description' => $couponData['description'],
                    'type' => $couponData['type'],
                    'value' => $couponData['value'],
                    'buy_quantity' => $couponData['buy_quantity'] ?? null,
                    'get_quantity' => $couponData['get_quantity'] ?? null,
                    'minimum_amount' => $couponData['minimum_amount'],
                    'max_discount' => $couponData['max_discount'] ?? null,
                    'usage_limit' => $couponData['usage_limit'],
                    'per_user_limit' => $couponData['per_user_limit'] ?? null,
                    'used_count' => 0,
                    'first_order_only' => $couponData['first_order_only'] ?? false,
                    'expiry_date' => $couponData['expiry_date'],
                    'status' => 'active',
                ],
            );
        }

        $welcomeCoupon = Coupon::query()->where('code', 'WELCOME10')->first();
        $mensCoupon = Coupon::query()->where('code', 'MENS40')->first();
        $b2g1Coupon = Coupon::query()->where('code', 'B2G1TEE')->first();
        $menCategory = Category::query()->where('slug', 'men')->first();
        $womenCategory = Category::query()->where('slug', 'women')->first();
        $tshirtProduct = Product::query()->where('slug', 'like', '%t-shirt%')->orWhere('name', 'like', '%T-Shirt%')->first();

        if ($welcomeCoupon && $menCategory && $womenCategory) {
            $welcomeCoupon->categories()->sync([$menCategory->id, $womenCategory->id]);
        }

        if ($mensCoupon && $menCategory) {
            $mensCoupon->categories()->sync([$menCategory->id]);
        }

        if ($b2g1Coupon && $tshirtProduct) {
            $b2g1Coupon->products()->sync([$tshirtProduct->id]);
        }
    }
}
