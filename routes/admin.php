<?php

use App\Http\Controllers\Admin\AnnouncementOfferController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\JewelleryController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\OrderShipmentController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ShippingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\HomepagePopupController;
use App\Http\Controllers\Admin\LookbookSectionController;
use App\Http\Controllers\Admin\PromoStripController;
use App\Http\Controllers\Admin\SocialStoryController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\Settings\GeneralSettingController;
use App\Http\Controllers\Admin\Settings\SocialMediaSettingController;
use App\Http\Controllers\Admin\Settings\ThemeSettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::post('categories/{category}/update', [CategoryController::class, 'update'])->name('categories.update.post');
        Route::post('categories/{category}/delete', [CategoryController::class, 'destroy'])->name('categories.delete');
        Route::resource('brands', BrandController::class)->except(['show']);
        Route::post('brands/{brand}/update', [BrandController::class, 'update'])->name('brands.update.post');
        Route::post('brands/{brand}/delete', [BrandController::class, 'destroy'])->name('brands.delete');
        Route::post('colors/quick-store', [ColorController::class, 'quickStore'])->name('colors.quick-store');
        Route::resource('colors', ColorController::class)->except(['show']);
        Route::post('colors/{color}/update', [ColorController::class, 'update'])->name('colors.update.post');
        Route::post('colors/{color}/delete', [ColorController::class, 'destroy'])->name('colors.delete');
        Route::resource('coupons', CouponController::class);
        Route::post('coupons/{coupon}/update', [CouponController::class, 'update'])->name('coupons.update.post');
        Route::post('coupons/{coupon}/delete', [CouponController::class, 'destroy'])->name('coupons.delete');
        Route::resource('products', ProductController::class);
        Route::post('products/{product}/update', [ProductController::class, 'update'])->name('products.update.post');
        Route::post('products/{product}/delete', [ProductController::class, 'destroy'])->name('products.delete');
        Route::resource('jewellery', JewelleryController::class)->parameters(['jewellery' => 'product']);
        Route::post('jewellery/{product}/update', [JewelleryController::class, 'update'])->name('jewellery.update.post');
        Route::post('jewellery/{product}/delete', [JewelleryController::class, 'destroy'])->name('jewellery.delete');
        Route::resource('banners', BannerController::class)->except(['show']);
        Route::post('banners/{banner}/update', [BannerController::class, 'update'])->name('banners.update.post');
        Route::post('banners/{banner}/delete', [BannerController::class, 'destroy'])->name('banners.delete');
        Route::resource('announcement-offers', AnnouncementOfferController::class)->except(['show']);
        Route::post('announcement-offers/{announcement_offer}/update', [AnnouncementOfferController::class, 'update'])->name('announcement-offers.update.post');
        Route::post('announcement-offers/{announcement_offer}/delete', [AnnouncementOfferController::class, 'destroy'])->name('announcement-offers.delete');
        Route::get('promo-strip', [PromoStripController::class, 'edit'])->name('promo-strip.edit');
        Route::put('promo-strip', [PromoStripController::class, 'update'])->name('promo-strip.update');
        Route::post('promo-strip/update', [PromoStripController::class, 'update'])->name('promo-strip.update.post');
        Route::get('homepage-popup', [HomepagePopupController::class, 'edit'])->name('homepage-popup.edit');
        Route::put('homepage-popup', [HomepagePopupController::class, 'update'])->name('homepage-popup.update');
        Route::post('homepage-popup/update', [HomepagePopupController::class, 'update'])->name('homepage-popup.update.post');
        Route::get('lookbook-section', [LookbookSectionController::class, 'edit'])->name('lookbook-section.edit');
        Route::put('lookbook-section', [LookbookSectionController::class, 'update'])->name('lookbook-section.update');
        Route::post('lookbook-section/update', [LookbookSectionController::class, 'update'])->name('lookbook-section.update.post');
        Route::resource('social-stories', SocialStoryController::class)->except(['show']);
        Route::post('social-stories/{social_story}/update', [SocialStoryController::class, 'update'])->name('social-stories.update.post');
        Route::post('social-stories/{social_story}/delete', [SocialStoryController::class, 'destroy'])->name('social-stories.delete');
        Route::resource('testimonials', TestimonialController::class)->except(['show']);
        Route::post('testimonials/{testimonial}/update', [TestimonialController::class, 'update'])->name('testimonials.update.post');
        Route::post('testimonials/{testimonial}/delete', [TestimonialController::class, 'destroy'])->name('testimonials.delete');
        Route::resource('blogs', BlogController::class)->except(['show']);
        Route::post('blogs/{blog}/update', [BlogController::class, 'update'])->name('blogs.update.post');
        Route::post('blogs/{blog}/delete', [BlogController::class, 'destroy'])->name('blogs.delete');
        Route::resource('users', UserController::class)->only(['index', 'show']);
        Route::resource('orders', OrderController::class)->only(['index', 'show']);
        // POST routes (shared-hosting safe; production blocks PUT/PATCH/DELETE).
        Route::post('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status.update');
        Route::post('orders/{order}/payment-status', [OrderController::class, 'updatePaymentStatus'])->name('orders.payment-status.update');
        Route::post('orders/{order}/shipment/create', [OrderShipmentController::class, 'create'])->name('orders.shipment.create');
        Route::post('orders/{order}/shipment/track', [OrderShipmentController::class, 'track'])->name('orders.shipment.track');
        Route::post('orders/{order}/shipment/cancel', [OrderShipmentController::class, 'cancel'])->name('orders.shipment.cancel');
        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');

        Route::prefix('shipping')->name('shipping.')->group(function () {
            Route::get('/', [ShippingController::class, 'index'])->name('index');
            Route::post('settings', [ShippingController::class, 'updateSettings'])->name('settings.update');
            Route::post('rules', [ShippingController::class, 'storeRule'])->name('rules.store');
            Route::post('rules/{shippingRule}', [ShippingController::class, 'updateRule'])->name('rules.update');
            Route::post('rules/{shippingRule}/delete', [ShippingController::class, 'destroyRule'])->name('rules.delete');
            Route::post('rules/{shippingRule}/toggle', [ShippingController::class, 'toggleRule'])->name('rules.toggle');
        });

        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('general', [GeneralSettingController::class, 'edit'])->name('general.edit');
            Route::put('general', [GeneralSettingController::class, 'update'])->name('general.update');
            Route::post('general/update', [GeneralSettingController::class, 'update'])->name('general.update.post');

            Route::get('theme', [ThemeSettingController::class, 'edit'])->name('theme.edit');
            Route::put('theme', [ThemeSettingController::class, 'update'])->name('theme.update');
            Route::post('theme/update', [ThemeSettingController::class, 'update'])->name('theme.update.post');

            Route::get('social-media', [SocialMediaSettingController::class, 'edit'])->name('social-media.edit');
            Route::put('social-media', [SocialMediaSettingController::class, 'update'])->name('social-media.update');
            Route::post('social-media/update', [SocialMediaSettingController::class, 'update'])->name('social-media.update.post');
        });
    });
