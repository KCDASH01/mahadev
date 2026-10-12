<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSocialStoryRequest;
use App\Http\Requests\Admin\UpdateSocialStoryRequest;
use App\Models\SocialStory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SocialStoryController extends Controller
{
    use HandlesMediaUpload;

    public function index(): Response
    {
        return Inertia::render('admin/social-stories/index', [
            'socialStories' => SocialStory::query()
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/social-stories/create');
    }

    public function store(StoreSocialStoryRequest $request): RedirectResponse
    {
        SocialStory::create($this->prepareData($request->validated(), null, $request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Social story created successfully.'),
        ]);

        return to_route('admin.social-stories.index');
    }

    public function edit(SocialStory $socialStory): Response
    {
        return Inertia::render('admin/social-stories/edit', [
            'socialStory' => $socialStory,
        ]);
    }

    public function update(UpdateSocialStoryRequest $request, SocialStory $socialStory): RedirectResponse
    {
        $socialStory->update($this->prepareData($request->validated(), $socialStory, $request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Social story updated successfully.'),
        ]);

        return to_route('admin.social-stories.index');
    }

    public function destroy(SocialStory $socialStory): RedirectResponse
    {
        $this->deleteStoredMedia($socialStory->image);
        $socialStory->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Social story deleted successfully.'),
        ]);

        return to_route('admin.social-stories.index');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(
        array $data,
        ?SocialStory $story = null,
        ?FormRequest $request = null,
    ): array {
        if ($request) {
            $data['image'] = $this->resolveMediaField(
                $request->file('image_file'),
                $data['image'] ?? null,
                $story?->image,
                'social-stories',
            );
        }

        $data['video_url'] = ($data['type'] ?? '') === 'video' && filled($data['video_url'] ?? null)
            ? $data['video_url']
            : null;
        $data['link_url'] = filled($data['link_url'] ?? null) ? $data['link_url'] : null;
        $data['show_thumbnail_promo'] = $request?->boolean('show_thumbnail_promo') ?? false;

        foreach (['overlay_eyebrow', 'overlay_title', 'overlay_discount', 'overlay_note', 'overlay_hashtag'] as $field) {
            $data[$field] = filled($data[$field] ?? null) ? $data[$field] : null;
        }

        unset($data['image_file']);

        return $data;
    }
}
