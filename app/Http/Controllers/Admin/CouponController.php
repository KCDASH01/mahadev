<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCouponRequest;
use App\Http\Requests\Admin\UpdateCouponRequest;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $type = $request->string('type')->toString();

        $coupons = Coupon::query()
            ->withCount('usages')
            ->withSum('usages', 'discount_amount')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%");
                });
            })
            ->when(
                $type !== '' && in_array($type, [
                    Coupon::TYPE_FIXED,
                    Coupon::TYPE_PERCENTAGE,
                    Coupon::TYPE_FREE_SHIPPING,
                    Coupon::TYPE_BUY_X_GET_Y,
                    Coupon::TYPE_FIRST_ORDER,
                ], true),
                fn ($query) => $query->where('type', $type),
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/coupons/index', [
            'coupons' => $coupons,
            'filters' => [
                'search' => $search,
                'type' => $type,
            ],
            'couponTypes' => $this->formOptions()['couponTypes'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/coupons/create', [
            ...$this->formOptions(),
        ]);
    }

    public function store(StoreCouponRequest $request): RedirectResponse
    {
        $coupon = Coupon::create($this->prepareData($request->validated()));
        $this->syncRelations($coupon, $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Coupon created successfully.')]);

        return to_route('admin.coupons.index');
    }

    public function show(Coupon $coupon): Response
    {
        $coupon->load([
            'categories:id,name',
            'products:id,name',
            'usages' => fn ($query) => $query->with(['user:id,name,email', 'order:id,order_number'])
                ->latest('used_at')
                ->limit(100),
        ]);

        return Inertia::render('admin/coupons/show', [
            'coupon' => [
                ...$coupon->toArray(),
                'total_discount_given' => (float) $coupon->usages()->sum('discount_amount'),
                'usages' => $coupon->usages->map(fn ($usage) => [
                    'id' => $usage->id,
                    'discount_amount' => (float) $usage->discount_amount,
                    'used_at' => $usage->used_at?->toISOString(),
                    'user' => $usage->user ? [
                        'id' => $usage->user->id,
                        'name' => $usage->user->name,
                        'email' => $usage->user->email,
                    ] : null,
                    'order' => $usage->order ? [
                        'id' => $usage->order->id,
                        'order_number' => $usage->order->order_number,
                    ] : null,
                ])->values()->all(),
            ],
        ]);
    }

    public function edit(Coupon $coupon): Response
    {
        $coupon->load(['categories:id', 'products:id']);

        return Inertia::render('admin/coupons/edit', [
            'coupon' => [
                ...$coupon->toArray(),
                'category_ids' => $coupon->categories->pluck('id')->all(),
                'product_ids' => $coupon->products->pluck('id')->all(),
            ],
            ...$this->formOptions(),
        ]);
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): RedirectResponse
    {
        $coupon->update($this->prepareData($request->validated()));
        $this->syncRelations($coupon, $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Coupon updated successfully.')]);

        return to_route('admin.coupons.index');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->categories()->detach();
        $coupon->products()->detach();
        $coupon->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Coupon deleted successfully.')]);

        return to_route('admin.coupons.index');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(array $data): array
    {
        unset($data['category_ids'], $data['product_ids']);

        $data['code'] = strtoupper(trim((string) $data['code']));
        $data['first_order_only'] = (bool) ($data['first_order_only'] ?? false);

        if (($data['type'] ?? '') === Coupon::TYPE_FIRST_ORDER) {
            $data['first_order_only'] = true;
        }

        return $data;
    }

    private function syncRelations(Coupon $coupon, StoreCouponRequest $request): void
    {
        $coupon->categories()->sync($request->input('category_ids', []));
        $coupon->products()->sync($request->input('product_ids', []));
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'products' => Product::query()->orderBy('name')->limit(200)->get(['id', 'name']),
            'couponTypes' => [
                ['value' => Coupon::TYPE_FIXED, 'label' => 'Flat Discount'],
                ['value' => Coupon::TYPE_PERCENTAGE, 'label' => 'Percentage Discount'],
                ['value' => Coupon::TYPE_FREE_SHIPPING, 'label' => 'Free Shipping'],
                ['value' => Coupon::TYPE_BUY_X_GET_Y, 'label' => 'Buy X Get Y'],
                ['value' => Coupon::TYPE_FIRST_ORDER, 'label' => 'First Order Discount'],
            ],
        ];
    }
}
