<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->string('media_type', 20)->default('image')->after('promo_text');
            $table->string('video', 2048)->nullable()->after('image');
            $table->string('image', 2048)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['media_type', 'video']);
            $table->string('image', 2048)->nullable(false)->change();
        });
    }
};
