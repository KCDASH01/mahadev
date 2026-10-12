<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            SettingsSeeder::class,
            FashionAttributeSeeder::class,
            FashionCategorySeeder::class,
            FashionBrandSeeder::class,
            FashionCouponSeeder::class,
            FashionBannerSeeder::class,
            FashionPromoStripSeeder::class,
            FashionLookbookSeeder::class,
            FashionSocialStorySeeder::class,
            FashionTestimonialSeeder::class,
            FashionBlogSeeder::class,
            FashionSampleProductSeeder::class,
        ]);
    }
}
