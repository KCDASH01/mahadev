<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_rules', function (Blueprint $table) {
            $table->id();
            $table->decimal('min_amount', 12, 2);
            $table->decimal('max_amount', 12, 2)->nullable();
            $table->decimal('shipping_charge', 12, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'min_amount']);
        });

        // Seed sensible defaults so dynamic shipping works immediately
        // and existing checkout behaviour is preserved.
        $now = now();

        DB::table('shipping_rules')->insert([
            [
                'min_amount' => 0,
                'max_amount' => 499,
                'shipping_charge' => 99,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'min_amount' => 500,
                'max_amount' => 998.99,
                'shipping_charge' => 49,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'min_amount' => 999,
                'max_amount' => null,
                'shipping_charge' => 0,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_rules');
    }
};
