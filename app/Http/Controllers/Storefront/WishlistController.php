<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\ToggleWishlistRequest;
use App\Services\StorefrontProductService;
use App\Services\WishlistService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request, WishlistService $wishlist, StorefrontProductService $products): Response
    {
        return Inertia::render('account/wishlist/index', [
            'products' => $wishlist->formattedProducts($request->user(), $products),
        ]);
    }

    public function toggle(ToggleWishlistRequest $request, WishlistService $wishlist): RedirectResponse
    {
        $wishlist->toggle($request->user(), $request->integer('product_id'));

        return back();
    }
}
