<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Storefront\AccountController;
use App\Http\Controllers\Storefront\AddressController;
use App\Http\Controllers\Storefront\BlogController;
use App\Http\Controllers\Storefront\BuyNowController;
use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\CatalogController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\GeocodeController;
use App\Http\Controllers\Storefront\OrderController;
use App\Http\Controllers\Storefront\PageController;
use App\Http\Controllers\Storefront\ProductReviewController;
use App\Http\Controllers\Storefront\ShopController;
use App\Http\Controllers\Storefront\SitemapController;
use App\Http\Controllers\Storefront\WishlistController;
use App\Support\StorefrontPath;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/collection/{collection}/category/{category}', [CatalogController::class, 'collection'])
    ->whereIn('collection', ['gents', 'ladies', 'furniture'])
    ->where('category', '[^/]+')
    ->name('collection.category');
Route::get('/collection/{collection}', [CatalogController::class, 'collection'])
    ->whereIn('collection', ['gents', 'ladies', 'furniture'])
    ->name('collection.show');
Route::get('/jewellery/category/{category}', [CatalogController::class, 'jewelleryCategory'])
    ->where('category', '[^/]+')
    ->name('jewellery.category');
Route::get('/trending/category/{category}', [CatalogController::class, 'trending'])
    ->where('category', '[^/]+')
    ->name('trending.category');
Route::get('/new-arrivals/category/{category}', [CatalogController::class, 'newArrivals'])
    ->where('category', '[^/]+')
    ->name('new-arrivals.category');
Route::get('/trending', [CatalogController::class, 'trending'])->name('trending.index');
Route::get('/new-arrivals', [CatalogController::class, 'newArrivals'])->name('new-arrivals.index');
Route::get('/product/{slug}', [ShopController::class, 'show'])->name('product.show');
Route::post('/buy-now', [BuyNowController::class, 'store'])->name('buy-now.store');
Route::post('/cart/intent', [CartController::class, 'intent'])->name('cart.intent');
Route::middleware('auth')->post('/product/{slug}/reviews', [ProductReviewController::class, 'store'])->name('product.reviews.store');
Route::middleware('auth')->post('/shop/{slug}/reviews', [ProductReviewController::class, 'store']);

Route::get('/men', fn (Request $request) => redirect(StorefrontPath::legacyRedirect('gents', $request->query('category')), 301));
Route::get('/women', fn (Request $request) => redirect(StorefrontPath::legacyRedirect('ladies', $request->query('category')), 301));
Route::get('/kids', fn () => redirect('/collection/gents', 301));
Route::get('/jewellery', fn () => redirect('/collection/ladies', 301));
Route::get('/garments', fn () => redirect('/collection/gents', 301));
Route::get('/shop/{slug}', fn (string $slug) => redirect(StorefrontPath::product($slug), 301));
Route::get('/products/{slug}', fn (string $slug) => redirect(StorefrontPath::product($slug), 301));
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::middleware('auth')->group(function () {
    Route::post('/cart/items', [CartController::class, 'store'])->name('cart.items.store');
    Route::patch('/cart/items', [CartController::class, 'update'])->name('cart.items.update');
    Route::post('/cart/items/update', [CartController::class, 'update'])->name('cart.items.update.post');
    Route::delete('/cart/items', [CartController::class, 'destroy'])->name('cart.items.destroy');
    Route::post('/cart/items/remove', [CartController::class, 'destroy'])->name('cart.items.remove');
    Route::post('/cart/items/save-for-later', [CartController::class, 'saveForLater'])->name('cart.items.save-for-later');
    Route::post('/cart/items/move-to-wishlist', [CartController::class, 'moveToWishlist'])->name('cart.items.move-to-wishlist');
    Route::post('/cart/saved-for-later/{savedItem}/move-to-cart', [CartController::class, 'moveSavedToCart'])->name('cart.saved-for-later.move-to-cart');
    Route::post('/cart/saved-for-later/{savedItem}/remove', [CartController::class, 'removeSaved'])->name('cart.saved-for-later.remove');
});
Route::post('/cart/coupon', [CartController::class, 'applyCoupon'])->name('cart.coupon.apply');
Route::delete('/cart/coupon', [CartController::class, 'removeCoupon'])->name('cart.coupon.remove');
Route::post('/cart/coupon/remove', [CartController::class, 'removeCoupon'])->name('cart.coupon.remove.post');
Route::middleware('auth')->group(function () {
    Route::patch('/cart/address', [CartController::class, 'selectAddress'])->name('cart.address.select');
    Route::post('/cart/address', [CartController::class, 'selectAddress'])->name('cart.address.select.post');
});
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index')->middleware('auth');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store')->middleware('auth');
Route::post('/checkout/verify', [CheckoutController::class, 'verify'])->name('checkout.verify')->middleware('auth');
Route::post('/checkout/abandon', [CheckoutController::class, 'abandon'])->name('checkout.abandon')->middleware('auth');
Route::post('/checkout/retry/{orderNumber}', [CheckoutController::class, 'retry'])->name('checkout.retry')->middleware('auth');
Route::get('/checkout/success/{orderNumber}', [CheckoutController::class, 'success'])->name('checkout.success')->middleware('auth');
Route::get('/checkout/failed/{orderNumber}', [CheckoutController::class, 'failed'])->name('checkout.failed')->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/account', [AccountController::class, 'index'])->name('account.index');
    Route::get('/account/profile', [AccountController::class, 'profile'])->name('account.profile');
    Route::get('/account/orders', [OrderController::class, 'index'])->name('account.orders.index');
    Route::get('/account/orders/{orderNumber}', [OrderController::class, 'show'])->name('account.orders.show');
    Route::get('/account/wishlist', [WishlistController::class, 'index'])->name('account.wishlist.index');
    Route::get('/account/addresses', [AddressController::class, 'index'])->name('account.addresses.index');
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::put('/addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::post('/addresses/{address}/update', [AddressController::class, 'update'])->name('addresses.update.post');
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::post('/addresses/{address}/remove', [AddressController::class, 'destroy'])->name('addresses.destroy.post');
    Route::patch('/addresses/{address}/default', [AddressController::class, 'makeDefault'])->name('addresses.default');
    Route::post('/addresses/{address}/default', [AddressController::class, 'makeDefault'])->name('addresses.default.post');
    Route::get('/geocode/reverse', [GeocodeController::class, 'reverse'])->name('geocode.reverse');
    Route::get('/geocode/pincode/{pincode}', [GeocodeController::class, 'pincode'])->name('geocode.pincode');
});
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/help-center', [PageController::class, 'helpCenter'])->name('help-center');
Route::get('/returns-refund-policy', [PageController::class, 'returnsRefundPolicy'])->name('returns-refund-policy');
Route::get('/shipping-policy', [PageController::class, 'shippingPolicy'])->name('shipping-policy');
Route::get('/track-order', [PageController::class, 'trackOrder'])->name('track-order');
Route::get('/privacy-policy', [PageController::class, 'privacyPolicy'])->name('privacy-policy');
Route::get('/terms-and-conditions', [PageController::class, 'termsAndConditions'])->name('terms-and-conditions');
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
