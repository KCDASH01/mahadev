<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\StoreProductReviewRequest;
use App\Models\Product;
use App\Services\ProductReviewService;
use Illuminate\Http\RedirectResponse;

class ProductReviewController extends Controller
{
    public function store(
        StoreProductReviewRequest $request,
        string $slug,
        ProductReviewService $reviews,
    ): RedirectResponse {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $reviews->store(
            $request->user(),
            $product,
            $request->integer('rating'),
            $request->string('body')->toString(),
            $request->input('title'),
        );

        return back();
    }
}
