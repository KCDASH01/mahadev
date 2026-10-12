<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    private const IMG_SIZE = '?w=400&h=400&fit=crop';

    private const GALLERY_SIZE = '?w=800&h=800&fit=crop';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Omron HEM 7120 BP Monitor',
                'category' => 'bp-monitors',
                'brand' => 'omron',
                'sku' => 'MED-BP-001',
                'thumbnail' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1576091160550-2173dba999ef'.self::GALLERY_SIZE,
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'.self::GALLERY_SIZE,
                    'https://images.unsplash.com/photo-1559757142-5d350d670d65'.self::GALLERY_SIZE,
                ],
                'original_price' => 2499,
                'sale_price' => 1699,
                'stock' => 45,
                'is_featured' => true,
                'days_ago' => 120,
                'variants' => [
                    ['name' => 'Model', 'value' => 'Basic', 'original' => 2499, 'sale' => 1699, 'stock' => 30, 'sku' => 'MED-BP-001-B'],
                    ['name' => 'Model', 'value' => 'Premium', 'original' => 2999, 'sale' => 2199, 'stock' => 15, 'sku' => 'MED-BP-001-P'],
                ],
                'specifications' => [
                    ['label' => 'Brand', 'value' => 'Omron'],
                    ['label' => 'Model', 'value' => 'HEM-7120'],
                    ['label' => 'Warranty', 'value' => '3 Years'],
                    ['label' => 'Weight', 'value' => '0.25 kg'],
                    ['label' => 'Power Source', 'value' => '4 AA Batteries / AC Adapter'],
                ],
            ],
            [
                'name' => 'Dr Trust Automatic BP Monitor 101',
                'category' => 'bp-monitors',
                'brand' => 'dr-trust',
                'sku' => 'MED-BP-002',
                'thumbnail' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'.self::GALLERY_SIZE,
                    'https://images.unsplash.com/photo-1576091160550-2173dba999ef'.self::GALLERY_SIZE,
                ],
                'original_price' => 1999,
                'sale_price' => 1299,
                'stock' => 60,
                'is_featured' => true,
                'days_ago' => 90,
            ],
            [
                'name' => 'Niscomed Folding Wheelchair',
                'category' => 'wheelchairs',
                'brand' => 'niscomed',
                'sku' => 'MED-WC-001',
                'thumbnail' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d'.self::GALLERY_SIZE,
                    'https://images.unsplash.com/photo-1582719471384-894fbb16e074'.self::GALLERY_SIZE,
                    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289'.self::GALLERY_SIZE,
                ],
                'original_price' => 8999,
                'sale_price' => 7499,
                'stock' => 20,
                'is_featured' => true,
                'days_ago' => 150,
                'variants' => [
                    ['name' => 'Size', 'value' => 'Small', 'original' => 8499, 'sale' => 6999, 'stock' => 6, 'sku' => 'MED-WC-001-S'],
                    ['name' => 'Size', 'value' => 'Medium', 'original' => 8999, 'sale' => 7499, 'stock' => 8, 'sku' => 'MED-WC-001-M'],
                    ['name' => 'Size', 'value' => 'Large', 'original' => 9499, 'sale' => 7999, 'stock' => 6, 'sku' => 'MED-WC-001-L'],
                ],
            ],
            [
                'name' => 'Vissco Invalid Wheelchair 809',
                'category' => 'wheelchairs',
                'brand' => 'vissco',
                'sku' => 'MED-WC-002',
                'thumbnail' => 'https://images.unsplash.com/photo-1582719471384-894fbb16e074'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1582719471384-894fbb16e074'.self::GALLERY_SIZE,
                ],
                'original_price' => 6500,
                'sale_price' => 5499,
                'stock' => 18,
                'is_featured' => false,
                'days_ago' => 80,
            ],
            [
                'name' => 'Philips Oxygen Concentrator 5L',
                'category' => 'oxygen-concentrators',
                'brand' => 'philips',
                'sku' => 'MED-OX-001',
                'thumbnail' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1579684385127-1ef15d508118'.self::GALLERY_SIZE,
                    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926'.self::GALLERY_SIZE,
                ],
                'original_price' => 65000,
                'sale_price' => 58999,
                'stock' => 8,
                'is_featured' => true,
                'days_ago' => 200,
                'variants' => [
                    ['name' => 'Model', 'value' => 'Standard', 'original' => 65000, 'sale' => 58999, 'stock' => 5, 'sku' => 'MED-OX-001-S'],
                    ['name' => 'Model', 'value' => 'Deluxe', 'original' => 72000, 'sale' => 64999, 'stock' => 3, 'sku' => 'MED-OX-001-D'],
                ],
            ],
            [
                'name' => 'Dr Trust Compressor Nebulizer',
                'category' => 'nebulizers',
                'brand' => 'dr-trust',
                'sku' => 'MED-NB-001',
                'thumbnail' => 'https://images.unsplash.com/photo-1581595219315-a187dd40c322'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1581595219315-a187dd40c322'.self::GALLERY_SIZE,
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'.self::GALLERY_SIZE,
                ],
                'original_price' => 2499,
                'sale_price' => 1899,
                'stock' => 35,
                'is_featured' => true,
                'days_ago' => 60,
            ],
            [
                'name' => 'BPL Hospital Bed with Side Rails',
                'category' => 'hospital-beds',
                'brand' => 'bpl-medical',
                'sku' => 'MED-HB-001',
                'thumbnail' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'.self::GALLERY_SIZE,
                ],
                'original_price' => 28000,
                'sale_price' => 24500,
                'stock' => 10,
                'is_featured' => false,
                'days_ago' => 110,
            ],
            [
                'name' => 'Vissco Walker with Wheels',
                'category' => 'walkers',
                'brand' => 'vissco',
                'sku' => 'MED-WK-001',
                'thumbnail' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289'.self::GALLERY_SIZE,
                ],
                'original_price' => 3200,
                'sale_price' => 2699,
                'stock' => 28,
                'is_featured' => false,
                'days_ago' => 45,
                'variants' => [
                    ['name' => 'Color', 'value' => 'Black', 'original' => 3200, 'sale' => 2699, 'stock' => 15, 'sku' => 'MED-WK-001-BK'],
                    ['name' => 'Color', 'value' => 'Silver', 'original' => 3300, 'sale' => 2799, 'stock' => 13, 'sku' => 'MED-WK-001-SL'],
                ],
            ],
            [
                'name' => 'Dr Trust Fingertip Pulse Oximeter',
                'category' => 'pulse-oximeters',
                'brand' => 'dr-trust',
                'sku' => 'MED-PO-001',
                'thumbnail' => 'https://images.unsplash.com/photo-1584982751601-97dcc096659c'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1584982751601-97dcc096659c'.self::GALLERY_SIZE,
                    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926'.self::GALLERY_SIZE,
                ],
                'original_price' => 1499,
                'sale_price' => 899,
                'stock' => 80,
                'is_featured' => true,
                'days_ago' => 30,
            ],
            [
                'name' => 'Beurer Infrared Thermometer',
                'category' => 'thermometers',
                'brand' => 'beurer',
                'sku' => 'MED-TH-001',
                'thumbnail' => 'https://images.unsplash.com/photo-1559757142-5d350d670d65'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1559757142-5d350d670d65'.self::GALLERY_SIZE,
                ],
                'original_price' => 2999,
                'sale_price' => 2199,
                'stock' => 42,
                'is_featured' => false,
                'days_ago' => 15,
            ],
            [
                'name' => 'AccuSure Glucometer Kit',
                'category' => 'glucometers',
                'brand' => 'accusure',
                'sku' => 'MED-GL-001',
                'thumbnail' => 'https://images.unsplash.com/photo-1579154204601-01588f351e67'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1579154204601-01588f351e67'.self::GALLERY_SIZE,
                ],
                'original_price' => 1299,
                'sale_price' => 999,
                'stock' => 55,
                'is_featured' => true,
                'days_ago' => 7,
            ],
            [
                'name' => 'Rossmax Mesh Nebulizer NB500',
                'category' => 'nebulizers',
                'brand' => 'rossmax',
                'sku' => 'MED-NB-002',
                'thumbnail' => 'https://images.unsplash.com/photo-1581595219315-a187dd40c322'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1581595219315-a187dd40c322'.self::GALLERY_SIZE,
                ],
                'original_price' => 3999,
                'sale_price' => 3299,
                'stock' => 22,
                'is_featured' => false,
                'days_ago' => 5,
            ],
            [
                'name' => 'Control D Home BP Monitor',
                'category' => 'bp-monitors',
                'brand' => 'control-d',
                'sku' => 'MED-BP-003',
                'thumbnail' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1576091160550-2173dba999ef'.self::GALLERY_SIZE,
                ],
                'original_price' => 1799,
                'sale_price' => 1399,
                'stock' => 38,
                'is_featured' => false,
                'days_ago' => 3,
            ],
            [
                'name' => 'Equinox Digital Thermometer EQ-DT60',
                'category' => 'thermometers',
                'brand' => 'equinox',
                'sku' => 'MED-TH-002',
                'thumbnail' => 'https://images.unsplash.com/photo-1559757142-5d350d670d65'.self::IMG_SIZE,
                'gallery' => [
                    'https://images.unsplash.com/photo-1559757142-5d350d670d65'.self::GALLERY_SIZE,
                ],
                'original_price' => 499,
                'sale_price' => 349,
                'stock' => 100,
                'is_featured' => false,
                'days_ago' => 1,
            ],
        ];

        foreach ($products as $productData) {
            $category = Category::query()->where('slug', $productData['category'])->first();
            $brand = Brand::query()->where('slug', $productData['brand'])->first();

            if (! $category) {
                continue;
            }

            $createdAt = now()->subDays($productData['days_ago']);

            $product = Product::updateOrCreate(
                ['sku' => $productData['sku']],
                [
                    'category_id' => $category->id,
                    'brand_id' => $brand?->id,
                    'name' => $productData['name'],
                    'slug' => Str::slug($productData['name']),
                    'short_description' => 'High-quality medical equipment designed for accurate home and clinical use with certified safety standards.',
                    'description' => 'This genuine medical device is sourced from authorized distributors and backed by manufacturer warranty. Ideal for daily monitoring and long-term healthcare needs with easy setup, reliable performance, and fast delivery across India.',
                    'specifications' => $productData['specifications'] ?? null,
                    'original_price' => $productData['original_price'],
                    'sale_price' => $productData['sale_price'],
                    'stock' => $productData['stock'],
                    'thumbnail' => $productData['thumbnail'],
                    'weight' => 1.5,
                    'is_featured' => $productData['is_featured'],
                    'status' => 'active',
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ],
            );

            $this->seedGallery($product, $productData['gallery'] ?? [$productData['thumbnail']]);
            $this->seedVariants($product, $productData['variants'] ?? []);
        }
    }

    /**
     * @param  array<int, string>  $images
     */
    private function seedGallery(Product $product, array $images): void
    {
        ProductImage::query()->where('product_id', $product->id)->delete();

        foreach (array_values(array_unique($images)) as $index => $image) {
            ProductImage::create([
                'product_id' => $product->id,
                'image' => $image,
                'sort_order' => $index,
            ]);
        }
    }

    /**
     * @param  array<int, array{name: string, value: string, original: float|int, sale: float|int, stock: int, sku: string}>  $variants
     */
    private function seedVariants(Product $product, array $variants): void
    {
        ProductVariant::query()->where('product_id', $product->id)->delete();

        foreach ($variants as $variant) {
            ProductVariant::create([
                'product_id' => $product->id,
                'variant_name' => $variant['name'],
                'variant_value' => $variant['value'],
                'original_price' => $variant['original'],
                'sale_price' => $variant['sale'],
                'stock' => $variant['stock'],
                'sku' => $variant['sku'],
                'status' => 'active',
            ]);
        }
    }
}
