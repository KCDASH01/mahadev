<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductDetailService;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(Product $product, ProductDetailService $productDetail): Response
    {
        abort_unless($product->status === 'active', 404);

        return Inertia::render('products/show', $productDetail->show($product));
    }
}
