<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'primary_color',
    'secondary_color',
    'button_color',
    'header_color',
    'footer_color',
])]
class ThemeSetting extends Model
{
    public static function instance(): self
    {
        return static::query()->firstOrCreate([], [
            'primary_color' => '#2563EB',
            'secondary_color' => '#0F172A',
            'button_color' => '#2563EB',
            'header_color' => '#FFFFFF',
            'footer_color' => '#111827',
        ]);
    }
}
