<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartService
{
    private const SESSION_KEY = 'storefront.cart';

    private const COUPON_SESSION_KEY = 'storefront.checkout.coupon';

    private const ADDRESS_SESSION_KEY = 'storefront.checkout.address_id';

    public function __construct(
        private CouponService $coupons,
        private CartTotalsService $totals,
        private SavedForLaterService $savedForLater,
        private WishlistService $wishlist,
        private ShippingService $shipping,
    ) {}

    /**
     * @return array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>
     */
    public function items(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            // Database is the source of truth for authenticated users.
            // Session is only refreshed from the database (never merged back on read).
            $items = $this->normalizeItems($this->loadDatabaseItems($user));
            $request->session()->put(self::SESSION_KEY, $items);

            return $items;
        }

        $stored = $request->session()->get(self::SESSION_KEY, []);
        $items = $this->normalizeItems($stored);

        if ($stored !== $items) {
            $request->session()->put(self::SESSION_KEY, $items);
        }

        return $items;
    }

    /**
     * Merge guest-session cart items into the user's database cart once after login/register.
     */
    public function mergeGuestSessionIntoUserCart(Request $request): void
    {
        $user = $request->user();

        if (! $user) {
            return;
        }

        $sessionItems = $this->normalizeItems($request->session()->get(self::SESSION_KEY, []));

        if ($sessionItems === []) {
            return;
        }

        $databaseItems = $this->normalizeItems($this->loadDatabaseItems($user));
        $merged = $this->mergeItemCollections($databaseItems, $sessionItems);

        $this->syncDatabaseCart($user, $merged);
        $request->session()->put(self::SESSION_KEY, $this->normalizeItems($this->loadDatabaseItems($user)));
    }

    /**
     * @return array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>
     */
    private function normalizeItems(mixed $stored): array
    {
        if (! is_array($stored)) {
            return [];
        }

        if (isset($stored['items']) && is_array($stored['items'])) {
            $stored = $stored['items'];
        }

        $normalized = [];

        foreach ($stored as $item) {
            if (! is_array($item)) {
                continue;
            }

            if (! isset($item['product_id'], $item['quantity'])) {
                continue;
            }

            $productId = (int) $item['product_id'];
            $variantId = isset($item['variant_id']) && $item['variant_id'] !== null
                ? (int) $item['variant_id']
                : null;
            $key = isset($item['key']) && is_string($item['key'])
                ? $item['key']
                : $this->makeKey($productId, $variantId);

            $normalized[] = [
                'key' => $key,
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => min(99, max(1, (int) $item['quantity'])),
            ];
        }

        return $normalized;
    }

    /**
     * @return array{count: int, keys: array<int, string>, items: array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>}
     */
    public function summary(Request $request): array
    {
        $items = $this->items($request);

        return [
            'count' => count($items),
            'keys' => array_values(array_column($items, 'key')),
            'items' => $items,
        ];
    }

    public function makeKey(int $productId, ?int $variantId): string
    {
        return $variantId ? "{$productId}:{$variantId}" : (string) $productId;
    }

    public function quantityForKey(Request $request, string $key): int
    {
        foreach ($this->items($request) as $item) {
            if ($item['key'] === $key) {
                return (int) $item['quantity'];
            }
        }

        return 0;
    }

    public function add(
        Request $request,
        int $productId,
        ?int $variantId,
        ?string $color,
        ?string $size,
        int $quantity = 1,
    ): string {
        $product = $this->loadProduct($productId);
        $variantId = $this->resolveVariantId($product, $variantId, $color, $size);
        $this->assertCanAdd($product, $variantId, $quantity);

        $key = $this->makeKey($productId, $variantId);
        $items = $this->items($request);
        $found = false;

        foreach ($items as &$item) {
            if ($item['key'] !== $key) {
                continue;
            }

            $item['quantity'] = min(99, $item['quantity'] + $quantity);
            $found = true;
            break;
        }

        unset($item);

        if (! $found) {
            $items[] = [
                'key' => $key,
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => min(99, max(1, $quantity)),
            ];
        }

        $this->putItems($request, $items);

        return $key;
    }

    public function updateQuantity(Request $request, string $key, int $quantity): void
    {
        if ($quantity <= 0) {
            $this->remove($request, $key);

            return;
        }

        $items = $this->items($request);
        $found = false;

        foreach ($items as &$item) {
            if ($item['key'] !== $key) {
                continue;
            }

            $product = $this->loadProduct((int) $item['product_id']);
            $this->assertStockAvailable($product, $item['variant_id'], $quantity);

            $item['quantity'] = min(99, $quantity);
            $found = true;
            break;
        }

        unset($item);

        if (! $found) {
            throw ValidationException::withMessages([
                'key' => __('This cart item could not be found.'),
            ]);
        }

        $this->putItems($request, $items);
    }

    public function remove(Request $request, string $key): void
    {
        $items = array_values(array_filter(
            $this->items($request),
            fn (array $item): bool => $item['key'] !== $key,
        ));

        $this->putItems($request, $items);
    }

    public function saveItemForLater(Request $request, string $key): void
    {
        $user = $request->user();

        if (! $user) {
            throw ValidationException::withMessages([
                'key' => __('Please log in to save items for later.'),
            ]);
        }

        $cartItem = $this->findItemByKey($request, $key);

        $this->savedForLater->saveFromCartItem($user, $cartItem);
        $this->remove($request, $key);
    }

    public function moveItemToWishlist(Request $request, string $key): void
    {
        $user = $request->user();

        if (! $user) {
            throw ValidationException::withMessages([
                'key' => __('Please log in to move items to your wishlist.'),
            ]);
        }

        $cartItem = $this->findItemByKey($request, $key);

        $this->wishlist->add($user, (int) $cartItem['product_id'], $cartItem['variant_id']);
        $this->remove($request, $key);
    }

    /**
     * @return array{key: string, product_id: int, variant_id: int|null, quantity: int}
     */
    private function findItemByKey(Request $request, string $key): array
    {
        foreach ($this->items($request) as $item) {
            if ($item['key'] === $key) {
                return $item;
            }
        }

        throw ValidationException::withMessages([
            'key' => __('This cart item could not be found.'),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function formattedLineItems(Request $request, StorefrontProductService $products): array
    {
        return $this->formattedLineItemsFromRaw($this->items($request), $products);
    }

    /**
     * @param  array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>  $sessionItems
     * @return array<int, array<string, mixed>>
     */
    public function formattedLineItemsFromRaw(array $sessionItems, StorefrontProductService $products): array
    {
        if ($sessionItems === []) {
            return [];
        }

        $productIds = array_values(array_unique(array_column($sessionItems, 'product_id')));

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

        return collect($sessionItems)
            ->map(function (array $item) use ($loadedProducts, $products): ?array {
                /** @var Product|null $product */
                $product = $loadedProducts->get($item['product_id']);

                if (! $product) {
                    return null;
                }

                $variant = $item['variant_id']
                    ? $product->variants->firstWhere('id', $item['variant_id'])
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

                return [
                    'key' => $item['key'],
                    'product' => $formatted,
                    'size' => $size,
                    'color' => $color,
                    'quantity' => (int) $item['quantity'],
                    'stock' => (int) ($variant?->stock ?? $product->stock),
                    'variantId' => $item['variant_id'],
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * Validate a single buy-now item without touching the cart.
     *
     * @return array{key: string, product_id: int, variant_id: int|null, quantity: int}
     */
    public function validateBuyNowItem(
        int $productId,
        ?int $variantId,
        ?string $color,
        ?string $size,
        int $quantity = 1,
    ): array {
        $product = $this->loadProduct($productId);
        $variantId = $this->resolveVariantId($product, $variantId, $color, $size);
        $this->assertCanAdd($product, $variantId, $quantity);
        $this->assertStockAvailable($product, $variantId, $quantity);

        return [
            'key' => $this->makeKey($productId, $variantId),
            'product_id' => $productId,
            'variant_id' => $variantId,
            'quantity' => min(99, max(1, $quantity)),
        ];
    }

    public function appliedCouponCode(Request $request): ?string
    {
        $code = $request->session()->get(self::COUPON_SESSION_KEY);

        return filled($code) ? (string) $code : null;
    }

    public function appliedCoupon(Request $request): ?Coupon
    {
        $code = $this->appliedCouponCode($request);

        if (! $code) {
            return null;
        }

        return Coupon::query()
            ->with(['categories', 'products'])
            ->whereRaw('UPPER(code) = ?', [strtoupper($code)])
            ->first();
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     */
    public function applyCoupon(Request $request, string $code, array $lineItems): Coupon
    {
        $result = $this->coupons->validateAndCalculate(
            $code,
            $lineItems,
            $request->user(),
        );

        $request->session()->put(self::COUPON_SESSION_KEY, $result['coupon']->code);

        return $result['coupon'];
    }

    public function removeCoupon(Request $request): void
    {
        $request->session()->forget(self::COUPON_SESSION_KEY);
    }

    public function selectedAddressId(Request $request): ?int
    {
        $addressId = $request->session()->get(self::ADDRESS_SESSION_KEY);

        return filled($addressId) ? (int) $addressId : null;
    }

    public function setSelectedAddress(Request $request, ?int $addressId): void
    {
        if (! $addressId) {
            $request->session()->forget(self::ADDRESS_SESSION_KEY);

            return;
        }

        if (! $request->user()) {
            throw ValidationException::withMessages([
                'address_id' => __('Please log in to select a delivery address.'),
            ]);
        }

        $ownsAddress = UserAddress::query()
            ->where('user_id', $request->user()->id)
            ->whereKey($addressId)
            ->exists();

        if (! $ownsAddress) {
            throw ValidationException::withMessages([
                'address_id' => __('The selected address is invalid.'),
            ]);
        }

        $request->session()->put(self::ADDRESS_SESSION_KEY, $addressId);
    }

    /**
     * @return array<string, mixed>
     */
    public function cartPagePayload(Request $request, StorefrontProductService $products): array
    {
        $lineItems = $this->formattedLineItems($request, $products);
        $coupon = $this->appliedCoupon($request);

        if ($coupon && $lineItems !== []) {
            try {
                $this->coupons->assertCouponIsUsable($coupon, $lineItems, $request->user());
            } catch (ValidationException) {
                $this->removeCoupon($request);
                $coupon = null;
            }
        }

        $totals = $this->totals->calculate($lineItems, $coupon);
        $addresses = $request->user()
            ? $request->user()->addresses()->orderByDesc('is_default')->latest()->get()
            : collect();

        $selectedAddressId = $this->selectedAddressId($request);

        if (! $selectedAddressId && $addresses->isNotEmpty()) {
            $selectedAddressId = $addresses->firstWhere('is_default', true)?->id
                ?? $addresses->first()?->id;
            if ($selectedAddressId) {
                $request->session()->put(self::ADDRESS_SESSION_KEY, $selectedAddressId);
            }
        }

        return [
            'cartItems' => $lineItems,
            'cartTotals' => $totals,
            'availableOffers' => $this->coupons->activeOffers()
                ->map(fn (Coupon $offer) => $this->coupons->formatOffer($offer))
                ->values()
                ->all(),
            'appliedCoupon' => $coupon ? [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'title' => $coupon->title ?: $coupon->code,
            ] : null,
            'addresses' => $addresses->map(fn (UserAddress $address) => $this->formatAddress($address))->values()->all(),
            'selectedAddressId' => $selectedAddressId,
            'savedForLaterItems' => $request->user()
                ? $this->savedForLater->formattedLineItems($request->user(), $products)
                : [],
            'estimatedDeliveryDate' => $this->shipping->estimatedDeliveryDate()->toFormattedDateString(),
        ];
    }

    public function clear(Request $request): void
    {
        if ($user = $request->user()) {
            $this->deleteUserCart($user);
        }

        $request->session()->forget([
            self::SESSION_KEY,
            self::COUPON_SESSION_KEY,
            self::ADDRESS_SESSION_KEY,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function formatAddress(UserAddress $address): array
    {
        return [
            'id' => $address->id,
            'full_name' => $address->full_name,
            'phone' => $address->phone,
            'alternate_phone' => $address->alternate_phone,
            'date_of_birth' => $address->date_of_birth?->format('Y-m-d'),
            'address_line_1' => $address->address_line_1,
            'address_line_2' => $address->address_line_2,
            'landmark' => $address->landmark,
            'city' => $address->city,
            'state' => $address->state,
            'country' => $address->country,
            'pincode' => $address->pincode,
            'latitude' => $address->latitude ? (float) $address->latitude : null,
            'longitude' => $address->longitude ? (float) $address->longitude : null,
            'is_default' => (bool) $address->is_default,
        ];
    }

    public function resolveVariant(Product $product, ?string $color, ?string $size): ?ProductVariant
    {
        if ($product->variants->isEmpty()) {
            return null;
        }

        $requiresColor = $product->variants->contains(
            fn (ProductVariant $variant) => $variant->optionValues->contains(
                fn ($value) => $value->attribute?->slug === 'color',
            ),
        );
        $requiresSize = $product->variants->contains(
            fn (ProductVariant $variant) => $variant->optionValues->contains(
                fn ($value) => $value->attribute?->slug === 'size',
            ),
        );

        if (($requiresColor && blank($color)) || ($requiresSize && blank($size))) {
            return null;
        }

        return $product->variants->first(function (ProductVariant $variant) use ($color, $size, $requiresColor, $requiresSize): bool {
            $optionValues = $variant->optionValues;

            $colorMatch = ! $requiresColor || $optionValues->contains(
                fn ($value) => $value->attribute?->slug === 'color'
                    && strcasecmp($value->value, $color) === 0,
            );

            $sizeMatch = ! $requiresSize || $optionValues->contains(
                fn ($value) => $value->attribute?->slug === 'size'
                    && strcasecmp($value->value, $size) === 0,
            );

            return $colorMatch && $sizeMatch;
        });
    }

    private function loadProduct(int $productId): Product
    {
        return Product::query()
            ->where('status', 'active')
            ->with(['variants' => fn ($query) => $query->where('status', 'active')->with('optionValues.attribute')])
            ->findOrFail($productId);
    }

    private function resolveVariantId(
        Product $product,
        ?int $variantId,
        ?string $color,
        ?string $size,
    ): ?int {
        if (! $variantId && ($color || $size)) {
            $variantId = $this->resolveVariant($product, $color, $size)?->id;
        }

        if ($variantId && ($color || $size)) {
            $variant = $product->variants->firstWhere('id', $variantId);

            if (! $variant || ! $this->variantMatchesSelection($variant, $color, $size)) {
                throw ValidationException::withMessages([
                    'variant_id' => __('The selected variant does not match the selected color and size.'),
                ]);
            }
        }

        return $variantId;
    }

    private function variantMatchesSelection(ProductVariant $variant, ?string $color, ?string $size): bool
    {
        $optionValues = $variant->optionValues;

        $colorMatch = blank($color) || $optionValues->contains(
            fn ($value) => $value->attribute?->slug === 'color'
                && strcasecmp($value->value, $color) === 0,
        );

        $sizeMatch = blank($size) || $optionValues->contains(
            fn ($value) => $value->attribute?->slug === 'size'
                && strcasecmp($value->value, $size) === 0,
        );

        return $colorMatch && $sizeMatch;
    }

    private function assertCanAdd(Product $product, ?int $variantId, int $quantity): void
    {
        if ($variantId) {
            $variant = $product->variants->firstWhere('id', $variantId);

            if (! $variant) {
                throw ValidationException::withMessages([
                    'variant_id' => __('The selected variant is not available.'),
                ]);
            }

            if ($variant->stock < 1) {
                throw ValidationException::withMessages([
                    'quantity' => __('This variant is out of stock.'),
                ]);
            }

            return;
        }

        if ($product->variants->isNotEmpty()) {
            throw ValidationException::withMessages([
                'variant_id' => __('Please select a valid color and size.'),
            ]);
        }

        if ($product->stock < 1) {
            throw ValidationException::withMessages([
                'quantity' => __('This product is out of stock.'),
            ]);
        }
    }

    private function assertStockAvailable(Product $product, ?int $variantId, int $quantity): void
    {
        $availableStock = $variantId
            ? (int) ($product->variants->firstWhere('id', $variantId)?->stock ?? 0)
            : (int) $product->stock;

        if ($quantity > $availableStock) {
            throw ValidationException::withMessages([
                'quantity' => __('Only :count items available in stock.', ['count' => $availableStock]),
            ]);
        }
    }

    /**
     * @param  array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>  $items
     */
    private function putItems(Request $request, array $items): void
    {
        $items = $this->normalizeItems($items);
        $request->session()->put(self::SESSION_KEY, $items);

        if ($user = $request->user()) {
            $this->syncDatabaseCart($user, $items);
        }
    }

    /**
     * @return array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>
     */
    private function loadDatabaseItems(User $user): array
    {
        $cart = $user->cart()->with('items')->first();

        if (! $cart) {
            return [];
        }

        return $cart->items
            ->map(fn (CartItem $item): array => [
                'key' => $this->makeKey((int) $item->product_id, $item->variant_id ? (int) $item->variant_id : null),
                'product_id' => (int) $item->product_id,
                'variant_id' => $item->variant_id ? (int) $item->variant_id : null,
                'quantity' => (int) $item->quantity,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>  $items
     */
    private function syncDatabaseCart(User $user, array $items): void
    {
        if ($items === []) {
            $this->deleteUserCart($user);

            return;
        }

        $cart = Cart::query()->firstOrCreate(['user_id' => $user->id]);

        $productIds = array_values(array_unique(array_column($items, 'product_id')));
        $products = Product::query()
            ->whereIn('id', $productIds)
            ->where('status', 'active')
            ->with(['variants' => fn ($query) => $query->where('status', 'active')])
            ->get()
            ->keyBy('id');

        $retainedItemIds = [];

        foreach ($items as $item) {
            /** @var Product|null $product */
            $product = $products->get($item['product_id']);

            if (! $product) {
                continue;
            }

            $price = $this->resolveStoredPrice($product, $item['variant_id']);
            $quantity = (int) $item['quantity'];

            $cartItem = CartItem::query()->updateOrCreate(
                [
                    'cart_id' => $cart->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                ],
                [
                    'quantity' => $quantity,
                    'price' => $price,
                    'subtotal' => round($price * $quantity, 2),
                ],
            );

            $retainedItemIds[] = $cartItem->id;
        }

        $cart->items()
            ->when($retainedItemIds !== [], fn ($query) => $query->whereNotIn('id', $retainedItemIds))
            ->when($retainedItemIds === [], fn ($query) => $query)
            ->delete();
    }

    /**
     * @param  array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>  $base
     * @param  array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>  $incoming
     * @return array<int, array{key: string, product_id: int, variant_id: int|null, quantity: int}>
     */
    private function mergeItemCollections(array $base, array $incoming): array
    {
        $indexed = collect($base)->keyBy('key');

        foreach ($incoming as $item) {
            if ($indexed->has($item['key'])) {
                $existing = $indexed->get($item['key']);
                $existing['quantity'] = min(99, (int) $existing['quantity'] + (int) $item['quantity']);
                $indexed->put($item['key'], $existing);

                continue;
            }

            $indexed->put($item['key'], $item);
        }

        return $indexed->values()->all();
    }

    private function resolveStoredPrice(Product $product, ?int $variantId): float
    {
        if ($variantId) {
            $variant = $product->variants->firstWhere('id', $variantId);

            return (float) ($variant?->sale_price ?? $product->sale_price);
        }

        return (float) $product->sale_price;
    }

    private function deleteUserCart(User $user): void
    {
        $cart = $user->cart()->first();

        if (! $cart) {
            return;
        }

        $cart->items()->delete();
        $cart->delete();
    }
}
