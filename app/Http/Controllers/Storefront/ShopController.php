<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductReviewService;
use App\Services\StorefrontProductService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function show(string $slug, Request $request, StorefrontProductService $products, ProductReviewService $reviews): Response
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $formatted = $products->toFashionProduct(
            $product->load([
                'category:id,name,slug,parent_id,gender',
                'images' => fn ($query) => $query->orderBy('sort_order'),
                'variants' => fn ($query) => $query
                    ->where('status', 'active')
                    ->with(['optionValues.attribute']),
                'attributeValues.attribute',
            ]),
        );

        return Inertia::render('product-details', [
            'product' => $formatted,
            'relatedProducts' => $products->related($product),
            'reviews' => $reviews->approvedReviews($product),
            'ratingSummary' => $reviews->ratingSummary($product),
            'userReview' => $request->user()
                ? $reviews->userReview($request->user(), $product)
                : null,
        ]);
    }
}
