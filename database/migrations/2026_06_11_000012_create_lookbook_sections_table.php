<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lookbook_sections', function (Blueprint $table) {
            $table->id();
            $table->string('eyebrow')->default('Lookbook');
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->string('cta_label')->default('Watch the Lookbook');
            $table->string('cta_href')->default('/trending');
            $table->string('poster_image')->nullable();
            $table->string('video_url')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lookbook_sections');
    }
};
