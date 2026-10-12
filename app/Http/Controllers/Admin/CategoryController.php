<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\StorefrontNavigationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    use HandlesMediaUpload;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $collection = $request->string('collection')->trim()->toString();

        $categories = Category::query()
            ->with('parent:id,name')
            ->withCount('products')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('nav_group', 'like', "%{$search}%");
                });
            })
            ->when($collection === 'top', fn ($query) => $query->whereNull('parent_id'))
            ->when(
                $collection !== '' && $collection !== 'top' && ctype_digit($collection),
                fn ($query) => $query->where('parent_id', (int) $collection),
            )
            ->orderBy('gender')
            ->orderBy('parent_id')
            ->orderBy('sort_order')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $collections = Category::query()
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'collections' => $collections,
            'filters' => [
                'search' => $search,
                'collection' => $collection,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/categories/create', $this->formOptions());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $this->prepareData($request->validated(), null, $request);

        Category::create($data);

        StorefrontNavigationService::flushCache();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created successfully.')]);

        return to_route('admin.categories.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            ...$this->formOptions(),
            'category' => $category->load('parent:id,name,gender'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($this->prepareData($request->validated(), $category, $request));

        StorefrontNavigationService::flushCache();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated successfully.')]);

        return to_route('admin.categories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Cannot delete a category that has products.'),
            ]);

            return back();
        }

        $this->deleteStoredMedia($category->image);
        $category->delete();

        StorefrontNavigationService::flushCache();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted successfully.')]);

        return to_route('admin.categories.index');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(
        array $data,
        ?Category $category = null,
        ?FormRequest $request = null,
    ): array {
        $data['slug'] = filled($data['slug'] ?? null)
            ? Str::slug($data['slug'])
            : Str::slug($data['name']);

        if ($category && $data['slug'] !== $category->slug) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $category->id);
        } elseif (! $category) {
            $data['slug'] = $this->uniqueSlug($data['slug']);
        }

        if ($request) {
            $data['image'] = $this->resolveMediaField(
                $request->file('image_file'),
                $data['image'] ?? null,
                $category?->image,
                'categories',
            );
        }

        $data['parent_id'] = filled($data['parent_id'] ?? null) ? (int) $data['parent_id'] : null;
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);
        $data['nav_group'] = filled($data['nav_group'] ?? null) ? $data['nav_group'] : null;
        $data['gender'] = $this->resolveGender(
            $data['parent_id'],
            $data['slug'],
            $data['name'],
            $category?->gender,
        );
        $data['is_featured'] = filled($data['parent_id'] ?? null) && ($data['is_featured'] ?? false);

        unset($data['image_file']);

        return $data;
    }

    private function resolveGender(
        ?int $parentId,
        string $slug,
        string $name,
        ?string $fallback = null,
    ): ?string {
        if ($parentId) {
            return Category::query()->whereKey($parentId)->value('gender');
        }

        $candidates = [strtolower($slug), strtolower($name)];

        foreach ($candidates as $value) {
            if (in_array($value, ['gents', 'ladies', 'furniture'], true)) {
                return $value;
            }

            if (in_array($value, ['jewellery', 'jewelry'], true)) {
                return 'unisex';
            }
        }

        return $fallback;
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'parentCategories' => Category::query()
                ->whereNull('parent_id')
                ->whereIn('slug', ['gents', 'ladies', 'furniture'])
                ->where('status', 'active')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'gender']),
        ];
    }

    private function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (Category::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
