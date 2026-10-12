<?php

namespace App\Concerns;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;

trait SyncsProductRelations
{
    use HandlesMediaUpload;

    /**
     * @param  array<int, array<string, mixed>>  $gallery
     */
    protected function syncGalleryImages(Product $product, array $gallery, FormRequest $request): void
    {
        $keepIds = [];

        foreach ($gallery as $index => $item) {
            if (empty($item['id']) && empty($item['image']) && ! $request->hasFile("gallery.{$index}.file")) {
                continue;
            }

            $existingImage = ! empty($item['id'])
                ? ProductImage::query()
                    ->where('product_id', $product->id)
                    ->find($item['id'])
                : null;

            $imagePath = $this->resolveMediaField(
                $request->file("gallery.{$index}.file"),
                $item['image'] ?? null,
                $existingImage?->image,
                'products/gallery',
            );

            if (! $imagePath) {
                continue;
            }

            $sortOrder = (int) ($item['sort_order'] ?? $index);
            $colorValueId = filled($item['color_value_id'] ?? null)
                ? (int) $item['color_value_id']
                : null;

            if ($existingImage) {
                $existingImage->update([
                    'image' => $imagePath,
                    'sort_order' => $sortOrder,
                    'color_value_id' => $colorValueId,
                ]);
                $keepIds[] = $existingImage->id;
            } else {
                $created = $product->images()->create([
                    'image' => $imagePath,
                    'sort_order' => $sortOrder,
                    'color_value_id' => $colorValueId,
                ]);
                $keepIds[] = $created->id;
            }
        }

        $product->images()
            ->whereNull('color_value_id')
            ->whereNotIn('id', $keepIds)
            ->get()
            ->each(function (ProductImage $image): void {
                $this->deleteStoredMedia($image->image);
                $image->delete();
            });
    }

    /**
     * Cache for color attribute value IDs to avoid repeated queries.
     *
     * @var Set<int>|null
     */
    private ?array $colorValueIdCache = null;

    /**
     * @param  array<int, array<string, mixed>>  $variants
     */
    protected function syncVariantColorImages(Product $product, array $variants, FormRequest $request): void
    {
        $keepIds = [];
        $imagesByColor = [];

        foreach ($variants as $index => $variantData) {
            $shouldSyncImages = array_key_exists('images', $variantData)
                || filled($variantData['sync_images'] ?? null);

            if (! $shouldSyncImages) {
                continue;
            }

            $colorValueId = $this->resolveVariantColorValueId($variantData);

            if (! $colorValueId) {
                continue;
            }

            if (! empty($variantData['images']) || ! isset($imagesByColor[$colorValueId])) {
                $imagesByColor[$colorValueId] = [
                    'variantIndex' => $index,
                    'images' => $variantData['images'] ?? [],
                ];
            }
        }

        // Batch-load all existing product images that have a color_value_id
        $existingImages = ProductImage::query()
            ->where('product_id', $product->id)
            ->whereNotNull('color_value_id')
            ->get()
            ->keyBy('id');

        foreach ($imagesByColor as $colorValueId => $payload) {
            $variantIndex = $payload['variantIndex'];

            foreach ($payload['images'] as $imageIndex => $item) {
                if (empty($item['id']) && empty($item['image']) && ! $request->hasFile("variants.{$variantIndex}.images.{$imageIndex}.file")) {
                    continue;
                }

                $existingImage = ! empty($item['id'])
                    ? $existingImages->get($item['id'])
                    : null;

                // Verify the existing image belongs to this product
                if ($existingImage && $existingImage->product_id !== $product->id) {
                    $existingImage = null;
                }

                $imagePath = $this->resolveMediaField(
                    $request->file("variants.{$variantIndex}.images.{$imageIndex}.file"),
                    $item['image'] ?? null,
                    $existingImage?->image,
                    'products/gallery',
                );

                if (! $imagePath) {
                    continue;
                }

                $sortOrder = (int) ($item['sort_order'] ?? $imageIndex);

                if ($existingImage) {
                    $existingImage->update([
                        'image' => $imagePath,
                        'sort_order' => $sortOrder,
                        'color_value_id' => $colorValueId,
                    ]);
                    $keepIds[] = $existingImage->id;
                } else {
                    $created = $product->images()->create([
                        'image' => $imagePath,
                        'sort_order' => $sortOrder,
                        'color_value_id' => $colorValueId,
                    ]);
                    $keepIds[] = $created->id;
                }
            }
        }

        $syncedColorIds = array_keys($imagesByColor);

        $product->images()
            ->whereNotNull('color_value_id')
            ->when($syncedColorIds !== [], fn ($query) => $query->whereIn('color_value_id', $syncedColorIds))
            ->when($keepIds !== [], fn ($query) => $query->whereNotIn('id', $keepIds))
            ->get()
            ->each(function (ProductImage $image): void {
                $this->deleteStoredMedia($image->image);
                $image->delete();
            });
    }

    /**
     * @param  array<string, mixed>  $variantData
     */
    protected function resolveVariantColorValueId(array $variantData): ?int
    {
        foreach ($variantData['option_value_ids'] ?? [] as $valueId) {
            if (! filled($valueId)) {
                continue;
            }

            $id = (int) $valueId;

            if ($this->isColorValueId($id)) {
                return $id;
            }
        }

        foreach ($variantData['images'] ?? [] as $item) {
            if (filled($item['color_value_id'] ?? null)) {
                return (int) $item['color_value_id'];
            }
        }

        return null;
    }

    protected function isColorValueId(int $valueId): bool
    {
        if ($this->colorValueIdCache === null) {
            $this->colorValueIdCache = \App\Models\AttributeValue::query()
                ->whereHas('attribute', fn ($query) => $query->where('slug', 'color'))
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();
        }

        return in_array($valueId, $this->colorValueIdCache, true);
    }

    /**
     * @param  array<int, array<string, mixed>>  $variants
     */
    protected function syncVariants(Product $product, array $variants, ?FormRequest $request = null): void
    {
        $keepIds = [];

        // Pre-load ALL attribute values for submitted option_value_ids in ONE query
        $allOptionValueIds = [];
        foreach ($variants as $variantData) {
            foreach ($variantData['option_value_ids'] ?? [] as $id) {
                if (filled($id)) {
                    $allOptionValueIds[] = (int) $id;
                }
            }
        }
        $allOptionValueIds = array_unique($allOptionValueIds);

        $preloadedValues = $allOptionValueIds !== []
            ? \App\Models\AttributeValue::query()
                ->with('attribute:id,slug')
                ->whereIn('id', $allOptionValueIds)
                ->get(['id', 'attribute_id'])
            : collect();

        foreach ($variants as $variantData) {
            $optionValueIds = array_values(array_filter(
                $variantData['option_value_ids'] ?? [],
                fn ($id) => filled($id),
            ));

            if (blank($variantData['sku'] ?? null) && $optionValueIds === []) {
                continue;
            }

            $axisValueIds = $this->resolveVariantAxisValueIds($optionValueIds, $preloadedValues);

            $payload = [
                'size_value_id' => $axisValueIds['size_value_id'],
                'color_value_id' => $axisValueIds['color_value_id'],
                'original_price' => $variantData['original_price'],
                'sale_price' => $variantData['sale_price'],
                'stock' => $variantData['stock'] ?? 0,
                'sku' => $variantData['sku'],
                'status' => $variantData['status'] ?? 'active',
            ];

            if (! empty($variantData['id'])) {
                $variant = ProductVariant::query()
                    ->where('product_id', $product->id)
                    ->find($variantData['id']);

                if ($variant) {
                    $variant->update($payload);
                    $variant->optionValues()->sync($optionValueIds);
                    $keepIds[] = $variant->id;

                    continue;
                }
            }

            $existingByCombination = ProductVariant::query()
                ->where('product_id', $product->id)
                ->where('size_value_id', $axisValueIds['size_value_id'])
                ->where('color_value_id', $axisValueIds['color_value_id'])
                ->first();

            if ($existingByCombination) {
                $existingByCombination->update($payload);
                $existingByCombination->optionValues()->sync($optionValueIds);
                $keepIds[] = $existingByCombination->id;

                continue;
            }

            $created = $product->variants()->create($payload);
            $created->optionValues()->sync($optionValueIds);
            $keepIds[] = $created->id;
        }

        $removedVariants = $product->variants()
            ->when($keepIds !== [], fn ($query) => $query->whereNotIn('id', $keepIds))
            ->when($keepIds === [], fn ($query) => $query)
            ->get();

        foreach ($removedVariants as $variant) {
            if ($variant->cartItems()->exists() || $variant->orderItems()->exists()) {
                $variant->update(['status' => 'inactive']);

                continue;
            }

            $variant->delete();
        }

        if ($request) {
            $this->syncVariantColorImages($product, $variants, $request);
        }
    }

    /**
     * @param  array<int, mixed>  $optionValueIds
     * @param  \Illuminate\Support\Collection|null  $preloadedValues  Pre-loaded attribute values to avoid extra queries
     * @return array{size_value_id: int|null, color_value_id: int|null}
     */
    protected function resolveVariantAxisValueIds(array $optionValueIds, $preloadedValues = null): array
    {
        $values = $preloadedValues !== null
            ? $preloadedValues->whereIn('id', $optionValueIds)
            : \App\Models\AttributeValue::query()
                ->with('attribute:id,slug')
                ->whereIn('id', $optionValueIds)
                ->get(['id', 'attribute_id']);

        return [
            'size_value_id' => $values->first(fn ($value) => $value->attribute?->slug === 'size')?->id,
            'color_value_id' => $values->first(fn ($value) => $value->attribute?->slug === 'color')?->id,
        ];
    }

    /**
     * @param  array<int, mixed>  $valueIds
     */
    protected function syncFilterAttributeValues(Product $product, array $valueIds): void
    {
        $filterValueIds = collect($valueIds)
            ->filter(fn ($id) => filled($id))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        $product->attributeValues()->sync($filterValueIds);
    }

    protected function uniqueProductSlug(string $slug, ?int $ignoreId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (Product::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    protected function uniqueProductSku(string $sku, ?int $ignoreId = null): string
    {
        $originalSku = $sku;
        $counter = 1;

        while (Product::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('sku', $sku)
            ->exists()) {
            $sku = $originalSku.'-'.$counter;
            $counter++;
        }

        return $sku;
    }
}
