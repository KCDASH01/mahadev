<?php

namespace App\Http\Controllers\Admin;

use App\Models\Product;

class JewelleryController extends ProductController
{
    protected function productType(): string
    {
        return Product::TYPE_JEWELLERY;
    }
}
