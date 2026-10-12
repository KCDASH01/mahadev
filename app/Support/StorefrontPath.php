<?php

namespace App\Support;

final class StorefrontPath
{
    /**
     * @var array<string, string>
     */
    public const COLLECTION_PATHS = [
        'gents' => '/collection/gents',
        'ladies' => '/collection/ladies',
        'furniture' => '/collection/furniture',
    ];

    public static function collection(string $slug): string
    {
        return self::COLLECTION_PATHS[$slug] ?? '/collection/'.$slug;
    }

    public static function categorySlug(string $category): string
    {
        $normalized = trim(preg_replace('/\s+/', ' ', $category) ?? $category);

        return str_replace(' ', '-', $normalized);
    }

    /**
     * @param  array<int, string>  $names
     */
    public static function resolveCategoryName(string $urlCategory, array $names = []): string
    {
        $slug = self::categorySlug($urlCategory);

        foreach ($names as $name) {
            if (self::categorySlug($name) === $slug) {
                return $name;
            }
        }

        if (str_contains($urlCategory, ' ')) {
            return trim($urlCategory);
        }

        return str_replace('-', ' ', $slug);
    }

    public static function collectionCategory(string $slug, string $category): string
    {
        $encoded = rawurlencode(self::categorySlug($category));

        if (in_array($slug, ['trending', 'new-arrivals'], true)) {
            return '/'.$slug.'/category/'.$encoded;
        }

        return self::collection($slug).'/category/'.$encoded;
    }

    public static function product(string $slug): string
    {
        return '/product/'.$slug;
    }

    public static function productReviews(string $slug): string
    {
        return '/product/'.$slug.'/reviews';
    }

    public static function displayName(string $slug): string
    {
        return match ($slug) {
            'gents' => 'Gents',
            'ladies' => 'Ladies',
            'furniture' => 'Furniture',
            'new-arrivals' => 'New Arrivals',
            default => ucfirst(str_replace('-', ' ', $slug)),
        };
    }

    public static function internalSlug(string $urlSlug): string
    {
        return $urlSlug;
    }

    public static function legacyRedirect(string $slug, mixed $category): string
    {
        $value = is_string($category) ? trim($category) : '';

        return $value !== ''
            ? self::collectionCategory($slug, $value)
            : self::collection($slug);
    }
}
