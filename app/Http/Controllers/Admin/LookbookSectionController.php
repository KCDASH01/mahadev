<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateLookbookSectionRequest;
use App\Models\LookbookSection;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LookbookSectionController extends Controller
{
    use HandlesMediaUpload;

    public function edit(): Response
    {
        return Inertia::render('admin/lookbook-section/edit', [
            'lookbookSection' => LookbookSection::instance(),
        ]);
    }

    public function update(UpdateLookbookSectionRequest $request): RedirectResponse
    {
        $section = LookbookSection::instance();
        $data = $request->validated();

        if ($request->file('poster_image_file')) {
            $data['poster_image'] = $this->resolveMediaField(
                $request->file('poster_image_file'),
                null,
                $section->poster_image,
                'lookbook-section',
            );
        } elseif (filled($data['poster_image'] ?? null)) {
            $data['poster_image'] = $this->resolveMediaField(
                null,
                $data['poster_image'],
                $section->poster_image,
                'lookbook-section',
            );
        } else {
            $this->deleteStoredMedia($section->poster_image);
            $data['poster_image'] = null;
        }

        if ($request->file('video_url_file')) {
            $data['video_url'] = $this->resolveMediaField(
                $request->file('video_url_file'),
                null,
                $section->video_url,
                'lookbook-section',
            );
        } elseif (filled($data['video_url'] ?? null)) {
            $data['video_url'] = $this->resolveMediaField(
                null,
                $data['video_url'],
                $section->video_url,
                'lookbook-section',
            );
        } elseif (array_key_exists('video_url', $data)) {
            $this->deleteStoredMedia($section->video_url);
            $data['video_url'] = null;
        } else {
            unset($data['video_url']);
        }

        unset($data['poster_image_file'], $data['video_url_file']);

        $section->update($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Lookbook section updated successfully.'),
        ]);

        return to_route('admin.lookbook-section.edit');
    }
}
