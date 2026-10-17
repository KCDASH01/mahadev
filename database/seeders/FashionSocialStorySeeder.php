<?php

namespace Database\Seeders;

use App\Models\SocialStory;
use Illuminate\Database\Seeder;

class FashionSocialStorySeeder extends Seeder
{
    public function run(): void
    {
        $img = fn (string $path, int $width = 900) => "https://images.unsplash.com/{$path}?auto=format&fit=crop&w={$width}&q=85";

        $stories = [
            [
                'title' => 'End of Season Sale',
                'type' => 'image',
                'image' => $img('photo-1542272604-787c3835535d'),
                'show_thumbnail_promo' => true,
                'overlay_eyebrow' => 'END OF SEASON',
                'overlay_title' => 'SALE',
                'overlay_discount' => 'UPTO 50% OFF',
                'overlay_note' => 'MANY MORE EXCITING OFFERS IN-STORE AND ONLINE',
                'overlay_hashtag' => '#STYLEWITHMAHADEV',
                'sort_order' => 0,
            ],
            [
                'title' => 'Festive Look',
                'type' => 'image',
                'image' => $img('photo-1756483492198-8ca91227489b'),
                'sort_order' => 1,
            ],
            [
                'title' => 'Street Style Video',
                'type' => 'video',
                'image' => $img('photo-1515886657613-9f3515b0c78f'),
                'video_url' => 'https://videos.pexels.com/video-files/4760244/4760244-hd_1080_1920_25fps.mp4',
                'sort_order' => 2,
            ],
            [
                'title' => 'Heritage Ethnic',
                'type' => 'image',
                'image' => $img('photo-1769275061356-a038b498c4a7'),
                'sort_order' => 3,
            ],
            [
                'title' => 'Everyday Essentials',
                'type' => 'image',
                'image' => $img('photo-1625978827241-c8bdc7cc3ff7'),
                'sort_order' => 4,
            ],
            [
                'title' => 'Runway Video',
                'type' => 'video',
                'image' => $img('photo-1485230895905-ec40ba36b9bc'),
                'video_url' => 'https://videos.pexels.com/video-files/7695997/7695997-hd_1080_1920_25fps.mp4',
                'sort_order' => 5,
            ],
        ];

        foreach ($stories as $story) {
            SocialStory::query()->updateOrCreate(
                ['title' => $story['title']],
                array_merge($story, ['status' => 'active']),
            );
        }
    }
}
