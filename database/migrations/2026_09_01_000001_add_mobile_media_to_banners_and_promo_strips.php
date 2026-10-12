<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->string('mobile_image', 2048)->nullable()->after('video');
            $table->string('mobile_video', 2048)->nullable()->after('mobile_image');
        });

        Schema::table('promo_strips', function (Blueprint $table) {
            $table->string('mobile_image', 2048)->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['mobile_image', 'mobile_video']);
        });

        Schema::table('promo_strips', function (Blueprint $table) {
            $table->dropColumn('mobile_image');
        });
    }
};
