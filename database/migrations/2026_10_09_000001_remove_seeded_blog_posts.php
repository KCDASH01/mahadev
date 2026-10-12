<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('blogs')->whereIn('slug', [
            'wardrobe-essentials-indian-men',
            'choose-perfect-kurti',
            'kids-fashion-comfort-style',
        ])->delete();
    }

    public function down(): void
    {
        // Seeded sample posts are not restored.
    }
};
