<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_popups', function (Blueprint $table) {
            $table->id();
            $table->string('image')->nullable();
            $table->string('mobile_image')->nullable();
            $table->string('link')->nullable();
            $table->boolean('is_visible')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_popups');
    }
};
