<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Models\AttributeValue;
use App\Models\ProductVariant;
use Illuminate\Support\Collection;
use Illuminate\Validation\Validator;

trait ValidatesProductVariants
{
    protected function validateProductVariants(Validator $validator): void
    {
        $attributeValues = AttributeValue::query()
            ->with('attribute:id,slug')
            ->whereHas('attribute', fn ($query) => $query->whereIn('slug', ['size', 'color']))
            ->get(['id', 'attribute_id', 'value'])
            ->keyBy('id');

        $colorValueIds = $attributeValues
            ->filter(fn (AttributeValue $value) => $value->attribute?->slug === 'color')
            ->keys()
            ->map(fn ($id) => (int) $id)
            ->all();

        $submittedCombinations = [];
        $product = $this->route('product');
        $productId = $product?->id;

        // --- Batch-collect variant IDs and SKUs for bulk DB checks ---
        $variantIdsToCheck = [];   // index => variant_id
        $variantSkusToCheck = [];  // index => ['sku' => ..., 'id' => ...]

        foreach ($this->input('variants', []) as $index => $variant) {
            if (! is_array($variant) || ! $this->variantHasPayload($variant)) {
                continue;
            }

            if ($productId && ! empty($variant['id'])) {
                $variantIdsToCheck[$index] = (int) $variant['id'];
            }

            if (filled($variant['sku'] ?? null)) {
                $variantSkusToCheck[$index] = [
                    'sku' => $variant['sku'],
                    'id' => ! empty($variant['id']) ? (int) $variant['id'] : null,
                ];
            }
        }

        // Single query: check which variant IDs belong to this product
        $validVariantIds = [];
        if ($productId && $variantIdsToCheck !== []) {
            $validVariantIds = ProductVariant::query()
                ->where('product_id', $productId)
                ->whereIn('id', array_values($variantIdsToCheck))
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();
        }

        // Single query: find all existing SKUs that conflict
        $allSkusToLookup = array_column($variantSkusToCheck, 'sku');
        $takenSkuMap = [];
        if ($allSkusToLookup !== []) {
            $takenSkuMap = ProductVariant::query()
                ->whereIn('sku', $allSkusToLookup)
                ->pluck('id', 'sku')
                ->all();
        }

        foreach ($this->input('gallery', []) as $index => $image) {
            if (! is_array($image) || blank($image['color_value_id'] ?? null)) {
                continue;
            }

            if (! in_array((int) $image['color_value_id'], $colorValueIds, true)) {
                $validator->errors()->add(
                    "gallery.{$index}.color_value_id",
                    __('The image color must be a valid Color attribute value.'),
                );
            }
        }

        foreach ($this->input('variants', []) as $index => $variant) {
            if (! is_array($variant) || ! $this->variantHasPayload($variant)) {
                continue;
            }

            $optionValueIds = collect($variant['option_value_ids'] ?? [])
                ->filter(fn ($id) => filled($id))
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values();

            if (blank($variant['sku'] ?? null)) {
                $validator->errors()->add(
                    "variants.{$index}.sku",
                    __('The SKU field is required for each variant.'),
                );
            }

            if (blank($variant['original_price'] ?? null)) {
                $validator->errors()->add(
                    "variants.{$index}.original_price",
                    __('The original price field is required for each variant.'),
                );
            }

            if (blank($variant['sale_price'] ?? null)) {
                $validator->errors()->add(
                    "variants.{$index}.sale_price",
                    __('The sale price field is required for each variant.'),
                );
            }

            $sizeIds = $this->axisIds($optionValueIds, $attributeValues, 'size');
            $colorIds = $this->axisIds($optionValueIds, $attributeValues, 'color');

            if ($optionValueIds->count() !== 2 || $sizeIds->count() !== 1 || $colorIds->count() !== 1) {
                $validator->errors()->add(
                    "variants.{$index}.option_value_ids",
                    __('Each variant must contain exactly one Size and one Color.'),
                );
            }

            if ($sizeIds->count() === 1 && $colorIds->count() === 1) {
                $combinationKey = $sizeIds->first().':'.$colorIds->first();

                if (isset($submittedCombinations[$combinationKey])) {
                    $validator->errors()->add(
                        "variants.{$index}.option_value_ids",
                        __('This size and color combination has already been added.'),
                    );
                }

                $submittedCombinations[$combinationKey] = true;
            }

            if (
                isset($variant['original_price'], $variant['sale_price'])
                && is_numeric($variant['original_price'])
                && is_numeric($variant['sale_price'])
                && (float) $variant['sale_price'] > (float) $variant['original_price']
            ) {
                $validator->errors()->add(
                    "variants.{$index}.sale_price",
                    __('The sale price may not be greater than the original price.'),
                );
            }

            foreach ($variant['images'] ?? [] as $imageIndex => $image) {
                if (! is_array($image) || blank($image['color_value_id'] ?? null)) {
                    continue;
                }

                if (! in_array((int) $image['color_value_id'], $colorValueIds, true)) {
                    $validator->errors()->add(
                        "variants.{$index}.images.{$imageIndex}.color_value_id",
                        __('The image color must be a valid Color attribute value.'),
                    );
                }
            }

            // Batch ownership check (uses pre-loaded $validVariantIds)
            if (isset($variantIdsToCheck[$index])) {
                if (! in_array($variantIdsToCheck[$index], $validVariantIds, true)) {
                    $validator->errors()->add(
                        "variants.{$index}.id",
                        __('The selected variant does not belong to this product.'),
                    );
                }
            }

            // Batch SKU uniqueness check (uses pre-loaded $takenSkuMap)
            if (isset($variantSkusToCheck[$index])) {
                $skuInfo = $variantSkusToCheck[$index];
                $conflictId = $takenSkuMap[$skuInfo['sku']] ?? null;

                if ($conflictId !== null && $conflictId !== $skuInfo['id']) {
                    $validator->errors()->add(
                        "variants.{$index}.sku",
                        __('The SKU has already been taken.'),
                    );
                }
            }
        }
    }

    /**
     * @param  array<string, mixed>  $variant
     */
    private function variantHasPayload(array $variant): bool
    {
        return filled($variant['sku'] ?? null)
            || filled($variant['original_price'] ?? null)
            || filled($variant['sale_price'] ?? null)
            || collect($variant['option_value_ids'] ?? [])->contains(fn ($id) => filled($id));
    }

    /**
     * @param  Collection<int, int>  $optionValueIds
     * @param  Collection<int, AttributeValue>  $attributeValues
     * @return Collection<int, int>
     */
    private function axisIds(Collection $optionValueIds, Collection $attributeValues, string $slug): Collection
    {
        return $optionValueIds
            ->filter(fn (int $id) => $attributeValues->get($id)?->attribute?->slug === $slug)
            ->values();
    }
}
