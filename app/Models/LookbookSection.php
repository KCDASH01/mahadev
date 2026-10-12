<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'eyebrow',
    'title',
    'subtitle',
    'cta_label',
    'cta_href',
    'poster_image',
    'video_url',
    'is_visible',
])]
class LookbookSection extends Model
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
            'eyebrow' => 'Lookbook',
            'title' => 'Crafted for Modern Indian Fashion',
            'subtitle' => 'Garments and furniture for everyday living — discover the Mahadev difference.',
            'cta_label' => 'Watch the Lookbook',
            'cta_href' => '/trending',
            'poster_image' => 'https://images.unsplash.com/photo-1771654805161-442c6aab7b55?auto=format&fit=crop&w=2200&q=85',
            'video_url' => null,
            'is_visible' => true,
        ]);
    }
}
