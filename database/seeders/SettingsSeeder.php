<?php

namespace Database\Seeders;

use App\Models\GeneralSetting;
use App\Models\SocialMediaSetting;
use App\Models\ThemeSetting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        GeneralSetting::query()->updateOrCreate([], [
            'site_name' => 'Mahadev Multipurpose Co-operative Society Ltd',
            'site_email' => 'support@mahadevcooperative.in',
            'site_phone' => '+91 00000 00000',
            'site_address' => 'Odisha, India',
            'logo' => 'mahadev-logo.jpeg',
            'favicon' => 'mahadev-logo.jpeg',
            'whatsapp_number' => '+91 00000 00000',
            'support_email' => 'support@mahadevcooperative.in',
            'support_phone' => '+91 00000 00000',
        ]);

        ThemeSetting::query()->updateOrCreate([], [
            'primary_color' => '#062A4D',
            'secondary_color' => '#D6A62D',
            'button_color' => '#D6A62D',
            'header_color' => '#FFFFFF',
            'footer_color' => '#03182D',
        ]);

        SocialMediaSetting::query()->firstOrCreate([], [
            'facebook_url' => 'https://facebook.com',
            'instagram_url' => 'https://instagram.com',
            'twitter_url' => 'https://twitter.com',
            'linkedin_url' => 'https://linkedin.com',
            'youtube_url' => 'https://youtube.com',
        ]);
    }
}
