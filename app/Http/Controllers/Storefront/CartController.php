<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\ApplyCartCouponRequest;
use App\Http\Requests\Storefront\DestroyCartItemRequest;
use App\Http\Requests\Storefront\SelectCartAddressRequest;
use App\Http\Requests\Storefront\StoreCartIntentRequest;
use App\Http\Requests\Storefront\StoreCartItemRequest;
use App\Http\Requests\Storefront\UpdateCartItemRequest;
use App\Models\SavedForLaterItem;
use App\Services\CartService;
use App\Services\PendingCartActionService;
use App\Services\SavedForLaterService;
use App\Services\StorefrontProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request, StorefrontProductService $products, CartService $cart): Response
    {
        $catalog = $products->collection(
            $products->baseQuery()->orderByDesc('created_at')->get(),
        );

        return Inertia::render('cart', [
            ...$cart->cartPagePayload($request, $products),
            'catalogProducts' => $catalog,
        ]);
    }

    public function store(StoreCartItemRequest $request, CartService $cart): RedirectResponse
    {
        $cart->add(
            $request,
            $request->integer('product_id'),
            $request->input('variant_id') ? $request->integer('variant_id') : null,
            $request->input('color'),
            $request->input('size'),
            $request->integer('quantity', 1),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Added to your cart.'),
        ]);

        return back();
    }

    public function intent(
        StoreCartIntentRequest $request,
        CartService $cart,
        PendingCartActionService $pendingCart,
    ): RedirectResponse {
        $productId = $request->integer('product_id');
        $variantId = $request->input('variant_id') ? $request->integer('variant_id') : null;
        $color = $request->input('color');
        $size = $request->input('size');
        $quantity = $request->integer('quantity', 1);

        if ($request->user()) {
            $cart->add($request, $productId, $variantId, $color, $size, $quantity);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => __('Added to your cart.'),
            ]);

            return back();
        }

        $cart->validateBuyNowItem($productId, $variantId, $color, $size, $quantity);

        $pendingCart->store($request, [
            'product_id' => $productId,
            'variant_id' => $variantId,
            'color' => $color,
            'size' => $size,
            'quantity' => $quantity,
        ]);

        return redirect()->route('login');
    }

    public function update(UpdateCartItemRequest $request, CartService $cart): RedirectResponse
    {
        $cart->updateQuantity(
            $request,
            $request->string('key')->toString(),
            $request->integer('quantity'),
        );

        return back();
    }

    public function destroy(DestroyCartItemRequest $request, CartService $cart): RedirectResponse
    {
        $cart->remove($request, $request->string('key')->toString());

        return back();
    }

    public function saveForLater(DestroyCartItemRequest $request, CartService $cart): RedirectResponse
    {
        $cart->saveItemForLater($request, $request->string('key')->toString());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Item saved for later.'),
        ]);

        return back();
    }

    public function moveToWishlist(DestroyCartItemRequest $request, CartService $cart): RedirectResponse
    {
        $cart->moveItemToWishlist($request, $request->string('key')->toString());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Item moved to your wishlist.'),
        ]);

        return back();
    }

    public function moveSavedToCart(
        Request $request,
        SavedForLaterItem $savedItem,
        CartService $cart,
        SavedForLaterService $savedForLater,
    ): RedirectResponse {
        $savedForLater->moveToCart($request, $cart, $request->user(), $savedItem);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Item moved back to your cart.'),
        ]);

        return back();
    }

    public function removeSaved(
        Request $request,
        SavedForLaterItem $savedItem,
        SavedForLaterService $savedForLater,
    ): RedirectResponse {
        $savedForLater->remove($request->user(), $savedItem);

        return back();
    }

    public function applyCoupon(
        ApplyCartCouponRequest $request,
        CartService $cart,
        StorefrontProductService $products,
    ): RedirectResponse {
        $lineItems = $cart->formattedLineItems($request, $products);
        $cart->applyCoupon($request, $request->string('code')->toString(), $lineItems);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Coupon applied successfully.'),
        ]);

        return back();
    }

    public function removeCoupon(Request $request, CartService $cart): RedirectResponse
    {
        $cart->removeCoupon($request);

        return back();
    }

    public function selectAddress(SelectCartAddressRequest $request, CartService $cart): RedirectResponse
    {
        $cart->setSelectedAddress(
            $request,
            $request->input('address_id') ? $request->integer('address_id') : null,
        );

        return back();
    }
}
