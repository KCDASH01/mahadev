<?php

namespace Database\Seeders;

use App\Models\Blog;
use Illuminate\Database\Seeder;

class FashionBlogSeeder extends Seeder
{
    public function run(): void
    {
        Blog::query()->whereIn('slug', [
            'wardrobe-essentials-indian-men',
            'choose-perfect-kurti',
            'kids-fashion-comfort-style',
        ])->delete();
    }
}
