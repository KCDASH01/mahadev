<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\Category;
use App\Services\StorefrontNavigationService;
use Illuminate\Database\Seeder;

class FashionCategorySeeder extends Seeder
{
    public function run(): void
    {
        $tree = [
            ['name' => 'Gents', 'slug' => 'gents', 'children' => ['Jeans', 'Shirt', 'T-Shirt', 'Kurta', 'Blazer']],
            ['name' => 'Ladies', 'slug' => 'ladies', 'children' => ['Saree', 'Top', 'Jeans', 'Kurti', 'Lehenga']],
            ['name' => 'Furniture', 'slug' => 'furniture', 'children' => [
                'Sofa', 'Bed', 'Dressing Table', 'Alena', 'Shoe Rack', 'Almirah',
                'Kitchen Stand', 'Vegetable Stand',
            ]],
        ];

        foreach ($tree as $parentOrder => $parentData) {
            $parent = Category::updateOrCreate(
                ['slug' => $parentData['slug']],
                [
                    'parent_id' => null,
                    'name' => $parentData['name'],
                    'gender' => $parentData['slug'],
                    'sort_order' => $parentOrder,
                    'status' => 'active',
                    'is_featured' => false,
                ],
            );

            foreach ($parentData['children'] as $sortOrder => $name) {
                $category = Category::updateOrCreate(
                    ['slug' => $parentData['slug'].'-'.str($name)->slug()],
                    [
                        'parent_id' => $parent->id,
                        'name' => $name,
                        'gender' => $parentData['slug'],
                        'nav_group' => $parentData['slug'] === 'furniture' ? 'Furniture' : $parentData['name'],
                        'sort_order' => $sortOrder,
                        'status' => 'active',
                        'is_featured' => true,
                    ],
                );

                $this->attachAttributes($category, $parentData['slug'] !== 'furniture');
            }
        }

        Category::query()
            ->whereNull('parent_id')
            ->whereNotIn('slug', ['gents', 'ladies', 'furniture'])
            ->update(['status' => 'inactive']);

        StorefrontNavigationService::flushCache();
    }

    private function attachAttributes(Category $category, bool $isGarment): void
    {
        $slugs = $isGarment
            ? ['color', 'size', 'fit', 'material', 'pattern', 'sleeve', 'neck']
            : ['color', 'material'];

        foreach ($slugs as $sortOrder => $slug) {
            $attribute = Attribute::query()->where('slug', $slug)->first();

            if (! $attribute) {
                continue;
            }

            $category->attributes()->syncWithoutDetaching([
                $attribute->id => [
                    'is_filterable' => true,
                    'is_variant_axis' => in_array($slug, ['color', 'size'], true),
                    'is_required' => $slug === 'color' || ($isGarment && $slug === 'size'),
                    'sort_order' => $sortOrder,
                ],
            ]);
        }
    }
}
