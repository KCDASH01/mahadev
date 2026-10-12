<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class StorefrontProductService
{
    /**
     * @var array<string, string>
     */
    public const CATEGORY_IMAGES = [
        'Jeans' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=85',
        'Shirts' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=85',
        'Trousers' => 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=85',
        'Jackets' => 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=85',
        'T-Shirts' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85',
        'Hoodies' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=85',
        'Dresses' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85',
        'Kurtis' => 'https://images.unsplash.com/photo-1759840278381-bf7d5e332050?auto=format&fit=crop&w=700&q=85',
        'Sarees' => 'https://images.unsplash.com/photo-1769275061356-a038b498c4a7?auto=format&fit=crop&w=700&q=85',
        'Tops' => 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=85',
        'Ethnic Wear' => 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=700&q=85',
        'Shirt' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=85',
        'T-Shirt' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85',
        'Kurta' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=700&q=85',
        'Blazer' => 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=85',
        'Saree' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85',
        'Top' => 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=85',
        'Kurti' => 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=700&q=85',
        'Lehenga' => 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=700&q=85',
        'Sofa' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85',
        'Bed' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=85',
        'Dressing Table' => 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85',
        'Alena' => 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=700&q=85',
        'Shoe Rack' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=700&q=85',
        'Almirah' => 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85',
        'Kitchen Stand' => 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=700&q=85',
        'Vegetable Stand' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=700&q=85',
        'Necklaces' => 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=85',
        'Earrings' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=85',
        'Bracelets' => 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=85',
        'Rings' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=85',
        'Bangles' => 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=700&q=85',
        'Jewellery Sets' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85',
        'Anklets' => 'https://images.unsplash.com/photo-1573408301185-91476d990662?auto=format&fit=crop&w=700&q=85',
        'Other Jewellery' => 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=85',
    ];

    /**
     * @var array<string, array<int, string>>
     */
    private const CATEGORY_ORDER = [
        'gents' => ['Jeans', 'Shirt', 'T-Shirt', 'Kurta', 'Blazer'],
        'ladies' => ['Saree', 'Top', 'Jeans', 'Kurti', 'Lehenga'],
        'furniture' => ['Sofa', 'Bed', 'Dressing Table', 'Alena', 'Shoe Rack', 'Almirah', 'Kitchen Stand', 'Vegetable Stand'],
    ];

    /**
     * @return Builder<Product>
     */
    public function baseQuery(): Builder
    {
        return Product::query()
            ->where('status', 'active')
            ->with([
                'category:id,name,slug,parent_id,gender',
                'category.parent:id,gender,slug',
                'images' => fn ($query) => $query->orderBy('sort_order'),
                'variants' => fn ($query) => $query
                    ->where('status', 'active')
                    ->with(['optionValues.attribute']),
                'attributeValues.attribute',
            ]);
    }

    /**
     * @return Collection<int, Product>
     */
    public function forGender(string $gender): Collection
    {
        $normalizedGender = $this->normalizeGender($gender);
        $categoryIds = $this->categoryIdsForGenderCollection($normalizedGender);

        return $this->baseQuery()
            ->clothing()
            ->where(function (Builder $builder) use ($normalizedGender, $categoryIds): void {
                $builder->where('gender', $normalizedGender);

                if ($categoryIds->isNotEmpty()) {
                    $builder->orWhere(function (Builder $nested) use ($categoryIds): void {
                        $nested->whereIn('category_id', $categoryIds)
                            ->where(function (Builder $genderBuilder): void {
                                $genderBuilder->whereNull('gender')
                                    ->orWhere('gender', '');
                            });
                    });
                }
            })
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * @return Collection<int, Product>
     */
    public function forJewellery(): Collection
    {
        $categoryIds = $this->categoryIdsForGenderCollection('jewellery');

        return $this->baseQuery()
            ->jewellery()
            ->when(
                $categoryIds->isNotEmpty(),
                fn (Builder $builder) => $builder->whereIn('category_id', $categoryIds),
            )
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * @return Collection<int, Product>
     */
    public function trending(?int $limit = null): Collection
    {
        $query = $this->baseQuery()
            ->where('is_featured', true)
            ->orderByDesc('review_count')
            ->orderByDesc('avg_rating')
            ->orderByDesc('created_at');

        if ($limit !== null) {
            $query->limit($limit);
        }

        $products = $query->get();

        if ($products->isNotEmpty()) {
            return $products;
        }

        return $this->baseQuery()
            ->orderByDesc('review_count')
            ->orderByDesc('avg_rating')
            ->when($limit !== null, fn (Builder $builder) => $builder->limit($limit))
            ->get();
    }

    /**
     * @return Collection<int, Product>
     */
    public function featured(int $limit = 8): Collection
    {
        return $this->baseQuery()
            ->where('is_featured', true)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * @return Collection<int, Product>
     */
    public function newArrivals(?int $limit = null): Collection
    {
        $query = $this->baseQuery()
            ->where(function (Builder $builder): void {
                $builder->where('is_new_arrival', true)
                    ->orWhereNotNull('published_at');
            })
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        if ($limit !== null) {
            $query->limit($limit);
        }

        $products = $query->get();

        if ($products->isNotEmpty()) {
            return $products;
        }

        return $this->baseQuery()
            ->orderByDesc('created_at')
            ->when($limit !== null, fn (Builder $builder) => $builder->limit($limit))
            ->get();
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findBySlug(string $slug): ?array
    {
        $product = $this->baseQuery()->where('slug', $slug)->first();

        return $product ? $this->toFashionProduct($product) : null;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function related(Product $product, int $limit = 4): array
    {
        return $this->baseQuery()
            ->where('id', '!=', $product->id)
            ->when(
                $product->isJewellery(),
                fn (Builder $builder) => $builder->jewellery(),
                fn (Builder $builder) => $builder->clothing(),
            )
            ->where(function (Builder $builder) use ($product): void {
                $builder->where('category_id', $product->category_id)
                    ->orWhere('gender', $product->gender);
            })
            ->orderByDesc('is_featured')
            ->orderByDesc('review_count')
            ->limit($limit)
            ->get()
            ->map(fn (Product $related) => $this->toFashionProduct($related))
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Product>  $products
     * @return array<int, array<string, mixed>>
     */
    public function collection(Collection $products): array
    {
        return $products
            ->map(fn (Product $product) => $this->toFashionProduct($product))
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $products
     * @return array<int, array{label: string, image: string, count: int}>
     */
    public function catalogCategories(array $products, ?string $gender = null): array
    {
        if ($products === []) {
            return [];
        }

        $grouped = collect($products)->groupBy('category');
        $available = $grouped->keys()->filter()->values();
        $order = self::CATEGORY_ORDER[$this->normalizeGender($gender ?? '')] ?? [];
        $sorted = $order !== []
            ? collect($order)->filter(fn (string $category) => $available->contains($category))
                ->concat($available->diff($order)->sort()->values())
            : $available->sort()->values();

        return $sorted
            ->map(function (string $category) use ($grouped): array {
                $categoryProducts = $grouped->get($category, collect());

                return [
                    'label' => $category,
                    'image' => self::CATEGORY_IMAGES[$category]
                        ?? $categoryProducts->first()['image']
                        ?? '',
                    'count' => $categoryProducts->count(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function toFashionProduct(Product $product): array
    {
        $gallery = $this->galleryImages($product);
        $sizes = $this->sizeOptions($product);
        $colors = $this->colorVariants($product);
        $primaryColor = $colors[0]['name'] ?? $this->primaryColorName($product);
        $hasApprovedReviews = (int) $product->review_count > 0;

        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'productType' => $product->isJewellery() ? Product::TYPE_JEWELLERY : Product::TYPE_CLOTHING,
            'gender' => $this->resolveProductGender($product),
            'name' => $product->name,
            'category' => $product->category?->name ?? 'Fashion',
            'categoryId' => $product->category_id,
            'image' => $product->thumbnail ?: ($gallery[0] ?? ''),
            'gallery' => $gallery,
            'colors' => $colors !== [] ? $colors : null,
            'offers' => $this->resolveOffers($product),
            'variantOptions' => $this->variantOptions($product),
            'price' => (float) $product->sale_price,
            'originalPrice' => (float) $product->original_price,
            'stock' => (int) $product->stock,
            'rating' => $hasApprovedReviews
                ? (float) $product->avg_rating
                : (float) $product->display_rating,
            'reviews' => $hasApprovedReviews
                ? (int) $product->review_count
                : (int) $product->display_review_count,
            'sizes' => $sizes,
            'color' => $primaryColor,
            'badge' => $product->badge ?? '',
            'fit' => $product->fit ?? '',
            'short_description' => $product->short_description ?? '',
            'description' => $product->description ?? '',
            'careInstructions' => $product->care_instructions ?? '',
            'details' => $this->formatDetails($product),
            'attributes' => $this->filterAttributes($product),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function formatDetails(Product $product): array
    {
        $details = $product->details;

        if (! is_array($details) || $details === []) {
            return [];
        }

        if (array_is_list($details)) {
            return array_values(array_filter(
                $details,
                fn ($detail) => is_string($detail) && trim($detail) !== '',
            ));
        }

        $labels = [
            'material' => 'Material',
            'metal' => 'Metal',
            'finish' => 'Finish',
            'color' => 'Color',
            'stone' => 'Stone',
            'occasion' => 'Occasion',
            'care' => 'Care',
            'weight' => 'Weight',
        ];

        $formatted = [];

        foreach ($details as $key => $value) {
            if (! filled($value)) {
                continue;
            }

            $label = $labels[$key] ?? Str::headline((string) $key);
            $formatted[] = "{$label}: {$value}";
        }

        return $formatted;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function filterAttributes(Product $product): array
    {
        $attributes = [];

        foreach ($product->variants as $variant) {
            foreach ($variant->optionValues as $optionValue) {
                $slug = $optionValue->attribute?->slug;

                if (! $slug) {
                    continue;
                }

                $attributes[$slug] ??= [];

                if (! in_array($optionValue->value, $attributes[$slug], true)) {
                    $attributes[$slug][] = $optionValue->value;
                }
            }
        }

        foreach ($product->attributeValues as $attributeValue) {
            $slug = $attributeValue->attribute?->slug;

            if (! $slug) {
                continue;
            }

            $attributes[$slug] ??= [];

            if (! in_array($attributeValue->value, $attributes[$slug], true)) {
                $attributes[$slug][] = $attributeValue->value;
            }
        }

        if ($product->fit) {
            $attributes['fit'] ??= [];

            if (! in_array($product->fit, $attributes['fit'], true)) {
                $attributes['fit'][] = $product->fit;
            }
        }

        foreach ($attributes as $slug => $values) {
            if ($slug === 'size') {
                $attributes[$slug] = $this->sortSizes($values);
            } else {
                sort($attributes[$slug]);
            }
        }

        return $attributes;
    }

    /**
     * @return array<int, array{id: int, color: string|null, size: string|null, stock: int, salePrice: float, originalPrice: float}>
     */
    private function variantOptions(Product $product): array
    {
        return $product->variants
            ->where('status', 'active')
            ->map(function ($variant): array {
                $color = $variant->optionValues
                    ->first(fn ($value) => $value->attribute?->slug === 'color');
                $size = $variant->optionValues
                    ->first(fn ($value) => $value->attribute?->slug === 'size');

                return [
                    'id' => $variant->id,
                    'color' => $color?->value,
                    'size' => $size?->value,
                    'stock' => (int) $variant->stock,
                    'salePrice' => (float) $variant->sale_price,
                    'originalPrice' => (float) $variant->original_price,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, string>
     */
    private function galleryImages(Product $product): array
    {
        $images = $product->images
            ->pluck('image')
            ->filter()
            ->values()
            ->all();

        if ($product->thumbnail && ! in_array($product->thumbnail, $images, true)) {
            array_unshift($images, $product->thumbnail);
        }

        if ($images === [] && $product->thumbnail) {
            $images = [$product->thumbnail];
        }

        return $images;
    }

    /**
     * @return array<int, string>
     */
    private function sizeOptions(Product $product): array
    {
        $sizes = $product->variants
            ->flatMap(function ($variant) {
                return $variant->optionValues
                    ->filter(fn ($value) => $value->attribute?->slug === 'size')
                    ->pluck('value');
            })
            ->unique()
            ->values();

        if ($sizes->isNotEmpty()) {
            return $this->sortSizes($sizes->all());
        }

        // No invented sizes — base products buy without a size selector.
        return [];
    }

    /**
     * @return array<int, array{name: string, image: string, hex?: string, gallery?: array<int, string>}>
     */
    private function colorVariants(Product $product): array
    {
        if ($product->isJewellery()) {
            return [];
        }

        $colorValues = $product->variants
            ->flatMap(fn ($variant) => $variant->optionValues)
            ->filter(fn ($value) => $value->attribute?->slug === 'color')
            ->unique('id')
            ->values();

        if ($colorValues->isEmpty()) {
            // No invented colors from gallery — base products show full gallery only.
            return [];
        }

        return $colorValues
            ->map(function ($colorValue) use ($product): array {
                $colorImages = $product->images
                    ->where('color_value_id', $colorValue->id)
                    ->pluck('image')
                    ->filter()
                    ->values()
                    ->all();

                $image = $colorImages[0] ?? $product->thumbnail ?? '';
                $meta = is_array($colorValue->meta) ? $colorValue->meta : [];
                $type = $meta['type'] ?? 'solid';

                return [
                    'name' => $colorValue->value,
                    'image' => $image,
                    'type' => $type,
                    'hex' => $type === 'solid' ? ($meta['hex'] ?? null) : null,
                    'gallery' => $colorImages !== [] ? $colorImages : null,
                ];
            })
            ->values()
            ->all();
    }

    private function primaryColorName(Product $product): ?string
    {
        $color = $product->variants
            ->flatMap(fn ($variant) => $variant->optionValues)
            ->first(fn ($value) => $value->attribute?->slug === 'color');

        if ($color) {
            return $color->value;
        }

        $attributeColor = $product->attributeValues
            ->first(fn ($value) => $value->attribute?->slug === 'color');

        return $attributeColor?->value;
    }

    /**
     * @param  array<int, string>  $sizes
     * @return array<int, string>
     */
    private function sortSizes(array $sizes): array
    {
        $alpha = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
        $alphaSizes = array_values(array_intersect($alpha, $sizes));
        $numericSizes = array_values(array_filter($sizes, fn (string $size) => ! in_array($size, $alpha, true)));
        sort($numericSizes, SORT_NUMERIC);

        return array_values(array_merge($alphaSizes, $numericSizes));
    }

    public function categoryImageFallback(string $categoryName): string
    {
        return self::CATEGORY_IMAGES[$categoryName]
            ?? 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85';
    }

    public function displayGender(?string $gender): string
    {
        return match ($this->normalizeGender($gender ?? '')) {
            'gents' => 'Gents',
            'ladies' => 'Ladies',
            'furniture' => 'Furniture',
            default => 'Mahadev',
        };
    }

    /**
     * @return Collection<int, int>
     */
    private function categoryIdsForGenderCollection(string $gender): Collection
    {
        $parent = Category::query()
            ->where('slug', $gender)
            ->whereNull('parent_id')
            ->where('status', 'active')
            ->first();

        if (! $parent) {
            return collect();
        }

        return Category::query()
            ->where('parent_id', $parent->id)
            ->where('status', 'active')
            ->pluck('id');
    }

    private function resolveProductGender(Product $product): string
    {
        $gender = trim((string) ($product->gender ?? ''));

        if ($gender !== '') {
            return $this->displayGender($gender);
        }

        $categoryGender = $product->category?->parent?->gender
            ?? $product->category?->gender;

        return $this->displayGender($categoryGender);
    }

    private function normalizeGender(string $gender): string
    {
        return strtolower(trim($gender));
    }

    /**
     * @return array<int, array{title: string, detail: string, code: string}>
     */
    public function resolveOffers(Product $product): array
    {
        return $this->activeCoupons($product);
    }

    /**
     * @return array<int, array{title: string, detail: string, code: string}>
     */
    private function activeCoupons(Product $product): array
    {
        return Coupon::query()
            ->where('status', 'active')
            ->where(function ($query): void {
                $query->whereNull('expiry_date')
                    ->orWhereDate('expiry_date', '>=', now()->toDateString());
            })
            ->where(function ($query): void {
                $query->whereNull('usage_limit')
                    ->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->when(
                $product->category_id,
                fn ($query) => $query->where(function ($builder) use ($product): void {
                    $builder->whereDoesntHave('categories')
                        ->orWhereHas('categories', fn ($categoryQuery) => $categoryQuery
                            ->where('categories.id', $product->category_id));
                }),
            )
            ->orderBy('id')
            ->limit(10)
            ->get(['id', 'code', 'title', 'type', 'value', 'minimum_amount'])
            ->map(fn (Coupon $coupon): array => $this->formatCouponOffer($coupon))
            ->values()
            ->all();
    }

    /**
     * @return array{title: string, detail: string, code: string}
     */
    private function formatCouponOffer(Coupon $coupon): array
    {
        $minimum = (float) $coupon->minimum_amount;
        $detail = $minimum > 0
            ? 'Add items worth ₹'.number_format($minimum, 0).' or more to unlock this offer'
            : 'Apply coupon at checkout';

        $title = filled($coupon->title)
            ? (string) $coupon->title
            : match ($coupon->type) {
                'fixed' => 'Get Flat ₹'.number_format((float) $coupon->value, 0).' OFF',
                'percentage' => 'Get Flat '.number_format((float) $coupon->value, 0).'% OFF',
                'free_shipping' => 'Free Shipping',
                'buy_x_get_y' => 'Buy 2 Get 1 Free',
                'first_order' => 'Flat '.number_format((float) $coupon->value, 0).'% OFF on First Order',
                default => 'Special Discount Offer',
            };

        return [
            'title' => $title,
            'detail' => $detail,
            'code' => $coupon->code,
        ];
    }
}
