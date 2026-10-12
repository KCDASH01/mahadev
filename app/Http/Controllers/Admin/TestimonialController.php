<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTestimonialRequest;
use App\Http\Requests\Admin\UpdateTestimonialRequest;
use App\Models\Testimonial;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    use HandlesMediaUpload;

    public function index(): Response
    {
        return Inertia::render('admin/testimonials/index', [
            'testimonials' => Testimonial::query()
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/testimonials/create');
    }

    public function store(StoreTestimonialRequest $request): RedirectResponse
    {
        Testimonial::create($this->prepareData($request->validated(), null, $request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Testimonial created successfully.'),
        ]);

        return to_route('admin.testimonials.index');
    }

    public function edit(Testimonial $testimonial): Response
    {
        return Inertia::render('admin/testimonials/edit', [
            'testimonial' => $testimonial,
        ]);
    }

    public function update(UpdateTestimonialRequest $request, Testimonial $testimonial): RedirectResponse
    {
        $testimonial->update($this->prepareData($request->validated(), $testimonial, $request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Testimonial updated successfully.'),
        ]);

        return to_route('admin.testimonials.index');
    }

    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        $this->deleteStoredMedia($testimonial->scene_image);
        $testimonial->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Testimonial deleted successfully.'),
        ]);

        return to_route('admin.testimonials.index');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(
        array $data,
        ?Testimonial $testimonial = null,
        ?FormRequest $request = null,
    ): array {
        if ($request) {
            $data['scene_image'] = $this->resolveMediaField(
                $request->file('scene_image_file'),
                $data['scene_image'] ?? null,
                $testimonial?->scene_image,
                'testimonials',
            );
        }

        unset($data['scene_image_file']);

        return $data;
    }
}
