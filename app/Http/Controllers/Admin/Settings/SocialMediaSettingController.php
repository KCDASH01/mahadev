<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateSocialMediaSettingRequest;
use App\Models\SocialMediaSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SocialMediaSettingController extends Controller
{
    /**
     * Show the social media settings form.
     */
    public function edit(): Response
    {
        return Inertia::render('admin/settings/social-media', [
            'settings' => SocialMediaSetting::instance(),
        ]);
    }

    /**
     * Update the social media settings.
     */
    public function update(UpdateSocialMediaSettingRequest $request): RedirectResponse
    {
        SocialMediaSetting::instance()->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Social media settings updated successfully.'),
        ]);

        return to_route('admin.settings.social-media.edit');
    }
}
