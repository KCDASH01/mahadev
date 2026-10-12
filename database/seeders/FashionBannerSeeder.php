<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class FashionBannerSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'title' => 'Mahadev Garments',
                'accent_line' => 'STYLE FOR EVERY DAY',
                'main_line' => 'GARMENTS',
                'tagline' => 'Thoughtfully selected fashion for gents and ladies, with quality you can trust.',
                'promo_text' => 'New collection now available',
                'image' => 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=85',
                'image_position' => 'center 35%',
                'link' => '/collection/gents',
                'cta_label' => 'SHOP GARMENTS',
                'sort_order' => 1,
            ],
            [
                'title' => 'Mahadev Furniture',
                'accent_line' => 'MADE FOR YOUR HOME',
                'main_line' => 'FURNITURE',
                'tagline' => 'Comfortable, useful and dependable furniture for every room and every budget.',
                'promo_text' => 'Built for everyday living',
                'image' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=85',
                'image_position' => 'center 55%',
                'link' => '/collection/furniture',
                'cta_label' => 'SHOP FURNITURE',
                'sort_order' => 2,
            ],
            [
                'title' => 'Ladies Collection',
                'accent_line' => 'ELEGANCE FOR EVERY OCCASION',
                'main_line' => 'LADIES COLLECTION',
                'tagline' => 'Sarees, tops, jeans, kurtis and lehengas for modern Indian wardrobes.',
                'promo_text' => 'Discover the latest styles',
                'image' => 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1600&q=85',
                'image_position' => 'center 25%',
                'link' => '/collection/ladies',
                'cta_label' => 'SHOP LADIES',
                'sort_order' => 3,
            ],
        ];

        foreach ($slides as $slide) {
            Banner::updateOrCreate(
                [
                    'title' => $slide['title'],
                    'placement' => 'hero',
                ],
                [
                    'accent_line' => $slide['accent_line'],
                    'main_line' => $slide['main_line'],
                    'tagline' => $slide['tagline'],
                    'promo_text' => $slide['promo_text'],
                    'image' => $slide['image'],
                    'image_position' => $slide['image_position'],
                    'link' => $slide['link'],
                    'cta_label' => $slide['cta_label'],
                    'sort_order' => $slide['sort_order'],
                    'status' => 'active',
                ],
            );
        }
    }
}
