<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attribute_value_id')->constrained()->restrictOnDelete();
            $table->timestamps();

            $table->unique(['product_id', 'attribute_value_id'], 'product_attribute_value_unique');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->foreignId('color_value_id')
                ->nullable()
                ->after('product_id')
                ->constrained('attribute_values')
                ->nullOnDelete();

            $table->index(['product_id', 'color_value_id']);
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropForeign(['color_value_id']);
            $table->dropIndex(['product_id', 'color_value_id']);
            $table->dropColumn('color_value_id');
        });

        Schema::dropIfExists('product_attribute_values');
    }
};
