<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class FashionBrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            [
                'name' => 'Mahadev',
                'slug' => 'mahadev',
                'description' => 'Mahadev garments and furniture collection.',
            ],
            [
                'name' => 'Urban Edge',
                'slug' => 'urban-edge',
                'description' => 'Contemporary streetwear and denim.',
            ],
            [
                'name' => 'Loom & Thread',
                'slug' => 'loom-thread',
                'description' => 'Ethnic and fusion wear.',
            ],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(
                ['slug' => $brand['slug']],
                [
                    'name' => $brand['name'],
                    'description' => $brand['description'],
                    'status' => 'active',
                ],
            );
        }
    }
}
