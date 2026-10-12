<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreShippingRuleRequest;
use App\Http\Requests\Admin\UpdateShippingRuleRequest;
use App\Http\Requests\Admin\UpdateShippingSettingRequest;
use App\Models\ShippingRule;
use App\Models\ShippingSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShippingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/shipping/index', [
            'rules' => ShippingRule::query()
                ->orderBy('min_amount')
                ->get()
                ->map(fn (ShippingRule $rule) => [
                    'id' => $rule->id,
                    'min_amount' => (float) $rule->min_amount,
                    'max_amount' => $rule->max_amount === null ? null : (float) $rule->max_amount,
                    'shipping_charge' => (float) $rule->shipping_charge,
                    'is_active' => (bool) $rule->is_active,
                ])
                ->values(),
            'settings' => [
                'cod_enabled' => (bool) ShippingSetting::instance()->cod_enabled,
                'default_delivery_days' => (int) ShippingSetting::instance()->default_delivery_days,
            ],
        ]);
    }

    public function updateSettings(UpdateShippingSettingRequest $request): RedirectResponse
    {
        ShippingSetting::instance()->update($request->validated());

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('Shipping settings updated successfully.'),
        ]);
    }

    public function storeRule(StoreShippingRuleRequest $request): RedirectResponse
    {
        ShippingRule::query()->create($this->ruleData($request->validated()));

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('Shipping rule added successfully.'),
        ]);
    }

    public function updateRule(UpdateShippingRuleRequest $request, ShippingRule $shippingRule): RedirectResponse
    {
        $shippingRule->update($this->ruleData($request->validated()));

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('Shipping rule updated successfully.'),
        ]);
    }

    public function destroyRule(ShippingRule $shippingRule): RedirectResponse
    {
        $shippingRule->delete();

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('Shipping rule deleted successfully.'),
        ]);
    }

    public function toggleRule(ShippingRule $shippingRule): RedirectResponse
    {
        $shippingRule->update(['is_active' => ! $shippingRule->is_active]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('Shipping rule status updated.'),
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function ruleData(array $validated): array
    {
        $maxAmount = $validated['max_amount'] ?? null;

        return [
            'min_amount' => (float) $validated['min_amount'],
            'max_amount' => ($maxAmount === null || $maxAmount === '') ? null : (float) $maxAmount,
            'shipping_charge' => (float) $validated['shipping_charge'],
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ];
    }
}
