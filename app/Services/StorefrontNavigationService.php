<?php

namespace App\Services;

use App\Models\Category;
use App\Support\StorefrontPath;
use Illuminate\Support\Facades\Cache;

class StorefrontNavigationService
{
    private const COLLECTION_SLUGS = ['gents', 'ladies', 'furniture'];

    public function build(): array
    {
        return Cache::remember('storefront.navigation.mahadev.v1', now()->addMinutes(10), function (): array {
            return [
                'items' => [
                    ['label' => 'Garments', 'key' => 'Garments', 'href' => StorefrontPath::collection('gents'), 'mega' => true],
                    ['label' => 'Furniture', 'key' => 'Furniture', 'href' => StorefrontPath::collection('furniture'), 'mega' => true],
                    ['label' => 'New Arrivals', 'href' => '/new-arrivals', 'mega' => false, 'highlight' => true],
                    ['label' => 'About Us', 'href' => '/about', 'mega' => false],
                    ['label' => 'Contact', 'href' => '/contact', 'mega' => false],
                ],
                'megaMenus' => $this->megaMenus(),
            ];
        });
    }

    public static function flushCache(): void
    {
        Cache::forget('storefront.navigation');
        Cache::forget('storefront.navigation.v2');
        Cache::forget('storefront.navigation.mahadev.v1');
    }

    public function megaMenus(): array
    {
        $gents = $this->categoryLinks('gents');
        $ladies = $this->categoryLinks('ladies');
        $furniture = $this->categoryLinks('furniture');

        return [
            'Garments' => [
                'href' => StorefrontPath::collection('gents'),
                'columns' => [
                    ['title' => 'Gents', 'links' => $gents],
                    ['title' => 'Ladies', 'links' => $ladies],
                    ['title' => 'Quick Shop', 'links' => [
                        ['label' => 'All Gents Garments', 'href' => StorefrontPath::collection('gents')],
                        ['label' => 'All Ladies Garments', 'href' => StorefrontPath::collection('ladies')],
                        ['label' => 'New Arrivals', 'href' => '/new-arrivals'],
                    ]],
                ],
            ],
            'Furniture' => [
                'href' => StorefrontPath::collection('furniture'),
                'columns' => $this->chunkLinks($furniture),
            ],
        ];
    }

    public function featuredCategories(): array
    {
        return Category::query()
            ->whereNotNull('parent_id')
            ->where('is_featured', true)
            ->where('status', 'active')
            ->whereHas('parent', fn ($query) => $query->whereIn('slug', self::COLLECTION_SLUGS))
            ->with('parent:id,slug,gender')
            ->withCount(['products' => fn ($query) => $query->where('status', 'active')])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'image', 'parent_id'])
            ->map(function (Category $category): array {
                $collection = $category->parent?->slug ?? 'gents';
                $count = (int) $category->products_count;

                return [
                    'title' => $category->name,
                    'count' => $count > 0 ? "{$count}+" : 'New',
                    'image' => $category->image ?: $this->fallbackCategoryImage($category->name),
                    'href' => StorefrontPath::collectionCategory($collection, $category->name),
                    'gender' => StorefrontPath::displayName($collection),
                    'imagePosition' => 'center center',
                ];
            })
            ->values()
            ->all();
    }

    private function categoryLinks(string $slug): array
    {
        $parent = Category::query()->where('slug', $slug)->whereNull('parent_id')->first();

        if (! $parent) {
            return [];
        }

        return Category::query()
            ->where('parent_id', $parent->id)
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get(['name'])
            ->map(fn (Category $category) => [
                'label' => $category->name,
                'href' => StorefrontPath::collectionCategory($slug, $category->name),
            ])
            ->all();
    }

    private function chunkLinks(array $links): array
    {
        return collect($links)->chunk(4)->values()->map(fn ($chunk, int $index) => [
            'title' => $index === 0 ? 'Living & Bedroom' : 'Storage & Utility',
            'links' => $chunk->values()->all(),
        ])->all();
    }

    private function fallbackCategoryImage(string $name): string
    {
        $images = [
            'Jeans' => 'photo-1542272604-787c3835535d',
            'Shirt' => 'photo-1596755094514-f87e34085b2c',
            'T-Shirt' => 'photo-1521572163474-6864f9cf17ab',
            'Kurta' => 'photo-1602216056096-3b40cc0c9944',
            'Blazer' => 'photo-1507679799987-c73779587ccf',
            'Saree' => 'photo-1610030469983-98e550d6193c',
            'Top' => 'photo-1487412720507-e7ab37603c6f',
            'Kurti' => 'photo-1583391733956-6c78276477e2',
            'Lehenga' => 'photo-1597983073493-88cd35cf93b0',
            'Sofa' => 'photo-1555041469-a586c61ea9bc',
            'Bed' => 'photo-1505693416388-ac5ce068fe85',
            'Dressing Table' => 'photo-1616486338812-3dadae4b4ace',
            'Alena' => 'photo-1558997519-83ea9252edf8',
            'Shoe Rack' => 'photo-1558618666-fcd25c85cd64',
            'Almirah' => 'photo-1616486338812-3dadae4b4ace',
            'Kitchen Stand' => 'photo-1556911220-bff31c812dba',
            'Vegetable Stand' => 'photo-1556909114-f6e7ad7d3136',
        ];

        return 'https://images.unsplash.com/'.($images[$name] ?? 'photo-1618221195710-dd6b41faaea6').'?auto=format&fit=crop&w=700&q=85';
    }
}
