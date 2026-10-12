<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'text',
    'highlight',
    'sort_order',
    'status',
])]
class AnnouncementOffer extends Model
{
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }
}
