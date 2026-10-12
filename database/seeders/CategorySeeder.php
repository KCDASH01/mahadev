<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    private const IMG_SIZE = '?w=400&h=400&fit=crop';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'BP Monitors',
                'description' => 'Digital and manual blood pressure monitors for home and clinical use.',
                'image' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef'.self::IMG_SIZE,
            ],
            [
                'name' => 'Wheelchairs',
                'description' => 'Manual and electric wheelchairs for mobility support.',
                'image' => 'https://images.unsplash.com/photo-1582719471384-894fbb16e074'.self::IMG_SIZE,
            ],
            [
                'name' => 'Oxygen Concentrators',
                'description' => 'Portable and home oxygen concentrators for respiratory care.',
                'image' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118'.self::IMG_SIZE,
            ],
            [
                'name' => 'Nebulizers',
                'description' => 'Compressor and mesh nebulizers for asthma and COPD treatment.',
                'image' => 'https://images.unsplash.com/photo-1581595219315-a187dd40c322'.self::IMG_SIZE,
            ],
            [
                'name' => 'Hospital Beds',
                'description' => 'Adjustable hospital beds for home care and clinics.',
                'image' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'.self::IMG_SIZE,
            ],
            [
                'name' => 'Walkers',
                'description' => 'Foldable walkers and rollators for elderly mobility.',
                'image' => 'https://picsum.photos/seed/category-walkers/400/400',
            ],
            [
                'name' => 'Pulse Oximeters',
                'description' => 'Fingertip pulse oximeters for SpO2 monitoring.',
                'image' => 'https://images.unsplash.com/photo-1584982751601-97dcc096659c'.self::IMG_SIZE,
            ],
            [
                'name' => 'Thermometers',
                'description' => 'Infrared and digital thermometers for accurate readings.',
                'image' => 'https://picsum.photos/seed/category-thermometers/400/400',
            ],
            [
                'name' => 'Glucometers',
                'description' => 'Blood glucose monitors and test strip kits.',
                'image' => 'https://images.unsplash.com/photo-1579154204601-01588f351e67'.self::IMG_SIZE,
            ],
            [
                'name' => 'CPAP & BiPAP',
                'description' => 'Sleep apnea machines, masks, and accessories.',
                'image' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'.self::IMG_SIZE,
            ],
            [
                'name' => 'Medical Masks',
                'description' => 'N95, surgical, and reusable protective masks.',
                'image' => 'https://picsum.photos/seed/category-masks/400/400',
            ],
            [
                'name' => 'First Aid Kits',
                'description' => 'Home, travel, and professional first aid supplies.',
                'image' => 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b'.self::IMG_SIZE,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'image' => $category['image'],
                    'status' => 'active',
                ],
            );
        }
    }
}
