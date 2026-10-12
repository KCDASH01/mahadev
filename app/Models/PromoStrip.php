<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'image',
    'mobile_image',
    'is_visible',
])]
class PromoStrip extends Model
{
    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
        ];
    }

    public static function instance(): self
    {
        return static::query()->firstOrCreate([], [
            'image' => null,
            'mobile_image' => null,
            'is_visible' => true,
        ]);
    }
}
