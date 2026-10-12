<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_stories', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type', 20)->default('image');
            $table->string('image');
            $table->string('video_url')->nullable();
            $table->string('link_url')->nullable();
            $table->string('overlay_eyebrow')->nullable();
            $table->string('overlay_title')->nullable();
            $table->string('overlay_discount')->nullable();
            $table->text('overlay_note')->nullable();
            $table->string('overlay_hashtag')->nullable();
            $table->boolean('show_thumbnail_promo')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status', 20)->default('active');
            $table->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('headline');
            $table->text('body');
            $table->decimal('rating', 2, 1)->default(5);
            $table->string('scene_image');
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status', 20)->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('social_stories');
    }
};
