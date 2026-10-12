<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'site_name',
    'site_email',
    'site_phone',
    'site_address',
    'logo',
    'favicon',
    'whatsapp_number',
    'support_email',
    'support_phone',
])]
class GeneralSetting extends Model
{
    public static function instance(): self
    {
        return static::query()->firstOrCreate([], [
            'site_name' => config('app.name', 'Med Ecom'),
            'site_email' => 'admin@gmail.com',
            'site_phone' => '',
            'site_address' => null,
            'logo' => null,
            'favicon' => null,
            'whatsapp_number' => null,
            'support_email' => null,
            'support_phone' => null,
        ]);
    }
}
