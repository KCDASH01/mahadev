<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'min_amount',
    'max_amount',
    'shipping_charge',
    'is_active',
])]
class ShippingRule extends Model
{
    protected function casts(): array
    {
        return [
            'min_amount' => 'decimal:2',
            'max_amount' => 'decimal:2',
            'shipping_charge' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
