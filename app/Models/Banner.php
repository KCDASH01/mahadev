<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'accent_line',
    'main_line',
    'tagline',
    'promo_text',
    'image',
    'video',
    'mobile_image',
    'mobile_video',
    'media_type',
    'image_position',
    'link',
    'cta_label',
    'placement',
    'sort_order',
    'gender',
    'status',
])]
class Banner extends Model
{
    public const MEDIA_TYPE_IMAGE = 'image';

    public const MEDIA_TYPE_VIDEO = 'video';

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'media_type' => self::MEDIA_TYPE_IMAGE,
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function isVideo(): bool
    {
        return $this->media_type === self::MEDIA_TYPE_VIDEO && filled($this->video);
    }
}
