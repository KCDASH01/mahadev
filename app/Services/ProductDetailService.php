<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Collection;

class ProductDetailService
{
    /**
     * @return array<string, mixed>
     */
    public function show(Product $product): array
    {
        $product->load([
            'category:id,name,slug',
            'brand:id,name,slug',
            'images' => fn ($query) => $query->orderBy('sort_order'),
            'variants' => fn ($query) => $query
                ->where('status', 'active')
                ->with('optionValues.attribute')
                ->orderBy('id'),
        ]);

        return [
            'product' => $this->formatProduct($product),
            'relatedProducts' => $this->relatedProducts($product),
            'navCategories' => $this->navCategories(),
            'reviews' => $this->demoReviews(),
            'ratingSummary' => $this->ratingSummary(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatProduct(Product $product): array
    {
        $images = $product->images
            ->pluck('image')
            ->filter()
            ->values()
            ->all();

        if ($product->thumbnail && ! in_array($product->thumbnail, $images, true)) {
            array_unshift($images, $product->thumbnail);
        }

        if ($images === []) {
            $images = [$product->thumbnail];
        }

        $variants = $product->variants;
        $variantGroups = $this->formatVariantGroups($variants);

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'short_description' => $product->short_description,
            'description' => $product->description,
            'specifications' => $this->formatSpecifications($product),
            'original_price' => (string) $product->original_price,
            'sale_price' => (string) $product->sale_price,
            'stock' => $product->stock,
            'weight' => $product->weight !== null ? (string) $product->weight : null,
            'thumbnail' => $product->thumbnail,
            'images' => $images,
            'is_featured' => $product->is_featured,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
            ] : null,
            'variant_groups' => $variantGroups,
            'has_variants' => $variantGroups !== [],
        ];
    }

    /**
     * @return array<int, array{name: string, options: array<int, array<string, mixed>>}>
     */
    private function formatVariantGroups(Collection $variants): array
    {
        return $variants
            ->flatMap(fn ($variant) => $variant->optionValues->map(fn ($value) => [
                'variant' => $variant,
                'attribute' => $value->attribute?->name ?? 'Option',
                'value' => $value->value,
            ]))
            ->groupBy('attribute')
            ->map(fn (Collection $group, string $name) => [
                'name' => $name,
                'options' => $group
                    ->unique('value')
                    ->map(fn ($item) => [
                        'id' => $item['variant']->id,
                        'value' => $item['value'],
                        'original_price' => (string) $item['variant']->original_price,
                        'sale_price' => (string) $item['variant']->sale_price,
                        'stock' => $item['variant']->stock,
                        'sku' => $item['variant']->sku,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    private function formatSpecifications(Product $product): array
    {
        if (is_array($product->specifications) && $product->specifications !== []) {
            return collect($product->specifications)
                ->map(fn ($spec) => [
                    'label' => (string) ($spec['label'] ?? ''),
                    'value' => (string) ($spec['value'] ?? ''),
                ])
                ->filter(fn ($spec) => $spec['label'] !== '' && $spec['value'] !== '')
                ->values()
                ->all();
        }

        return array_values(array_filter([
            $product->brand ? ['label' => 'Brand', 'value' => $product->brand->name] : null,
            ['label' => 'Model', 'value' => $product->sku],
            ['label' => 'Warranty', 'value' => '1 Year Manufacturer Warranty'],
            $product->weight ? ['label' => 'Weight', 'value' => "{$product->weight} kg"] : null,
            ['label' => 'Power Source', 'value' => 'Battery / AC Adapter (as applicable)'],
        ]));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function relatedProducts(Product $product): array
    {
        return Product::query()
            ->where('status', 'active')
            ->where('id', '!=', $product->id)
            ->when(
                $product->category_id,
                fn ($query) => $query->where('category_id', $product->category_id),
            )
            ->with(['brand:id,name,slug'])
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(fn (Product $related) => [
                'id' => $related->id,
                'name' => $related->name,
                'slug' => $related->slug,
                'original_price' => (string) $related->original_price,
                'sale_price' => (string) $related->sale_price,
                'thumbnail' => $related->thumbnail,
                'rating' => 4.5,
                'review_count' => 24,
            ])
            ->all();
    }

    /**
     * @return Collection<int, Category>
     */
    private function navCategories(): Collection
    {
        return Category::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->limit(8)
            ->get(['id', 'name', 'slug']);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function demoReviews(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'Rahul Mehta',
                'email' => 'rahul@example.com',
                'rating' => 5,
                'comment' => 'Excellent build quality and accurate readings. Delivery was fast and packaging was secure.',
                'date' => '2026-03-08',
            ],
            [
                'id' => 2,
                'name' => 'Sneha Kapoor',
                'email' => 'sneha@example.com',
                'rating' => 4,
                'comment' => 'Very useful for home monitoring. Easy to use and the display is clear. Would recommend.',
                'date' => '2026-02-19',
            ],
            [
                'id' => 3,
                'name' => 'Dr. Arjun Pillai',
                'email' => 'arjun@example.com',
                'rating' => 5,
                'comment' => 'Genuine product with proper warranty documentation. Ideal for clinic and home care setups.',
                'date' => '2026-01-30',
            ],
            [
                'id' => 4,
                'name' => 'Meena Joshi',
                'email' => 'meena@example.com',
                'rating' => 4,
                'comment' => 'Good value for money. Customer support helped with setup questions promptly.',
                'date' => '2026-01-12',
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function ratingSummary(): array
    {
        return [
            'average' => 4.8,
            'total' => 124,
            'breakdown' => [
                5 => 78,
                4 => 32,
                3 => 10,
                2 => 3,
                1 => 1,
            ],
        ];
    }
}
