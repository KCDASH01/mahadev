<?php

namespace App\Services;

use App\Models\Attribute;
use App\Models\Category;
use App\Models\Product;
use App\Support\StorefrontPath;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StorefrontCatalogService
{

    /**
     * @var array<string, string>
     */
    private const COLLECTION_HERO_IMAGES = [
        'gents' => 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1600&q=85',
        'ladies' => 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1600&q=85',
        'furniture' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=85',
        'trending' => 'menwomen.png',
    ];

    /**
     * @var array<string, string>
     */
    private const COLLECTION_HERO_POSITIONS = [
        'gents' => 'center 24%',
        'ladies' => 'center 20%',
        'furniture' => 'center 55%',
        'trending' => '50% 25%',
    ];

    public function __construct(
        private StorefrontProductService $products,
        private ExploreCollectionService $exploreCollectionService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function genderCollection(string $slug, ?string $selectedCategory = null): array
    {
        $parent = Category::query()
            ->where('slug', $slug)
            ->whereNull('parent_id')
            ->where('status', 'active')
            ->first();

        if (! $parent) {
            throw new ModelNotFoundException("Collection [{$slug}] not found.");
        }

        $productModels = $this->products->forGender($slug);

        $categories = $this->subcategories($parent);

        return [
            'products' => $this->products->collection($productModels),
            'categories' => $categories,
            'collection' => $this->collectionMeta($parent),
            'filters' => $this->filterFacets($productModels),
            'selectedCategory' => $this->selectedCategory($selectedCategory, array_column($categories, 'label')),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function trendingPage(?string $selectedCategory = null): array
    {
        $productModels = $this->products->trending();
        $categories = $this->topLevelCategories();

        return [
            'products' => $this->products->collection($productModels),
            'categories' => $categories,
            'collection' => [
                'title' => 'Best Sellers This Week',
                'slug' => 'trending',
                'gender' => null,
                'heroImage' => self::COLLECTION_HERO_IMAGES['trending'],
                'heroImagePosition' => self::COLLECTION_HERO_POSITIONS['trending'],
            ],
            'filters' => $this->filterFacets($productModels),
            'selectedCategory' => $this->selectedCategory($selectedCategory, array_column($categories, 'label')),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function newArrivalsPage(?string $selectedCategory = null): array
    {
        $productModels = $this->products->newArrivals();
        $products = $this->products->collection($productModels);
        $categories = $this->products->catalogCategories($products);

        return [
            'products' => $products,
            'categories' => $categories,
            'collection' => [
                'title' => 'New Arrivals',
                'slug' => 'new-arrivals',
                'gender' => null,
                'heroImage' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85',
                'heroImagePosition' => '50% 22%',
            ],
            'filters' => $this->filterFacets($productModels),
            'selectedCategory' => $this->selectedCategory($selectedCategory, array_column($categories, 'label')),
        ];
    }

    /**
     * @return array<int, array{label: string, image: string, count: int, filter: string}>
     */
    private function subcategories(Category $parent): array
    {
        return Category::query()
            ->where('parent_id', $parent->id)
            ->where('status', 'active')
            ->withCount(['products' => fn ($query) => $query->where('status', 'active')])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'image'])
            ->map(fn (Category $category) => [
                'label' => $category->name,
                'image' => $category->image ?: $this->products->categoryImageFallback($category->name),
                'count' => (int) $category->products_count,
                'filter' => 'category',
                'href' => StorefrontPath::collectionCategory($parent->slug, $category->name),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, image: string, count: int, filter: string, href?: string}>
     */
    private function topLevelCategories(): array
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->whereIn('slug', ExploreCollectionService::SLUGS)
            ->where('status', 'active')
            ->withCount(['products' => fn ($query) => $query->where('status', 'active')])
            ->get(['name', 'slug', 'image'])
            ->keyBy('slug');

        return collect(ExploreCollectionService::SLUGS)
            ->map(function (string $slug) use ($categories): ?array {
                $category = $categories->get($slug);

                if (! $category) {
                    return null;
                }

                return [
                    'label' => $category->name,
                    'image' => $this->exploreCollectionService->imageForSlug($slug, $category),
                    'count' => (int) $category->products_count,
                    'filter' => 'gender',
                    'href' => StorefrontPath::collection($slug),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Product>  $products
     * @return array{price: array{min: float, max: float}, attributes: array<int, array<string, mixed>>}
     */
    private function filterFacets(Collection $products): array
    {
        if ($products->isEmpty()) {
            return [
                'price' => ['min' => 0, 'max' => 9999],
                'attributes' => [],
            ];
        }

        $presentValues = [];

        foreach ($products as $product) {
            foreach ($this->products->filterAttributes($product) as $slug => $values) {
                foreach ($values as $value) {
                    $presentValues[$slug][$value] = true;
                }
            }
        }

        $categoryIds = $products->pluck('category_id')->unique()->filter()->values();

        $attributeIds = DB::table('category_attribute')
            ->whereIn('category_id', $categoryIds)
            ->where('is_filterable', true)
            ->pluck('attribute_id')
            ->unique();

        $attributes = Attribute::query()
            ->whereIn('id', $attributeIds)
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->with(['values' => fn ($query) => $query->where('status', 'active')->orderBy('sort_order')])
            ->get();

        $filterAttributes = $attributes
            ->map(function (Attribute $attribute) use ($presentValues): ?array {
                $slug = $attribute->slug;
                $options = [];

                foreach ($attribute->values as $value) {
                    if (! isset($presentValues[$slug][$value->value])) {
                        continue;
                    }

                    $options[] = [
                        'value' => $value->value,
                        'label' => $value->value,
                        'meta' => $value->meta,
                    ];
                }

                if (isset($presentValues[$slug])) {
                    foreach (array_keys($presentValues[$slug]) as $value) {
                        if (collect($options)->contains(fn (array $option) => $option['value'] === $value)) {
                            continue;
                        }

                        $options[] = [
                            'value' => $value,
                            'label' => $value,
                            'meta' => null,
                        ];
                    }
                }

                if ($options === []) {
                    return null;
                }

                return [
                    'slug' => $slug,
                    'name' => $attribute->name,
                    'inputType' => $attribute->input_type,
                    'options' => $options,
                ];
            })
            ->filter()
            ->values()
            ->all();

        $prices = $products->pluck('sale_price')->map(fn ($price) => (float) $price);

        return [
            'price' => [
                'min' => (float) floor($prices->min()),
                'max' => (float) ceil($prices->max()),
            ],
            'attributes' => $filterAttributes,
        ];
    }

    /**
     * @return array{title: string, slug: string, gender: string|null, heroImage: string, heroImagePosition: string}
     */
    private function collectionMeta(Category $parent): array
    {
        $slug = $parent->slug;

        return [
            'title' => StorefrontPath::displayName($slug),
            'slug' => $slug,
            'gender' => $this->products->displayGender($parent->gender),
                'heroImage' => self::COLLECTION_HERO_IMAGES[$slug]
                ?? ($parent->image ?: self::COLLECTION_HERO_IMAGES['gents']),
            'heroImagePosition' => self::COLLECTION_HERO_POSITIONS[$slug] ?? 'center center',
        ];
    }

    /**
     * @param  array<int, string>  $names
     */
    private function selectedCategory(?string $category, array $names = []): string
    {
        $value = trim((string) $category);

        if ($value === '') {
            return 'All';
        }

        return StorefrontPath::resolveCategoryName($value, $names);
    }
}
