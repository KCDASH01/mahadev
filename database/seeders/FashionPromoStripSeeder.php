<?php

namespace Database\Seeders;

use App\Models\PromoStrip;
use Illuminate\Database\Seeder;

class FashionPromoStripSeeder extends Seeder
{
    public function run(): void
    {
        PromoStrip::query()->updateOrCreate(
            ['id' => 1],
            [
                'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1920&h=250&q=85',
                'is_visible' => true,
            ],
        );
    }
}
