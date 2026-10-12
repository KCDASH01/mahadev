<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'type',
    'image',
    'video_url',
    'link_url',
    'overlay_eyebrow',
    'overlay_title',
    'overlay_discount',
    'overlay_note',
    'overlay_hashtag',
    'show_thumbnail_promo',
    'sort_order',
    'status',
])]
class SocialStory extends Model
{
    protected function casts(): array
    {
        return [
            'show_thumbnail_promo' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
