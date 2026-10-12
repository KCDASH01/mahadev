<?php

namespace App\Services;

use App\Models\ShippingRule;
use App\Models\ShippingSetting;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class ShippingService
{
    private ?ShippingSetting $settings = null;

    /**
     * Resolve the shipping charge for a given cart subtotal using the
     * admin-managed dynamic shipping rules.
     *
     * A rule matches when:
     *   subtotal >= min_amount
     *   AND (max_amount IS NULL OR subtotal <= max_amount)
     */
    public function chargeForSubtotal(float $subtotal): float
    {
        if ($subtotal <= 0) {
            return 0.0;
        }

        $rule = ShippingRule::query()
            ->where('is_active', true)
            ->where('min_amount', '<=', $subtotal)
            ->where(function ($query) use ($subtotal) {
                $query->whereNull('max_amount')
                    ->orWhere('max_amount', '>=', $subtotal);
            })
            ->orderByDesc('min_amount')
            ->first();

        if (! $rule) {
            return 0.0;
        }

        return round((float) $rule->shipping_charge, 2);
    }

    public function settings(): ShippingSetting
    {
        return $this->settings ??= ShippingSetting::instance();
    }

    public function codEnabled(): bool
    {
        return (bool) $this->settings()->cod_enabled;
    }

    public function defaultDeliveryDays(): int
    {
        return max(0, (int) $this->settings()->default_delivery_days);
    }

    /**
     * Estimated delivery date = order date + default delivery days.
     */
    public function estimatedDeliveryDate(?CarbonInterface $from = null): Carbon
    {
        $base = $from ? Carbon::parse($from) : Carbon::now();

        return $base->copy()->addDays($this->defaultDeliveryDays())->startOfDay();
    }
}
