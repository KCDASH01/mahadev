<?php

namespace App\Support;

final class CategorySeo
{
    /**
     * @return array{title: string, description: string}|null
     */
    public static function for(string $collectionSlug, string $category): ?array
    {
        if ($category === '' || $category === 'All') {
            return null;
        }

        $collection = StorefrontPath::displayName($collectionSlug);
        $categoryName = ucwords(str_replace('-', ' ', StorefrontPath::categorySlug($category)));

        return [
            'title' => "Shop {$categoryName} Online | {$collection} | Mahadev",
            'description' => "Explore {$categoryName} in the {$collection} collection at Mahadev Multipurpose Co-operative Society Ltd. Quality products, fair value and secure ordering.",
        ];
    }
}
