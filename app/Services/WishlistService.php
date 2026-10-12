<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Support\Collection;

class WishlistService
{
    /**
     * @return array<int, int>
     */
    public function productIds(?User $user): array
    {
        if (! $user) {
            return [];
        }

        return Wishlist::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->pluck('product_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    public function toggle(User $user, int $productId): bool
    {
        $existing = Wishlist::query()
            ->where('user_id', $user->id)
            ->where('product_id', $productId)
            ->whereNull('product_variant_id')
            ->first();

        if ($existing) {
            $existing->delete();

            return false;
        }

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $productId,
            'product_variant_id' => null,
        ]);

        return true;
    }

    public function add(User $user, int $productId, ?int $variantId = null): void
    {
        Wishlist::query()->firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $productId,
            'product_variant_id' => $variantId,
        ]);
    }

    /**
     * @return Collection<int, Product>
     */
    public function products(User $user): Collection
    {
        $wishlists = Wishlist::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get(['product_id', 'product_variant_id']);

        if ($wishlists->isEmpty()) {
            return collect();
        }

        $loadedProducts = Product::query()
            ->whereIn('id', $wishlists->pluck('product_id')->unique())
            ->where('status', 'active')
            ->with([
                'category:id,name,slug,parent_id,gender',
                'category.parent:id,gender,slug',
                'images' => fn ($query) => $query->orderBy('sort_order'),
                'variants' => fn ($query) => $query
                    ->where('status', 'active')
                    ->with(['optionValues.attribute']),
                'attributeValues.attribute',
            ])
            ->get()
            ->keyBy('id');

        return $wishlists
            ->map(function (Wishlist $wishlist) use ($loadedProducts): ?Product {
                $product = $loadedProducts->get($wishlist->product_id);

                if (! $product) {
                    return null;
                }

                return $product;
            })
            ->filter()
            ->values();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function formattedProducts(User $user, StorefrontProductService $products): array
    {
        $wishlists = Wishlist::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        if ($wishlists->isEmpty()) {
            return [];
        }

        $loadedProducts = Product::query()
            ->whereIn('id', $wishlists->pluck('product_id')->unique())
            ->where('status', 'active')
            ->with([
                'category:id,name,slug,parent_id,gender',
                'category.parent:id,gender,slug',
                'images' => fn ($query) => $query->orderBy('sort_order'),
                'variants' => fn ($query) => $query
                    ->where('status', 'active')
                    ->with(['optionValues.attribute']),
                'attributeValues.attribute',
            ])
            ->get()
            ->keyBy('id');

        return $wishlists
            ->map(function (Wishlist $wishlist) use ($loadedProducts, $products): ?array {
                /** @var Product|null $product */
                $product = $loadedProducts->get($wishlist->product_id);

                if (! $product) {
                    return null;
                }

                $variant = $wishlist->product_variant_id
                    ? $product->variants->firstWhere('id', $wishlist->product_variant_id)
                    : null;

                $formatted = $products->toFashionProduct($product);

                if ($variant) {
                    $formatted['price'] = (float) $variant->sale_price;
                    $formatted['originalPrice'] = (float) $variant->original_price;

                    $color = $variant->optionValues->first(fn ($value) => $value->attribute?->slug === 'color')?->value;
                    $size = $variant->optionValues->first(fn ($value) => $value->attribute?->slug === 'size')?->value;

                    if ($color) {
                        $formatted['color'] = $color;
                    }

                    if ($size) {
                        $formatted['sizes'] = [$size];
                    }
                }

                return $formatted;
            })
            ->filter()
            ->values()
            ->all();
    }
}
