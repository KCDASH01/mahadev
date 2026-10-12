<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('id')->constrained('categories')->nullOnDelete();
            $table->string('gender', 20)->nullable()->after('slug');
            $table->unsignedInteger('sort_order')->default(0)->after('description');
            $table->string('banner_image')->nullable()->after('image');

            $table->index(['parent_id', 'status']);
            $table->index(['gender', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropIndex(['parent_id', 'status']);
            $table->dropIndex(['gender', 'status']);
            $table->dropColumn(['parent_id', 'gender', 'sort_order', 'banner_image']);
        });
    }
};
