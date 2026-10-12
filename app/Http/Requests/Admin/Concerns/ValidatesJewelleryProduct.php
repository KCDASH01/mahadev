<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Models\Category;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

trait ValidatesJewelleryProduct
{
    /**
     * @return array<string, mixed>
     */
    protected function jewelleryRules(?int $ignoreProductId = null): array
    {
        $uniqueSlug = Rule::unique('products', 'slug');
        $uniqueSku = Rule::unique('products', 'sku');

        if ($ignoreProductId) {
            $uniqueSlug = $uniqueSlug->ignore($ignoreProductId);
            $uniqueSku = $uniqueSku->ignore($ignoreProductId);
        }

        return [
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where(function ($query): void {
                    $query->whereIn('id', Category::query()->jewelleryLeaves()->select('id'));
                }),
            ],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', $uniqueSlug],
            'sku' => ['required', 'string', 'max:255', $uniqueSku],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'care_instructions' => ['nullable', 'string'],
            'original_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0', 'lte:original_price'],
            'display_rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'display_review_count' => ['nullable', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'thumbnail' => ['nullable', 'string', 'max:8192'],
            'thumbnail_file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:8192'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'offers' => ['nullable', 'array'],
            'offers.*.title' => ['required', 'string', 'max:255'],
            'offers.*.detail' => ['nullable', 'string', 'max:500'],
            'offers.*.code' => ['nullable', 'string', 'max:50'],
            'gallery' => ['nullable', 'array'],
            'gallery.*.id' => ['nullable', 'integer'],
            'gallery.*.image' => ['nullable', 'string', 'max:8192'],
            'gallery.*.file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:8192'],
            'gallery.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'details' => ['nullable', 'array'],
            'details.material' => ['nullable', 'string', 'max:100'],
            'details.metal' => ['nullable', 'string', 'max:100'],
            'details.finish' => ['nullable', 'string', 'max:100'],
            'details.color' => ['nullable', 'string', 'max:100'],
            'details.stone' => ['nullable', 'string', 'max:100'],
            'details.occasion' => ['nullable', 'string', 'max:100'],
            'details.care' => ['nullable', 'string', 'max:500'],
            'details.weight' => ['nullable', 'string', 'max:50'],
        ];
    }

    protected function isJewelleryRequest(): bool
    {
        $name = $this->route()?->getName() ?? '';

        return str_contains($name, 'jewellery');
    }

    /**
     * @return array<string, string>
     */
    protected function jewelleryMessages(): array
    {
        return [
            'sale_price.lte' => __('Sale price cannot be greater than the original price.'),
            'stock.min' => __('Stock cannot be negative.'),
            'category_id.exists' => __('Select a jewellery category.'),
        ];
    }

    protected function validateJewelleryCategory(Validator $validator): void
    {
        if (! $this->isJewelleryRequest()) {
            return;
        }

        $categoryId = $this->integer('category_id');

        if ($categoryId < 1) {
            return;
        }

        $isJewelleryCategory = Category::query()
            ->jewelleryLeaves()
            ->whereKey($categoryId)
            ->exists();

        if (! $isJewelleryCategory) {
            $validator->errors()->add('category_id', __('Select a jewellery category.'));
        }
    }
}
