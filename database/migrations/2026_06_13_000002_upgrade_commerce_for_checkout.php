<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->string('title')->nullable()->after('code');
            $table->text('description')->nullable()->after('title');
            $table->decimal('max_discount', 12, 2)->nullable()->after('value');
            $table->unsignedInteger('per_user_limit')->nullable()->after('usage_limit');
            $table->date('starts_at')->nullable()->after('minimum_amount');
            $table->unsignedInteger('buy_quantity')->nullable()->after('type');
            $table->unsignedInteger('get_quantity')->nullable()->after('buy_quantity');
            $table->boolean('first_order_only')->default(false)->after('status');
            $table->timestamp('updated_at')->nullable()->after('created_at');
        });

        Schema::create('coupon_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unique(['coupon_id', 'product_id']);
        });

        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable();
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->timestamp('used_at')->useCurrent();
            $table->timestamps();

            $table->index(['coupon_id', 'user_id']);
            $table->index(['coupon_id', 'order_id']);
        });

        Schema::table('user_addresses', function (Blueprint $table) {
            $table->string('alternate_phone', 20)->nullable()->after('phone');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->json('shipping_address_snapshot')->nullable()->after('address_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('shipping_address_snapshot');
        });

        Schema::table('user_addresses', function (Blueprint $table) {
            $table->dropColumn('alternate_phone');
        });

        Schema::dropIfExists('coupon_usages');
        Schema::dropIfExists('coupon_product');

        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn([
                'title',
                'description',
                'max_discount',
                'per_user_limit',
                'starts_at',
                'buy_quantity',
                'get_quantity',
                'first_order_only',
                'updated_at',
            ]);
        });
    }
};
