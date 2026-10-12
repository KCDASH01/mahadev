<?php

namespace App\Services;

use App\Models\Category;
use App\Support\StorefrontPath;
use Illuminate\Support\Collection;

class ExploreCollectionService
{
    /**
     * @var array<int, string>
     */
    public const SLUGS = ['gents', 'ladies', 'furniture'];

    /**
     * Fixed explore circle images — always preferred over category DB image.
     *
     * @var array<string, string>
     */
    private const EXPLORE_IMAGES = [
        'gents' => 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85',
        'ladies' => 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85',
        'furniture' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
    ];

    /**
     * @var array<string, string>
     */
    private const FALLBACK_IMAGES = [
        'gents' => 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85',
        'ladies' => 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85',
        'furniture' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
    ];

    /**
     * Keep faces near the top of the circle so ~3/4 body shows without cropping heads.
     *
     * @var array<string, string>
     */
    private const IMAGE_POSITIONS = [
        'gents' => 'center 15%',
        'ladies' => 'center 12%',
        'furniture' => 'center center',
    ];

    public function imageForSlug(string $slug, ?Category $category = null): string
    {
        return self::EXPLORE_IMAGES[$slug]
            ?? ($category?->image ?: (self::FALLBACK_IMAGES[$slug] ?? ''));
    }

    public function imagePositionForSlug(string $slug): string
    {
        return self::IMAGE_POSITIONS[$slug] ?? 'center center';
    }

    /**
     * @return array<int, array{title: string, image: string, href: string, imagePosition: string}>
     */
    public function collections(): array
    {
        $categories = $this->parentCategories();

        return collect(self::SLUGS)
            ->map(function (string $slug) use ($categories): array {
                $category = $categories->get($slug);

                return [
                    'title' => StorefrontPath::displayName($slug),
                    'image' => $this->imageForSlug($slug, $category),
                    'href' => StorefrontPath::collection($slug),
                    'imagePosition' => $this->imagePositionForSlug($slug),
                ];
            })
            ->all();
    }

    /**
     * @return Collection<string, Category>
     */
    private function parentCategories(): Collection
    {
        return Category::query()
            ->whereNull('parent_id')
            ->whereIn('slug', self::SLUGS)
            ->where('status', 'active')
            ->get(['id', 'name', 'slug', 'image'])
            ->keyBy('slug');
    }
}
