<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    private const BANNER_SIZE = '?w=1400&h=560&fit=crop&q=85';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banners = [
            [
                'title' => '50% OFF On BP Monitors',
                'image' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef'.self::BANNER_SIZE,
                'link' => '/categories/bp-monitors',
            ],
            [
                'title' => 'Free Delivery Above ₹5000',
                'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae'.self::BANNER_SIZE,
                'link' => '/',
            ],
            [
                'title' => 'Latest Medical Equipment',
                'image' => 'https://images.unsplash.com/photo-1538108149393-edd6fba627de'.self::BANNER_SIZE,
                'link' => '/',
            ],
            [
                'title' => 'Wheelchair Sale',
                'image' => 'https://images.unsplash.com/photo-1582719471384-894fbb16e074'.self::BANNER_SIZE,
                'link' => '/categories/wheelchairs',
            ],
            [
                'title' => 'Oxygen Concentrator Deals',
                'image' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118'.self::BANNER_SIZE,
                'link' => '/categories/oxygen-concentrators',
            ],
            [
                'title' => 'Nebulizers Starting ₹1499',
                'image' => 'https://images.unsplash.com/photo-1581595219315-a187dd40c322'.self::BANNER_SIZE,
                'link' => '/categories/nebulizers',
            ],
            [
                'title' => 'Hospital Beds For Home Care',
                'image' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'.self::BANNER_SIZE,
                'link' => '/categories/hospital-beds',
            ],
            [
                'title' => 'Pulse Oximeter Offers',
                'image' => 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926'.self::BANNER_SIZE,
                'link' => '/categories/pulse-oximeters',
            ],
            [
                'title' => 'Top Brands - Omron & Philips',
                'image' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d'.self::BANNER_SIZE,
                'link' => '/',
            ],
            [
                'title' => 'Walkers & Mobility Aids',
                'image' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289'.self::BANNER_SIZE,
                'link' => '/categories/walkers',
            ],
            [
                'title' => 'Thermometers & Glucometers',
                'image' => 'https://images.unsplash.com/photo-1579154204601-01588f351e67'.self::BANNER_SIZE,
                'link' => '/categories/thermometers',
            ],
            [
                'title' => 'Customer Support 24/7',
                'image' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118'.self::BANNER_SIZE,
                'link' => '/contact',
            ],
        ];

        foreach ($banners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title']],
                [
                    'image' => $banner['image'],
                    'link' => $banner['link'],
                    'status' => 'active',
                ],
            );
        }
    }
}
