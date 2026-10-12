<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TruncateApplicationDataSeeder extends Seeder
{
    /**
     * Remove catalog and commerce data while preserving admin users and settings.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        $tables = [
            'saved_for_later_items',
            'order_trackings',
            'payments',
            'order_items',
            'orders',
            'cart_items',
            'carts',
            'wishlists',
            'product_reviews',
            'product_variant_option_values',
            'product_variants',
            'product_attribute_values',
            'product_images',
            'products',
            'coupon_category',
            'coupons',
            'banners',
            'promo_strips',
            'homepage_popups',
            'lookbook_sections',
            'social_stories',
            'testimonials',
            'category_attribute',
            'attribute_values',
            'attributes',
            'categories',
            'brands',
            'blogs',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
            }
        }

        if (Schema::hasTable('user_addresses')) {
            DB::table('user_addresses')
                ->whereIn(
                    'user_id',
                    User::query()->where('role', '!=', 'admin')->select('id'),
                )
                ->delete();
        }

        if (Schema::hasTable('users')) {
            User::query()->where('role', '!=', 'admin')->delete();
        }

        Schema::enableForeignKeyConstraints();
    }
}
