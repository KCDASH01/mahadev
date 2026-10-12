<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'headline',
    'body',
    'rating',
    'scene_image',
    'sort_order',
    'status',
])]
class Testimonial extends Model
{
    protected function casts(): array
    {
        return [
            'rating' => 'decimal:1',
            'sort_order' => 'integer',
        ];
    }
}
