<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogRequest;
use App\Http\Requests\Admin\UpdateBlogRequest;
use App\Models\Blog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    use HandlesMediaUpload;

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/blogs/index', [
            'blogs' => Blog::query()
                ->latest('published_at')
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/blogs/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBlogRequest $request): RedirectResponse
    {
        Blog::create($this->prepareData($request->validated(), null, $request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Blog post created successfully.'),
        ]);

        return to_route('admin.blogs.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Blog $blog): Response
    {
        return Inertia::render('admin/blogs/edit', [
            'blog' => $blog,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBlogRequest $request, Blog $blog): RedirectResponse
    {
        $blog->update($this->prepareData($request->validated(), $blog, $request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Blog post updated successfully.'),
        ]);

        return to_route('admin.blogs.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Blog $blog): RedirectResponse
    {
        $this->deleteStoredMedia($blog->image);
        $blog->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Blog post deleted successfully.'),
        ]);

        return to_route('admin.blogs.index');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(
        array $data,
        ?Blog $blog = null,
        ?FormRequest $request = null,
    ): array {
        $data['slug'] = filled($data['slug'] ?? null)
            ? Str::slug($data['slug'])
            : Str::slug($data['title']);

        if ($blog && $data['slug'] !== $blog->slug) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $blog->id);
        } elseif (! $blog) {
            $data['slug'] = $this->uniqueSlug($data['slug']);
        }

        if ($request) {
            $data['image'] = $this->resolveMediaField(
                $request->file('image_file'),
                $data['image'] ?? null,
                $blog?->image,
                'blogs',
            );
        }

        unset($data['image_file']);

        if (blank($data['published_at'] ?? null)) {
            $data['published_at'] = $blog?->published_at ?? now();
        }

        return $data;
    }

    private function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (Blog::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
