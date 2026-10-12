<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->string('accent_line')->nullable()->after('title');
            $table->string('main_line')->nullable()->after('accent_line');
            $table->string('tagline')->nullable()->after('main_line');
            $table->string('promo_text')->nullable()->after('tagline');
            $table->string('cta_label')->default('SHOP NOW')->after('link');
            $table->string('image_position')->default('center center')->after('image');
        });

        Schema::create('promo_strips', function (Blueprint $table) {
            $table->id();
            $table->string('href')->default('/men');
            $table->string('badge_brand');
            $table->string('badge_title');
            $table->string('badge_subtitle');
            $table->string('offer_primary');
            $table->string('offer_secondary');
            $table->string('offer_pill');
            $table->string('model_image');
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_strips');

        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn([
                'accent_line',
                'main_line',
                'tagline',
                'promo_text',
                'cta_label',
                'image_position',
            ]);
        });
    }
};
