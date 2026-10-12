<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('velocity_order_id')->nullable();
            $table->string('velocity_shipment_id')->nullable();
            $table->string('awb_number')->nullable()->index();
            $table->string('warehouse_id');
            $table->string('courier_name')->nullable();
            $table->string('carrier_id')->nullable();
            $table->string('tracking_url')->nullable();
            $table->string('label_url')->nullable();
            $table->string('manifest_url')->nullable();
            $table->decimal('shipping_charge', 10, 2)->nullable();
            $table->decimal('cod_charge', 10, 2)->nullable();
            $table->decimal('weight', 8, 2)->nullable();
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('breadth', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();
            $table->string('shipment_status')->default('pending');
            $table->string('tracking_status')->nullable();
            $table->string('pickup_status')->nullable();
            $table->date('pickup_date')->nullable();
            $table->date('delivery_date')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('last_tracked_at')->nullable();
            $table->boolean('pickup_generated')->default(false);
            $table->boolean('manifest_generated')->default(false);
            $table->text('failure_reason')->nullable();
            $table->json('api_response')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_shipments');
    }
};
