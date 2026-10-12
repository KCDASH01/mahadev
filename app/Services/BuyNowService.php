<?php

namespace App\Services;

use Illuminate\Http\Request;

class BuyNowService
{
    public const SESSION_KEY = 'storefront.buy_now';

    public function __construct(
        private CartService $cart,
    ) {}

    public function isActive(Request $request): bool
    {
        return $this->rawItem($request) !== null;
    }

    /**
     * @return array{key: string, product_id: int, variant_id: int|null, quantity: int}|null
     */
    public function rawItem(Request $request): ?array
    {
        $item = $request->session()->get(self::SESSION_KEY);

        if (! is_array($item) || ! isset($item['product_id'], $item['quantity'], $item['key'])) {
            return null;
        }

        return [
            'key' => (string) $item['key'],
            'product_id' => (int) $item['product_id'],
            'variant_id' => isset($item['variant_id']) && $item['variant_id'] !== null
                ? (int) $item['variant_id']
                : null,
            'quantity' => min(99, max(1, (int) $item['quantity'])),
        ];
    }

    public function start(
        Request $request,
        int $productId,
        ?int $variantId,
        ?string $color,
        ?string $size,
        int $quantity = 1,
    ): void {
        $item = $this->cart->validateBuyNowItem($productId, $variantId, $color, $size, $quantity);

        $request->session()->forget(PendingCartActionService::SESSION_KEY);
        $request->session()->put(self::SESSION_KEY, $item);
    }

    public function clear(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function formattedLineItems(Request $request, StorefrontProductService $products): array
    {
        $item = $this->rawItem($request);

        if (! $item) {
            return [];
        }

        return $this->cart->formattedLineItemsFromRaw([$item], $products);
    }
}
