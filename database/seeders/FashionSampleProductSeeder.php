<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class FashionSampleProductSeeder extends Seeder
{
    private array $catalog = [
        ['gents-jeans', 'Classic Straight Fit Jeans', 'MAH-G-JNS-001', 1999, 1399, 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85'],
        ['gents-shirt', 'Premium Cotton Shirt', 'MAH-G-SHT-001', 1499, 999, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85'],
        ['gents-kurta', 'Festive Cotton Kurta', 'MAH-G-KRT-001', 1899, 1299, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=85'],
        ['ladies-saree', 'Elegant Festive Saree', 'MAH-L-SAR-001', 2999, 2199, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85'],
        ['ladies-kurti', 'Everyday Printed Kurti', 'MAH-L-KRT-001', 1599, 1099, 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85'],
        ['ladies-lehenga', 'Celebration Lehenga Set', 'MAH-L-LEG-001', 5499, 4299, 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=85'],
        ['furniture-sofa', 'Comfort Three Seater Sofa', 'MAH-F-SOF-001', 28999, 23999, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85'],
        ['furniture-bed', 'Classic Double Bed', 'MAH-F-BED-001', 32999, 26999, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85'],
        ['furniture-almirah', 'Spacious Storage Almirah', 'MAH-F-ALM-001', 18999, 15499, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85'],
        ['furniture-kitchen-stand', 'Multipurpose Kitchen Stand', 'MAH-F-KST-001', 4999, 3799, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85'],
    ];

    public function run(): void
    {
        $brand = Brand::query()->where('slug', 'mahadev')->first();

        if (! $brand) {
            return;
        }

        foreach ($this->catalog as $index => [$categorySlug, $name, $sku, $originalPrice, $salePrice, $image]) {
            $category = Category::query()->where('slug', $categorySlug)->first();

            if (! $category) {
                continue;
            }

            Product::updateOrCreate(
                ['sku' => $sku],
                [
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'gender' => $category->gender,
                    'name' => $name,
                    'slug' => str($name)->slug(),
                    'short_description' => 'Selected by Mahadev for dependable quality and everyday value.',
                    'description' => "{$name} from Mahadev Multipurpose Co-operative Society Ltd, chosen for quality, utility and value.",
                    'badge' => $index < 3 ? 'Featured' : 'New arrival',
                    'display_rating' => 4.6,
                    'display_review_count' => 24 + $index,
                    'original_price' => $originalPrice,
                    'sale_price' => $salePrice,
                    'stock' => 20,
                    'thumbnail' => $image,
                    'is_featured' => $index < 8,
                    'is_new_arrival' => true,
                    'is_trending' => $index % 2 === 0,
                    'published_at' => now(),
                    'status' => 'active',
                    'product_type' => Product::TYPE_CLOTHING,
                ],
            );
        }
    }
}
