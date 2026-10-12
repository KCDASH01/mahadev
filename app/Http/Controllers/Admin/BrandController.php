<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBrandRequest;
use App\Http\Requests\Admin\UpdateBrandRequest;
use App\Models\Brand;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    use HandlesMediaUpload;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $brands = Brand::query()
            ->withCount('products')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/brands/index', [
            'brands' => $brands,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/brands/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBrandRequest $request): RedirectResponse
    {
        $data = $this->prepareData($request->validated(), null, $request);

        Brand::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand created successfully.')]);

        return to_route('admin.brands.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Brand $brand): Response
    {
        return Inertia::render('admin/brands/edit', [
            'brand' => $brand,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBrandRequest $request, Brand $brand): RedirectResponse
    {
        $brand->update($this->prepareData($request->validated(), $brand, $request));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand updated successfully.')]);

        return to_route('admin.brands.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Brand $brand): RedirectResponse
    {
        if ($brand->products()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Cannot delete a brand that has products.'),
            ]);

            return back();
        }

        $this->deleteStoredMedia($brand->logo);
        $brand->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand deleted successfully.')]);

        return to_route('admin.brands.index');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(
        array $data,
        ?Brand $brand = null,
        ?FormRequest $request = null,
    ): array {
        $data['slug'] = filled($data['slug'] ?? null)
            ? Str::slug($data['slug'])
            : Str::slug($data['name']);

        if ($brand && $data['slug'] !== $brand->slug) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $brand->id);
        } elseif (! $brand) {
            $data['slug'] = $this->uniqueSlug($data['slug']);
        }

        if ($request) {
            $data['logo'] = $this->resolveMediaField(
                $request->file('logo_file'),
                $data['logo'] ?? null,
                $brand?->logo,
                'brands',
            );
        }

        unset($data['logo_file']);

        return $data;
    }

    private function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (Brand::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
