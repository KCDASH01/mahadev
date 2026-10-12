<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateGeneralSettingRequest;
use App\Models\GeneralSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GeneralSettingController extends Controller
{
    use HandlesMediaUpload;

    /**
     * Show the general settings form.
     */
    public function edit(): Response
    {
        return Inertia::render('admin/settings/general', [
            'settings' => GeneralSetting::instance(),
        ]);
    }

    /**
     * Update the general settings.
     */
    public function update(UpdateGeneralSettingRequest $request): RedirectResponse
    {
        $settings = GeneralSetting::instance();
        $data = $request->validated();

        $data['logo'] = $this->resolveMediaField(
            $request->file('logo_file'),
            $data['logo'] ?? null,
            $settings->logo,
            'settings/logo',
        );

        $data['favicon'] = $this->resolveMediaField(
            $request->file('favicon_file'),
            $data['favicon'] ?? null,
            $settings->favicon,
            'settings/favicon',
        );

        unset($data['logo_file'], $data['favicon_file']);

        $settings->update($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('General settings updated successfully.'),
        ]);

        return to_route('admin.settings.general.edit');
    }
}
