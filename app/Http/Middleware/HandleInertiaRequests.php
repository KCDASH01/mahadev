<?php

namespace App\Http\Middleware;

use App\Models\AnnouncementOffer;
use App\Services\CartService;
use App\Services\SettingsService;
use App\Services\StorefrontNavigationService;
use App\Services\WishlistService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'appUrl' => rtrim((string) config('app.url'), '/'),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'appSettings' => fn () => app(SettingsService::class)->forFrontend(),
            'storefrontNav' => fn () => app(StorefrontNavigationService::class)->build(),
            'featuredCategories' => fn () => app(StorefrontNavigationService::class)->featuredCategories(),
            'cart' => fn () => app(CartService::class)->summary($request),
            'wishlist' => fn () => [
                'productIds' => app(WishlistService::class)->productIds($request->user()),
            ],
            'announcementOffers' => function () {
                try {
                    $offers = AnnouncementOffer::where('status', 'active')
                        ->orderBy('sort_order')
                        ->get(['id', 'text', 'highlight'])
                        ->toArray();
                        
                    \Illuminate\Support\Facades\Log::info('Loaded Announcement Offers:', $offers);
                    return $offers;
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Inertia Announcement Offers Error: ' . $e->getMessage());
                    return [];
                }
            },
            'razorpayKey' => config('services.razorpay.key'),
            'razorpayCheckout' => fn () => $request->session()->pull('razorpayCheckout'),
        ];
    }
}
