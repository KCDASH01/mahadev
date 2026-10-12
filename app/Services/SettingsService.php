<?php

namespace App\Services;

use App\Models\GeneralSetting;
use App\Models\SocialMediaSetting;
use App\Models\ThemeSetting;
use Illuminate\Support\Facades\Schema;

class SettingsService
{
    public function general(): ?GeneralSetting
    {
        return $this->resolve(fn () => GeneralSetting::instance());
    }

    public function theme(): ?ThemeSetting
    {
        return $this->resolve(fn () => ThemeSetting::instance());
    }

    public function social(): ?SocialMediaSetting
    {
        return $this->resolve(fn () => SocialMediaSetting::instance());
    }

    /**
     * @return array<string, mixed>
     */
    public function forFrontend(): array
    {
        $general = $this->general();
        $theme = $this->theme();
        $social = $this->social();

        return [
            'general' => $general,
            'theme' => $theme,
            'social' => $social,
            'social_links' => $social?->activeLinks() ?? [],
        ];
    }

    private function resolve(callable $callback): mixed
    {
        if (! Schema::hasTable('general_settings')) {
            return null;
        }

        return $callback();
    }
}
