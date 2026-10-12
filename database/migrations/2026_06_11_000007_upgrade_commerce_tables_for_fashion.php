<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::table('wishlists', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['product_id']);
            $table->dropUnique(['user_id', 'product_id']);
        });

        Schema::table('wishlists', function (Blueprint $table) {
            $table->foreignId('product_variant_id')
                ->nullable()
                ->after('product_id')
                ->constrained('product_variants')
                ->cascadeOnDelete();

            $table->unique(['user_id', 'product_id', 'product_variant_id'], 'wishlist_user_product_variant_unique');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        Schema::enableForeignKeyConstraints();

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('coupon_id')->nullable()->after('address_id')->constrained()->nullOnDelete();
            $table->string('coupon_code')->nullable()->after('coupon_id');
            $table->decimal('coupon_discount', 12, 2)->default(0)->after('discount_amount');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('variant_label')->nullable()->after('sku');
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->unsignedInteger('usage_limit')->nullable()->after('minimum_amount');
            $table->unsignedInteger('used_count')->default(0)->after('usage_limit');
        });

        Schema::create('coupon_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();

            $table->unique(['coupon_id', 'category_id']);
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->string('placement', 50)->default('home')->after('link');
            $table->unsignedInteger('sort_order')->default(0)->after('placement');
            $table->string('gender', 20)->nullable()->after('sort_order');

            $table->index(['placement', 'status', 'sort_order']);
        });

        Schema::create('saved_for_later_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->unique(['user_id', 'product_id', 'product_variant_id'], 'saved_item_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_for_later_items');

        Schema::table('banners', function (Blueprint $table) {
            $table->dropIndex(['placement', 'status', 'sort_order']);
            $table->dropColumn(['placement', 'sort_order', 'gender']);
        });

        Schema::dropIfExists('coupon_category');

        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['usage_limit', 'used_count']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('variant_label');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['coupon_id']);
            $table->dropColumn(['coupon_id', 'coupon_code', 'coupon_discount']);
        });

        Schema::disableForeignKeyConstraints();

        Schema::table('wishlists', function (Blueprint $table) {
            $table->dropForeign(['product_variant_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['product_id']);
            $table->dropUnique('wishlist_user_product_variant_unique');
            $table->dropColumn('product_variant_id');
            $table->unique(['user_id', 'product_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        Schema::enableForeignKeyConstraints();
    }
};
