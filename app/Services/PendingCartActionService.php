<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PendingCartActionService
{
    public const SESSION_KEY = 'storefront.pending.cart';

    public function __construct(
        private CartService $cart,
    ) {}

    /**
     * @param  array{product_id: int, variant_id: int|null, color: string|null, size: string|null, quantity: int}  $payload
     */
    public function store(Request $request, array $payload): void
    {
        $request->session()->put(self::SESSION_KEY, [
            'product_id' => (int) $payload['product_id'],
            'variant_id' => $payload['variant_id'],
            'color' => $payload['color'],
            'size' => $payload['size'],
            'quantity' => min(99, max(1, (int) $payload['quantity'])),
        ]);

        $request->session()->forget(BuyNowService::SESSION_KEY);
    }

    public function has(Request $request): bool
    {
        return is_array($request->session()->get(self::SESSION_KEY));
    }

    public function clear(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
    }

    /**
     * @return array{product_id: int, variant_id: int|null, color: string|null, size: string|null, quantity: int}|null
     */
    public function payload(Request $request): ?array
    {
        $stored = $request->session()->get(self::SESSION_KEY);

        if (! is_array($stored) || ! isset($stored['product_id'])) {
            return null;
        }

        return [
            'product_id' => (int) $stored['product_id'],
            'variant_id' => isset($stored['variant_id']) && $stored['variant_id'] !== null
                ? (int) $stored['variant_id']
                : null,
            'color' => isset($stored['color']) ? (string) $stored['color'] : null,
            'size' => isset($stored['size']) ? (string) $stored['size'] : null,
            'quantity' => min(99, max(1, (int) ($stored['quantity'] ?? 1))),
        ];
    }

    public function complete(Request $request, User $user): string
    {
        $payload = $this->payload($request);

        if (! $payload) {
            throw ValidationException::withMessages([
                'cart' => __('Your add to cart request has expired. Please try again.'),
            ]);
        }

        try {
            $key = $this->cart->add(
                $request,
                $payload['product_id'],
                $payload['variant_id'],
                $payload['color'],
                $payload['size'],
                $payload['quantity'],
            );
        } catch (ValidationException $exception) {
            Log::warning('Pending add to cart failed after authentication', [
                'user_id' => $user->id,
                'product_id' => $payload['product_id'],
                'errors' => $exception->errors(),
            ]);

            throw $exception;
        }

        $this->clear($request);

        return $key;
    }
}
