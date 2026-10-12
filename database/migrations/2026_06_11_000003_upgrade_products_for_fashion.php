<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'specifications')) {
                $table->dropColumn('specifications');
            }

            $table->string('gender', 20)->nullable()->after('brand_id');
            $table->string('fit')->nullable()->after('short_description');
            $table->text('care_instructions')->nullable()->after('description');
            $table->json('details')->nullable()->after('care_instructions');
            $table->string('badge')->nullable()->after('details');
            $table->decimal('avg_rating', 3, 2)->default(0)->after('badge');
            $table->unsignedInteger('review_count')->default(0)->after('avg_rating');
            $table->boolean('is_new_arrival')->default(false)->after('is_featured');
            $table->boolean('is_trending')->default(false)->after('is_new_arrival');
            $table->boolean('is_best_seller')->default(false)->after('is_trending');
            $table->timestamp('published_at')->nullable()->after('is_best_seller');

            $table->index(['gender', 'status']);
            $table->index(['is_new_arrival', 'status']);
            $table->index(['is_trending', 'status']);
            $table->index(['is_best_seller', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['gender', 'status']);
            $table->dropIndex(['is_new_arrival', 'status']);
            $table->dropIndex(['is_trending', 'status']);
            $table->dropIndex(['is_best_seller', 'status']);

            $table->dropColumn([
                'gender',
                'fit',
                'care_instructions',
                'details',
                'badge',
                'avg_rating',
                'review_count',
                'is_new_arrival',
                'is_trending',
                'is_best_seller',
                'published_at',
            ]);

            $table->json('specifications')->nullable()->after('description');
        });
    }
};
