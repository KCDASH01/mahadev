<?php

namespace App\Services;

use App\Models\Product;
use App\Models\SavedForLaterItem;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SavedForLaterService
{
    /**
     * @param  array{key: string, product_id: int, variant_id: int|null, quantity: int}  $cartItem
     */
    public function saveFromCartItem(User $user, array $cartItem): SavedForLaterItem
    {
        $existing = SavedForLaterItem::query()
            ->where('user_id', $user->id)
            ->where('product_id', $cartItem['product_id'])
            ->where('product_variant_id', $cartItem['variant_id'])
            ->first();

        if ($existing) {
            $existing->update([
                'quantity' => min(99, $existing->quantity + $cartItem['quantity']),
            ]);

            return $existing;
        }

        return SavedForLaterItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $cartItem['product_id'],
            'product_variant_id' => $cartItem['variant_id'],
            'quantity' => min(99, max(1, $cartItem['quantity'])),
        ]);
    }

    public function remove(User $user, SavedForLaterItem $item): void
    {
        if ($item->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'saved_item' => __('This saved item could not be found.'),
            ]);
        }

        $item->delete();
    }

    public function moveToCart(Request $request, CartService $cart, User $user, SavedForLaterItem $item): void
    {
        if ($item->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'saved_item' => __('This saved item could not be found.'),
            ]);
        }

        $product = Product::query()
            ->where('status', 'active')
            ->with(['variants' => fn ($query) => $query->where('status', 'active')->with('optionValues.attribute')])
            ->find($item->product_id);

        if (! $product) {
            throw ValidationException::withMessages([
                'saved_item' => __('This product is no longer available.'),
            ]);
        }

        $color = null;
        $size = null;

        if ($item->product_variant_id) {
            $variant = $product->variants->firstWhere('id', $item->product_variant_id);

            if (! $variant) {
                throw ValidationException::withMessages([
                    'saved_item' => __('The selected variant is no longer available.'),
                ]);
            }

            $color = $variant->optionValues->first(fn ($value) => $value->attribute?->slug === 'color')?->value;
            $size = $variant->optionValues->first(fn ($value) => $value->attribute?->slug === 'size')?->value;
        }

        $cart->add(
            $request,
            $item->product_id,
            $item->product_variant_id,
            $color,
            $size,
            (int) $item->quantity,
        );

        $item->delete();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function formattedLineItems(User $user, StorefrontProductService $products): array
    {
        $savedItems = SavedForLaterItem::query()
            ->where('user_id', $user->id)
            ->orderByDesc('updated_at')
            ->get();

        if ($savedItems->isEmpty()) {
            return [];
        }

        $productIds = $savedItems->pluck('product_id')->unique()->values()->all();

        $loadedProducts = Product::query()
            ->whereIn('id', $productIds)
            ->where('status', 'active')
            ->with([
                'category:id,name,slug,parent_id,gender',
                'images' => fn ($query) => $query->orderBy('sort_order'),
                'variants' => fn ($query) => $query
                    ->where('status', 'active')
                    ->with(['optionValues.attribute']),
                'attributeValues.attribute',
            ])
            ->get()
            ->keyBy('id');

        return $savedItems
            ->map(function (SavedForLaterItem $saved) use ($loadedProducts, $products): ?array {
                /** @var Product|null $product */
                $product = $loadedProducts->get($saved->product_id);

                if (! $product) {
                    return null;
                }

                $variant = $saved->product_variant_id
                    ? $product->variants->firstWhere('id', $saved->product_variant_id)
                    : null;

                $formatted = $products->toFashionProduct($product);

                if ($variant) {
                    $formatted['price'] = (float) $variant->sale_price;
                    $formatted['originalPrice'] = (float) $variant->original_price;
                }

                $color = $variant
                    ? $variant->optionValues->first(fn ($value) => $value->attribute?->slug === 'color')?->value
                    : null;
                $size = $variant
                    ? $variant->optionValues->first(fn ($value) => $value->attribute?->slug === 'size')?->value
                    : null;

                $key = $saved->product_variant_id
                    ? "{$saved->product_id}:{$saved->product_variant_id}"
                    : (string) $saved->product_id;

                return [
                    'savedItemId' => $saved->id,
                    'key' => $key,
                    'product' => $formatted,
                    'size' => $size,
                    'color' => $color,
                    'quantity' => (int) $saved->quantity,
                    'stock' => (int) ($variant?->stock ?? $product->stock),
                    'variantId' => $saved->product_variant_id,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @return Collection<int, SavedForLaterItem>
     */
    public function itemsForUser(User $user): Collection
    {
        return SavedForLaterItem::query()
            ->where('user_id', $user->id)
            ->orderByDesc('updated_at')
            ->get();
    }
}
