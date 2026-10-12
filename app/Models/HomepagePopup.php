<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'image',
    'mobile_image',
    'link',
    'is_visible',
])]
class HomepagePopup extends Model
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
            'link' => null,
            'is_visible' => false,
        ]);
    }
}
