<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'facebook_url',
    'instagram_url',
    'twitter_url',
    'linkedin_url',
    'youtube_url',
])]
class SocialMediaSetting extends Model
{
    public static function instance(): self
    {
        return static::query()->firstOrCreate([], [
            'facebook_url' => null,
            'instagram_url' => null,
            'twitter_url' => null,
            'linkedin_url' => null,
            'youtube_url' => null,
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function activeLinks(): array
    {
        return array_filter([
            'facebook' => $this->facebook_url,
            'instagram' => $this->instagram_url,
            'twitter' => $this->twitter_url,
            'linkedin' => $this->linkedin_url,
            'youtube' => $this->youtube_url,
        ]);
    }
}
