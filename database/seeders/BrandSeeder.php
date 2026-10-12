<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    private const CARD_SIZE = '?w=420&h=560&fit=crop';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            [
                'name' => 'Omron',
                'tagline' => 'BP Monitors',
                'description' => 'Trusted Japanese brand for BP monitors and health devices.',
                'logo' => 'https://logo.clearbit.com/omron.com',
                'featured_image' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef'.self::CARD_SIZE,
            ],
            [
                'name' => 'Philips',
                'tagline' => 'Respiratory Care',
                'description' => 'Global leader in respiratory and patient monitoring solutions.',
                'logo' => 'https://logo.clearbit.com/philips.com',
                'featured_image' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118'.self::CARD_SIZE,
            ],
            [
                'name' => 'Dr Trust',
                'tagline' => 'Home Healthcare',
                'description' => 'Popular Indian brand for affordable medical equipment.',
                'logo' => 'https://logo.clearbit.com/drtrust.in',
                'featured_image' => 'https://images.unsplash.com/photo-1582719471384-894fbb16e074'.self::CARD_SIZE,
            ],
            [
                'name' => 'AccuSure',
                'tagline' => 'Diagnostics',
                'description' => 'Reliable diagnostic devices for home healthcare.',
                'logo' => 'https://logo.clearbit.com/accusureindia.com',
                'featured_image' => 'https://images.unsplash.com/photo-1581595219315-a187dd40c322'.self::CARD_SIZE,
            ],
            [
                'name' => 'Beurer',
                'tagline' => 'Wellness Devices',
                'description' => 'German engineering for wellness and medical products.',
                'logo' => 'https://logo.clearbit.com/beurer.com',
                'featured_image' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'.self::CARD_SIZE,
            ],
            [
                'name' => 'BPL Medical',
                'tagline' => 'Hospital Equipment',
                'description' => 'Indian manufacturer of hospital and home care equipment.',
                'logo' => 'https://logo.clearbit.com/bplmedical.com',
                'featured_image' => 'https://images.unsplash.com/photo-1538108149393-edd6fba627de'.self::CARD_SIZE,
            ],
            [
                'name' => 'Niscomed',
                'tagline' => 'Mobility Aids',
                'description' => 'Affordable wheelchairs, beds, and mobility aids.',
                'logo' => 'https://logo.clearbit.com/niscomed.com',
                'featured_image' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289'.self::CARD_SIZE,
            ],
            [
                'name' => 'Rossmax',
                'tagline' => 'Health Monitors',
                'description' => 'Precision health monitors and nebulizers.',
                'logo' => 'https://logo.clearbit.com/rossmax.com',
                'featured_image' => 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926'.self::CARD_SIZE,
            ],
            [
                'name' => 'Equinox',
                'tagline' => 'Digital Health',
                'description' => 'Digital thermometers, weighing scales, and BP machines.',
                'logo' => 'https://logo.clearbit.com/equinox-india.com',
                'featured_image' => 'https://images.unsplash.com/photo-1559757142-5d350d670d65'.self::CARD_SIZE,
            ],
            [
                'name' => 'Control D',
                'tagline' => 'Diabetes Care',
                'description' => 'Diabetes care and blood pressure monitoring devices.',
                'logo' => 'https://logo.clearbit.com/controld.in',
                'featured_image' => 'https://images.unsplash.com/photo-1579154204601-01588f351e67'.self::CARD_SIZE,
            ],
            [
                'name' => 'Medisana',
                'tagline' => 'Therapy Devices',
                'description' => 'European brand for home health and therapy devices.',
                'logo' => 'https://logo.clearbit.com/medisana.com',
                'featured_image' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d'.self::CARD_SIZE,
            ],
            [
                'name' => 'Vissco',
                'tagline' => 'Orthopaedic Care',
                'description' => 'Orthopaedic supports, walkers, and rehabilitation aids.',
                'logo' => 'https://logo.clearbit.com/vissco.com',
                'featured_image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'.self::CARD_SIZE,
            ],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(
                ['slug' => Str::slug($brand['name'])],
                [
                    'name' => $brand['name'],
                    'tagline' => $brand['tagline'],
                    'description' => $brand['description'],
                    'logo' => $brand['logo'],
                    'featured_image' => $brand['featured_image'],
                    'status' => 'active',
                ],
            );
        }
    }
}
