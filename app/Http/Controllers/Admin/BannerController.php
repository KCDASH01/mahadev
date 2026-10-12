<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBannerRequest;
use App\Http\Requests\Admin\UpdateBannerRequest;
use App\Models\Banner;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    use HandlesMediaUpload;

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/banners/index', [
            'banners' => Banner::query()
                ->where('placement', 'hero')
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/banners/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBannerRequest $request): RedirectResponse
    {
        Banner::create($this->prepareData($request->validated(), null, $request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Banner created successfully.'),
        ]);

        return to_route('admin.banners.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Banner $banner): Response
    {
        return Inertia::render('admin/banners/edit', [
            'banner' => $banner,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBannerRequest $request, Banner $banner): RedirectResponse
    {
        $banner->update($this->prepareData($request->validated(), $banner, $request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Banner updated successfully.'),
        ]);

        return to_route('admin.banners.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Banner $banner): RedirectResponse
    {
        $this->deleteStoredMedia($banner->image);
        $this->deleteStoredMedia($banner->video);
        $this->deleteStoredMedia($banner->mobile_image);
        $this->deleteStoredMedia($banner->mobile_video);
        $banner->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Banner deleted successfully.'),
        ]);

        return to_route('admin.banners.index');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(
        array $data,
        ?Banner $banner = null,
        ?FormRequest $request = null,
    ): array {
        if ($request) {
            $data['image'] = $this->resolveMediaField(
                $request->file('image_file'),
                $data['image'] ?? null,
                $banner?->image,
                'banners',
            );

            $mediaType = $data['media_type'] ?? Banner::MEDIA_TYPE_IMAGE;

            if ($mediaType === Banner::MEDIA_TYPE_VIDEO) {
                $data['video'] = $this->resolveMediaField(
                    $request->file('video_file'),
                    $data['video'] ?? null,
                    $banner?->video,
                    'banners',
                );
            } else {
                $this->deleteStoredMedia($banner?->video);
                $data['video'] = null;
                $data['media_type'] = Banner::MEDIA_TYPE_IMAGE;
            }

            $data['mobile_image'] = $this->resolveMediaField(
                $request->file('mobile_image_file'),
                $data['mobile_image'] ?? null,
                $banner?->mobile_image,
                'banners',
            );

            $data['mobile_video'] = $this->resolveMediaField(
                $request->file('mobile_video_file'),
                $data['mobile_video'] ?? null,
                $banner?->mobile_video,
                'banners',
            );
        }

        unset(
            $data['image_file'],
            $data['video_file'],
            $data['mobile_image_file'],
            $data['mobile_video_file'],
        );

        $data['media_type'] = $data['media_type'] ?? Banner::MEDIA_TYPE_IMAGE;
        $data['placement'] = 'hero';
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['cta_label'] = filled($data['cta_label'] ?? null) ? $data['cta_label'] : null;
        $data['image_position'] = filled($data['image_position'] ?? null)
            ? $data['image_position']
            : 'center top';

        return $data;
    }
}
