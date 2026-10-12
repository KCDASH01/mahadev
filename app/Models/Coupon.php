<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code',
    'title',
    'description',
    'type',
    'value',
    'buy_quantity',
    'get_quantity',
    'minimum_amount',
    'max_discount',
    'usage_limit',
    'per_user_limit',
    'used_count',
    'starts_at',
    'expiry_date',
    'first_order_only',
    'status',
])]
class Coupon extends Model
{
    public const TYPE_FIXED = 'fixed';

    public const TYPE_PERCENTAGE = 'percentage';

    public const TYPE_FREE_SHIPPING = 'free_shipping';

    public const TYPE_BUY_X_GET_Y = 'buy_x_get_y';

    public const TYPE_FIRST_ORDER = 'first_order';

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'minimum_amount' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'usage_limit' => 'integer',
            'per_user_limit' => 'integer',
            'used_count' => 'integer',
            'buy_quantity' => 'integer',
            'get_quantity' => 'integer',
            'starts_at' => 'date',
            'expiry_date' => 'date',
            'first_order_only' => 'boolean',
        ];
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'coupon_category');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'coupon_product');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
