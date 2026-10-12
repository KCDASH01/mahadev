<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\StoreBuyNowRequest;
use App\Services\BuyNowService;
use Illuminate\Http\RedirectResponse;

class BuyNowController extends Controller
{
    public function store(StoreBuyNowRequest $request, BuyNowService $buyNow): RedirectResponse
    {
        $buyNow->start(
            $request,
            $request->integer('product_id'),
            $request->input('variant_id') ? $request->integer('variant_id') : null,
            $request->input('color'),
            $request->input('size'),
            $request->integer('quantity', 1),
        );

        if (! $request->user()) {
            return redirect()->route('login');
        }

        return redirect()->route('checkout.index');
    }
}
