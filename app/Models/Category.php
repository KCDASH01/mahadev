<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'parent_id',
    'name',
    'slug',
    'gender',
    'nav_group',
    'image',
    'banner_image',
    'description',
    'sort_order',
    'status',
    'is_featured',
])]
class Category extends Model
{
    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function attributes(): BelongsToMany
    {
        return $this->belongsToMany(Attribute::class, 'category_attribute')
            ->withPivot(['is_filterable', 'is_variant_axis', 'is_required', 'sort_order'])
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function scopeJewelleryTree($query)
    {
        return $query->where(function ($builder): void {
            $builder->where('slug', 'jewellery')
                ->orWhereHas('parent', fn ($parent) => $parent->where('slug', 'jewellery'));
        });
    }

    public function scopeJewelleryLeaves($query)
    {
        return $query->whereNotNull('parent_id')
            ->whereHas('parent', fn ($parent) => $parent->where('slug', 'jewellery'));
    }

    public function scopeClothingLeaves($query)
    {
        return $query->whereNotNull('parent_id')
            ->whereHas(
                'parent',
                fn ($parent) => $parent->whereIn('slug', ['gents', 'ladies', 'furniture']),
            );
    }
}
