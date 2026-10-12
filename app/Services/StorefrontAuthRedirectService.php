<?php

namespace App\Services;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StorefrontAuthRedirectService
{
    public function __construct(
        private BuyNowService $buyNow,
        private PendingCartActionService $pendingCart,
        private CartService $cart,
    ) {}

    public function afterAuthentication(Request $request): RedirectResponse
    {
        $this->cart->mergeGuestSessionIntoUserCart($request);

        $user = $request->user();

        if ($user?->isAdmin()) {
            $request->session()->forget('url.intended');

            return redirect()->route('dashboard');
        }

        if ($this->buyNow->isActive($request)) {
            return redirect()->route('checkout.index');
        }

        if ($this->pendingCart->has($request)) {
            try {
                $this->pendingCart->complete($request, $user);

                Inertia::flash('toast', [
                    'type' => 'success',
                    'message' => __('Item added to your cart.'),
                ]);
            } catch (ValidationException $exception) {
                $message = collect($exception->errors())->flatten()->first()
                    ?: __('Unable to add the item to your cart. Please try again.');

                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => $message,
                ]);

                Log::warning('Post-auth pending cart redirect failed', [
                    'user_id' => $user?->id,
                    'errors' => $exception->errors(),
                ]);
            }

            return redirect()->route('cart.index');
        }

        return redirect()->intended(route('home'));
    }

    public function rememberIntendedUrl(Request $request, mixed $url): void
    {
        if (! is_string($url) || ! $this->isSafeInternalPath($url)) {
            return;
        }

        $request->session()->put('url.intended', $url);
    }

    private function isSafeInternalPath(string $url): bool
    {
        if (! str_starts_with($url, '/') || str_starts_with($url, '//')) {
            return false;
        }

        $path = parse_url($url, PHP_URL_PATH);

        return is_string($path) && str_starts_with($path, '/');
    }
}
