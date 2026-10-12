<?php

namespace Database\Seeders;

use App\Models\LookbookSection;
use Illuminate\Database\Seeder;

class FashionLookbookSeeder extends Seeder
{
    public function run(): void
    {
        LookbookSection::query()->updateOrCreate(
            ['id' => 1],
            [
                'eyebrow' => 'Lookbook',
                'title' => 'Crafted for Modern Indian Fashion',
                'subtitle' => 'Garments and furniture for everyday living — discover the Mahadev difference.',
                'cta_label' => 'Watch the Lookbook',
                'cta_href' => '/trending',
                'poster_image' => 'https://images.unsplash.com/photo-1771654805161-442c6aab7b55?auto=format&fit=crop&w=2200&q=85',
                'video_url' => 'https://videos.pexels.com/video-files/4760244/4760244-hd_1080_1920_25fps.mp4',
                'is_visible' => true,
            ],
        );
    }
}
