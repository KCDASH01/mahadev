<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateThemeSettingRequest;
use App\Models\ThemeSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ThemeSettingController extends Controller
{
    /**
     * Show the theme settings form.
     */
    public function edit(): Response
    {
        return Inertia::render('admin/settings/theme', [
            'settings' => ThemeSetting::instance(),
        ]);
    }

    /**
     * Update the theme settings.
     */
    public function update(UpdateThemeSettingRequest $request): RedirectResponse
    {
        ThemeSetting::instance()->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Theme settings updated successfully.'),
        ]);

        return to_route('admin.settings.theme.edit');
    }
}
