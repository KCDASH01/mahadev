<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promo_strips', function (Blueprint $table) {
            $table->string('image')->nullable()->after('id');
        });

        foreach (DB::table('promo_strips')->get() as $strip) {
            DB::table('promo_strips')
                ->where('id', $strip->id)
                ->update(['image' => $strip->model_image]);
        }

        Schema::table('promo_strips', function (Blueprint $table) {
            $table->dropColumn([
                'href',
                'badge_brand',
                'badge_title',
                'badge_subtitle',
                'offer_primary',
                'offer_secondary',
                'offer_pill',
                'model_image',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('promo_strips', function (Blueprint $table) {
            $table->string('href')->default('/men');
            $table->string('badge_brand')->default('');
            $table->string('badge_title')->default('');
            $table->string('badge_subtitle')->default('');
            $table->string('offer_primary')->default('');
            $table->string('offer_secondary')->default('');
            $table->string('offer_pill')->default('');
            $table->string('model_image')->nullable();
        });

        foreach (DB::table('promo_strips')->get() as $strip) {
            DB::table('promo_strips')
                ->where('id', $strip->id)
                ->update(['model_image' => $strip->image]);
        }

        Schema::table('promo_strips', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
