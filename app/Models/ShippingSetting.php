<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'cod_enabled',
    'default_delivery_days',
])]
class ShippingSetting extends Model
{
    protected function casts(): array
    {
        return [
            'cod_enabled' => 'boolean',
            'default_delivery_days' => 'integer',
        ];
    }

    public static function instance(): self
    {
        return static::query()->firstOrCreate([], [
            'cod_enabled' => true,
            'default_delivery_days' => 7,
        ]);
    }
}
