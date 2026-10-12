<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'category_id',
    'product_type',
    'brand_id',
    'gender',
    'name',
    'slug',
    'sku',
    'short_description',
    'fit',
    'description',
    'care_instructions',
    'details',
    'offers',
    'badge',
    'avg_rating',
    'review_count',
    'display_rating',
    'display_review_count',
    'original_price',
    'sale_price',
    'stock',
    'thumbnail',
    'weight',
    'is_featured',
    'is_new_arrival',
    'is_trending',
    'is_best_seller',
    'published_at',
    'status',
])]
class Product extends Model
{
    public const TYPE_CLOTHING = 'clothing';

    public const TYPE_JEWELLERY = 'jewellery';

    public function isJewellery(): bool
    {
        return $this->product_type === self::TYPE_JEWELLERY;
    }

    public function isClothing(): bool
    {
        return ! $this->isJewellery();
    }

    public function scopeClothing($query)
    {
        return $query->where(function ($builder): void {
            $builder->where('product_type', self::TYPE_CLOTHING)
                ->orWhereNull('product_type');
        });
    }

    public function scopeJewellery($query)
    {
        return $query->where('product_type', self::TYPE_JEWELLERY);
    }

    protected function casts(): array
    {
        return [
            'original_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'weight' => 'decimal:2',
            'avg_rating' => 'decimal:2',
            'review_count' => 'integer',
            'display_rating' => 'decimal:2',
            'display_review_count' => 'integer',
            'is_featured' => 'boolean',
            'is_new_arrival' => 'boolean',
            'is_trending' => 'boolean',
            'is_best_seller' => 'boolean',
            'details' => 'array',
            'offers' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(AttributeValue::class, 'product_attribute_values')
            ->withTimestamps();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
