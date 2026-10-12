<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('display_rating', 3, 2)->default(0)->after('review_count');
            $table->unsignedInteger('display_review_count')->default(0)->after('display_rating');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'display_rating',
                'display_review_count',
            ]);
        });
    }
};
