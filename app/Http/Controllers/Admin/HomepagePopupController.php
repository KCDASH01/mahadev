<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateHomepagePopupRequest;
use App\Models\HomepagePopup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class HomepagePopupController extends Controller
{
    use HandlesMediaUpload;

    public function edit(): Response
    {
        return Inertia::render('admin/homepage-popup/edit', [
            'homepagePopup' => HomepagePopup::instance(),
        ]);
    }

    public function update(UpdateHomepagePopupRequest $request): RedirectResponse
    {
        $popup = HomepagePopup::instance();
        $data = $request->validated();

        $data['image'] = $this->storePopupImage(
            $request->file('image_file'),
            $data['image'] ?? null,
            $popup->image,
            'homepage-popup',
        );

        $data['mobile_image'] = $this->storePopupImage(
            $request->file('mobile_image_file'),
            $data['mobile_image'] ?? null,
            $popup->mobile_image,
            'homepage-popup',
        );

        unset($data['image_file'], $data['mobile_image_file']);

        $popup->update($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Homepage popup updated successfully.'),
        ]);

        return to_route('admin.homepage-popup.edit');
    }

    private function storePopupImage(
        ?UploadedFile $file,
        ?string $url,
        ?string $existing,
        string $directory,
    ): ?string {
        if ($file) {
            return $this->resolveMediaField($file, null, $existing, $directory);
        }

        if (filled($url)) {
            return $this->resolveMediaField(null, $url, $existing, $directory);
        }

        $this->deleteStoredMedia($existing);

        return null;
    }
}
