<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreColorRequest;
use App\Http\Requests\Admin\UpdateColorRequest;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ColorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $colorAttribute = $this->colorAttribute();

        $colors = AttributeValue::query()
            ->where('attribute_id', $colorAttribute->id)
            ->withCount(['variants', 'products', 'productImages'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('value', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->orderBy('value')
            ->paginate(20)
            ->withQueryString()
            ->through(function (AttributeValue $color) {
                $meta = is_array($color->meta) ? $color->meta : [];
                $type = $meta['type'] ?? 'solid';

                return [
                    'id' => $color->id,
                    'value' => $color->value,
                    'slug' => $color->slug,
                    'type' => $type,
                    'hex' => $type === 'solid' ? ($meta['hex'] ?? null) : null,
                    'sort_order' => $color->sort_order,
                    'status' => $color->status,
                    'variants_count' => $color->variants_count,
                    'products_count' => $color->products_count,
                    'product_images_count' => $color->product_images_count,
                ];
            });

        return Inertia::render('admin/colors/index', [
            'colors' => $colors,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/colors/create');
    }

    public function store(StoreColorRequest $request): RedirectResponse
    {
        $colorAttribute = $this->colorAttribute();
        $data = $this->prepareData($request->validated(), $colorAttribute->id);

        AttributeValue::create($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Color created successfully.'),
        ]);

        return to_route('admin.colors.index');
    }

    public function quickStore(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'value' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', Rule::in(['solid', 'multicolor', 'pattern'])],
            'hex' => ['nullable', 'string', 'max:50'],
        ]);

        $type = $validated['type'] ?? 'solid';

        if ($type === 'solid' && empty($validated['hex'])) {
            return response()->json([
                'success' => false,
                'message' => __('HEX color is required for Solid colors.'),
                'errors' => ['hex' => [__('HEX color is required for Solid colors.')]],
            ], 422);
        }

        $colorAttribute = $this->colorAttribute();
        $data = $this->prepareData([
            'value' => $validated['value'],
            'type' => $type,
            'hex' => $type === 'solid' ? ($validated['hex'] ?? null) : null,
            'status' => 'active',
        ], $colorAttribute->id);

        $color = AttributeValue::create($data);
        $meta = is_array($color->meta) ? $color->meta : [];

        return response()->json([
            'success' => true,
            'color' => [
                'id' => $color->id,
                'attribute_id' => $colorAttribute->id,
                'value' => $color->value,
                'slug' => $color->slug,
                'type' => $meta['type'] ?? $type,
                'hex' => $type === 'solid' ? ($meta['hex'] ?? null) : null,
                'meta' => $color->meta,
                'attribute' => [
                    'id' => $colorAttribute->id,
                    'name' => $colorAttribute->name,
                    'slug' => 'color',
                    'input_type' => 'color',
                ],
            ],
        ]);
    }

    public function edit(AttributeValue $color): Response
    {
        $this->ensureColorAttribute($color);
        $meta = is_array($color->meta) ? $color->meta : [];
        $type = $meta['type'] ?? 'solid';

        return Inertia::render('admin/colors/edit', [
            'color' => [
                'id' => $color->id,
                'value' => $color->value,
                'slug' => $color->slug,
                'type' => $type,
                'hex' => $type === 'solid' ? ($meta['hex'] ?? '') : '',
                'sort_order' => $color->sort_order,
                'status' => $color->status,
            ],
        ]);
    }

    public function update(UpdateColorRequest $request, AttributeValue $color): RedirectResponse
    {
        $this->ensureColorAttribute($color);

        $color->update($this->prepareData($request->validated(), $color->attribute_id, $color));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Color updated successfully.'),
        ]);

        return to_route('admin.colors.index');
    }

    public function destroy(AttributeValue $color): RedirectResponse
    {
        $this->ensureColorAttribute($color);

        if ($color->variants()->exists() || $color->products()->exists() || $color->productImages()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Cannot delete a color that is used by products or variants.'),
            ]);

            return back();
        }

        $color->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Color deleted successfully.'),
        ]);

        return to_route('admin.colors.index');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(array $data, int $attributeId, ?AttributeValue $color = null): array
    {
        $slug = filled($data['slug'] ?? null)
            ? Str::slug((string) $data['slug'])
            : Str::slug((string) $data['value']);

        $slug = $this->uniqueSlug($slug, $attributeId, $color?->id);

        $type = $data['type'] ?? 'solid';
        $meta = ['type' => $type];

        if ($type === 'solid' && filled($data['hex'] ?? null)) {
            $meta['hex'] = trim((string) $data['hex']);
        }

        return [
            'attribute_id' => $attributeId,
            'value' => $data['value'],
            'slug' => $slug,
            'meta' => $meta,
            'sort_order' => isset($data['sort_order']) ? (int) $data['sort_order'] : 0,
            'status' => $data['status'] ?? 'active',
        ];
    }

    private function uniqueSlug(string $slug, int $attributeId, ?int $ignoreId = null): string
    {
        $originalSlug = $slug !== '' ? $slug : 'color';
        $slug = $originalSlug;
        $counter = 1;

        while (AttributeValue::query()
            ->where('attribute_id', $attributeId)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    private function colorAttribute(): Attribute
    {
        return Attribute::query()->firstOrCreate(
            ['slug' => 'color'],
            [
                'name' => 'Color',
                'input_type' => 'color',
                'sort_order' => 0,
                'status' => 'active',
            ],
        );
    }

    private function ensureColorAttribute(AttributeValue $color): void
    {
        abort_unless(
            $color->attribute?->slug === 'color'
                || Attribute::query()->whereKey($color->attribute_id)->where('slug', 'color')->exists(),
            404,
        );
    }
}
