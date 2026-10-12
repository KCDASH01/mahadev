<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Schema;

#[Fillable([
    'user_id',
    'full_name',
    'phone',
    'alternate_phone',
    'date_of_birth',
    'address_line_1',
    'address_line_2',
    'landmark',
    'city',
    'state',
    'country',
    'pincode',
    'latitude',
    'longitude',
    'is_default',
])]
class UserAddress extends Model
{
    use SoftDeletes;

    public static function bootSoftDeletes(): void
    {
        try {
            if (Schema::hasColumn('user_addresses', 'deleted_at')) {
                static::addGlobalScope(new SoftDeletingScope);
            }
        } catch (\Throwable $e) {
            // Ignore schema check error if DB table is not ready
        }
    }

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'is_default' => 'boolean',
            'date_of_birth' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'address_id');
    }
}
