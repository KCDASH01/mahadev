<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('cod_enabled')->default(true);
            $table->unsignedInteger('default_delivery_days')->default(7);
            $table->timestamps();
        });

        $now = now();

        DB::table('shipping_settings')->insert([
            'cod_enabled' => true,
            'default_delivery_days' => 7,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_settings');
    }
};
