<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SyncsProductRelations;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    use SyncsProductRelations;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $categoryId = $request->integer('category_id');
        $status = $request->string('status')->trim()->toString();

        $products = Product::query()
            ->when(
                $this->isJewelleryAdmin(),
                fn ($query) => $query->jewellery(),
                fn ($query) => $query->clothing(),
            )
            ->with(['category:id,name', 'brand:id,name'])
            ->withCount(['variants', 'images'])
            ->withSum('variants', 'stock')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($categoryId > 0, fn ($query) => $query->where('category_id', $categoryId))
            ->when(
                $this->isJewelleryAdmin() && in_array($status, ['active', 'inactive'], true),
                fn ($query) => $query->where('status', $status),
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render($this->inertiaPage('index'), [
            'products' => $products,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId > 0 ? (string) $categoryId : '',
                'status' => in_array($status, ['active', 'inactive'], true) ? $status : '',
            ],
            'categories' => $this->selectableCategories()->get(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render($this->inertiaPage('create'), $this->formOptions());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        return $this->persistProduct($request);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): Response
    {
        $this->ensureProductType($product);

        $product->load([
            'category:id,name',
            'brand:id,name',
            'images' => fn ($query) => $query->orderBy('sort_order'),
            'variants.optionValues.attribute:id,name,slug',
        ])->loadSum('variants', 'stock');

        return Inertia::render($this->inertiaPage('show'), [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product): Response
    {
        $this->ensureProductType($product);

        $product->load([
            'images' => fn ($query) => $query->orderBy('sort_order'),
            'variants.optionValues.attribute:id,name,slug',
            'attributeValues.attribute:id,name,slug,input_type',
        ]);

        return Inertia::render($this->inertiaPage('edit'), [
            ...$this->formOptions(),
            'product' => $product,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->ensureProductType($product);

        return $this->persistProduct($request, $product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $this->ensureProductType($product);

        $product->load('images');

        $this->deleteStoredMedia($product->thumbnail);

        $product->images->each(function ($image): void {
            $this->deleteStoredMedia($image->image);
        });

        $product->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $this->isJewelleryAdmin()
                ? __('Jewellery deleted successfully.')
                : __('Product deleted successfully.'),
        ]);

        return to_route($this->indexRouteName());
    }

    protected function persistProduct(FormRequest $request, ?Product $product = null): RedirectResponse
    {
        return DB::transaction(function () use ($request, $product): RedirectResponse {
            $isNew = $product === null;
            $data = $this->prepareProductData($request->validated(), $product, $request);

            if ($product) {
                $product->update($data);
            } else {
                $product = Product::create($data);
            }

            $this->syncGalleryImages($product, $request->input('gallery', []), $request);

            if (! $this->isJewelleryAdmin()) {
                $this->syncVariants($product, $request->input('variants', []), $request);
                $this->syncFilterAttributeValues($product, $request->input('filter_attribute_value_ids', []));
            }

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => $isNew
                    ? ($this->isJewelleryAdmin()
                        ? __('Jewellery created successfully.')
                        : __('Product created successfully.'))
                    : ($this->isJewelleryAdmin()
                        ? __('Jewellery updated successfully.')
                        : __('Product updated successfully.')),
            ]);

            return to_route($this->indexRouteName());
        });
    }

    protected function productType(): string
    {
        return Product::TYPE_CLOTHING;
    }

    protected function isJewelleryAdmin(): bool
    {
        return $this->productType() === Product::TYPE_JEWELLERY;
    }

    protected function indexRouteName(): string
    {
        return $this->isJewelleryAdmin() ? 'admin.jewellery.index' : 'admin.products.index';
    }

    protected function inertiaPage(string $page): string
    {
        return $this->isJewelleryAdmin()
            ? "admin/jewellery/{$page}"
            : "admin/products/{$page}";
    }

    protected function ensureProductType(Product $product): void
    {
        $matches = $this->isJewelleryAdmin()
            ? $product->isJewellery()
            : $product->isClothing();

        abort_unless($matches, 404);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder<Category>
     */
    protected function selectableCategories()
    {
        $query = Category::query()->where('status', 'active');

        if ($this->isJewelleryAdmin()) {
            return $query->jewelleryLeaves()->with('parent:id,name')->orderBy('name');
        }

        return $query
            ->clothingLeaves()
            ->with('parent:id,name')
            ->orderBy('name');
    }

    /**
     * @return array<string, mixed>
     */
    protected function formOptions(): array
    {
        return [
            'categories' => $this->selectableCategories()
                ->get(['id', 'name', 'parent_id'])
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->parent
                        ? "{$category->parent->name} › {$category->name}"
                        : $category->name,
                ])
                ->values(),
            'brands' => Brand::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name']),
            'attributeValues' => $this->isJewelleryAdmin()
                ? []
                : AttributeValue::query()
                    ->with('attribute:id,name,slug')
                    ->where('status', 'active')
                    ->orderBy('sort_order')
                    ->orderBy('value')
                    ->get(['id', 'attribute_id', 'value', 'slug', 'meta']),
            'categoryFilterAttributes' => $this->isJewelleryAdmin()
                ? []
                : $this->categoryFilterAttributesMap(),
        ];
    }

    /**
     * @return array<int, array<int, array<string, mixed>>>
     */
    protected function categoryFilterAttributesMap(): array
    {
        $categories = Category::query()
            ->where('status', 'active')
            ->where('slug', '!=', 'jewellery')
            ->whereDoesntHave('parent', function ($parent): void {
                $parent->where('slug', 'jewellery');
            })
            ->with([
                'attributes' => function ($query): void {
                    $query->where('attributes.status', 'active')
                        ->wherePivot('is_filterable', true)
                        ->wherePivot('is_variant_axis', false)
                        ->orderByPivot('sort_order')
                        ->with([
                            'values' => function ($values): void {
                                $values->where('status', 'active')->orderBy('sort_order');
                            },
                        ]);
                },
            ])
            ->get();

        return $categories
            ->mapWithKeys(function (Category $category): array {
                return [
                    $category->id => $category->attributes
                        ->map(function ($attribute): array {
                            return [
                                'attributeId' => $attribute->id,
                                'name' => $attribute->name,
                                'slug' => $attribute->slug,
                                'inputType' => $attribute->input_type,
                                'isRequired' => (bool) $attribute->pivot->is_required,
                                'values' => $attribute->values
                                    ->map(fn (AttributeValue $value): array => [
                                        'id' => $value->id,
                                        'attribute_id' => $value->attribute_id,
                                        'value' => $value->value,
                                        'slug' => $value->slug,
                                        'meta' => $value->meta,
                                    ])
                                    ->values()
                                    ->all(),
                            ];
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->all();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function prepareProductData(
        array $data,
        ?Product $product = null,
        ?FormRequest $request = null,
    ): array {
        $data['slug'] = filled($data['slug'] ?? null)
            ? Str::slug($data['slug'])
            : Str::slug($data['name']);

        $data['slug'] = $product
            ? $this->uniqueProductSlug($data['slug'], $product->id)
            : $this->uniqueProductSlug($data['slug']);

        $data['sku'] = $product
            ? $this->uniqueProductSku($data['sku'], $product->id)
            : $this->uniqueProductSku($data['sku']);

        $data['product_type'] = $this->productType();
        $data['stock'] = $this->isJewelleryAdmin() || ! $this->hasVariantRows($request)
            ? ($data['stock'] ?? 0)
            : 0;
        $data['display_rating'] = isset($data['display_rating'])
            ? round((float) $data['display_rating'], 2)
            : 0;
        $data['display_review_count'] = isset($data['display_review_count'])
            ? max(0, (int) $data['display_review_count'])
            : 0;
        $data['is_featured'] = $request?->boolean('is_featured') ?? false;
        $data['brand_id'] = filled($data['brand_id'] ?? null) ? $data['brand_id'] : null;

        if ($this->isJewelleryAdmin()) {
            $data['details'] = $this->jewelleryDetailsFrom($data['details'] ?? []);
            $data['care_instructions'] = filled($data['care_instructions'] ?? null)
                ? (string) $data['care_instructions']
                : null;
        }

        if ($request) {
            $data['thumbnail'] = $this->resolveMediaField(
                $request->file('thumbnail_file'),
                $data['thumbnail'] ?? null,
                $product?->thumbnail,
                'products/thumbnails',
            );
        }

        unset(
            $data['thumbnail_file'],
            $data['gallery'],
            $data['variants'],
            $data['filter_attribute_value_ids'],
        );

        $data['offers'] = collect($request?->input('offers', []) ?? [])
            ->filter(fn ($offer) => is_array($offer) && filled($offer['title'] ?? null))
            ->map(fn (array $offer): array => [
                'title' => (string) $offer['title'],
                'detail' => (string) ($offer['detail'] ?? ''),
                'code' => (string) ($offer['code'] ?? ''),
            ])
            ->values()
            ->all();

        return $data;
    }

    /**
     * @param  mixed  $details
     * @return array<string, string>
     */
    protected function jewelleryDetailsFrom(mixed $details): array
    {
        if (! is_array($details)) {
            return [];
        }

        $keys = ['material', 'metal', 'finish', 'color', 'stone', 'occasion', 'care', 'weight'];
        $clean = [];

        foreach ($keys as $key) {
            $value = trim((string) ($details[$key] ?? ''));

            if ($value !== '') {
                $clean[$key] = $value;
            }
        }

        return $clean;
    }

    protected function hasVariantRows(?FormRequest $request): bool
    {
        if (! $request || $this->isJewelleryAdmin()) {
            return false;
        }

        foreach ($request->input('variants', []) as $variant) {
            if (filled($variant['sku'] ?? null)) {
                return true;
            }
        }

        return false;
    }
}
