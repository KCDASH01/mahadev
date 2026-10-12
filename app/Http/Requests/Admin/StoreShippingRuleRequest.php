<?php

namespace App\Http\Requests\Admin;

use App\Models\ShippingRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreShippingRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'min_amount' => ['required', 'numeric', 'min:0'],
            'max_amount' => ['nullable', 'numeric', 'min:0', 'gt:min_amount'],
            'shipping_charge' => ['required', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if ($this->rangeOverlaps()) {
                $validator->errors()->add(
                    'min_amount',
                    __('This amount range overlaps an existing shipping rule.'),
                );
            }
        });
    }

    protected function rangeOverlaps(): bool
    {
        $min = (float) $this->input('min_amount');
        $max = $this->input('max_amount');
        $max = ($max === null || $max === '') ? null : (float) $max;

        $excludeId = $this->editingRuleId();

        return ShippingRule::query()
            ->when($excludeId, fn ($query) => $query->whereKeyNot($excludeId))
            ->get()
            ->contains(function (ShippingRule $rule) use ($min, $max): bool {
                $existingMin = (float) $rule->min_amount;
                $existingMax = $rule->max_amount === null ? null : (float) $rule->max_amount;

                // Two ranges [aMin, aMax] and [bMin, bMax] overlap when
                // aMin <= bMax AND bMin <= aMax (null max = +infinity).
                $aMax = $max ?? INF;
                $bMax = $existingMax ?? INF;

                return $min <= $bMax && $existingMin <= $aMax;
            });
    }

    protected function editingRuleId(): ?int
    {
        $rule = $this->route('shippingRule');

        if ($rule instanceof ShippingRule) {
            return $rule->getKey();
        }

        return is_numeric($rule) ? (int) $rule : null;
    }
}
