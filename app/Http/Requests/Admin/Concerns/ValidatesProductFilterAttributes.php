<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Models\AttributeValue;
use App\Models\Category;
use Illuminate\Validation\Validator;

trait ValidatesProductFilterAttributes
{
    /**
     * @return array<string, mixed>
     */
    protected function filterAttributeRules(): array
    {
        return [
            'filter_attribute_value_ids' => ['nullable', 'array'],
            'filter_attribute_value_ids.*' => ['integer', 'exists:attribute_values,id'],
        ];
    }

    protected function validateFilterAttributeValues(Validator $validator): void
    {
        $categoryId = $this->input('category_id');

        if (! $categoryId) {
            return;
        }

        $allowedValueIds = $this->allowedFilterValueIdsForCategory((int) $categoryId);
        $selectedIds = collect($this->input('filter_attribute_value_ids', []))
            ->filter(fn ($id) => filled($id))
            ->map(fn ($id) => (int) $id)
            ->values();

        $attributeIds = AttributeValue::query()
            ->whereIn('id', $selectedIds)
            ->pluck('attribute_id', 'id');

        $usedAttributeIds = [];

        foreach ($selectedIds as $index => $valueId) {
            if (! $allowedValueIds->contains($valueId)) {
                $validator->errors()->add(
                    "filter_attribute_value_ids.{$index}",
                    __('The selected attribute value is not allowed for this category.'),
                );

                continue;
            }

            $attributeId = $attributeIds->get($valueId);

            if ($attributeId && in_array($attributeId, $usedAttributeIds, true)) {
                $validator->errors()->add(
                    "filter_attribute_value_ids.{$index}",
                    __('Only one value can be selected per attribute.'),
                );
            }

            if ($attributeId) {
                $usedAttributeIds[] = $attributeId;
            }
        }

        $requiredAttributeIds = Category::query()
            ->whereKey($categoryId)
            ->first()
            ?->attributes()
            ->where('attributes.status', 'active')
            ->wherePivot('is_filterable', true)
            ->wherePivot('is_variant_axis', false)
            ->wherePivot('is_required', true)
            ->pluck('attributes.id')
            ->all() ?? [];

        foreach ($requiredAttributeIds as $requiredAttributeId) {
            $hasValue = false;

            foreach ($selectedIds as $valueId) {
                if ((int) $attributeIds->get($valueId) === (int) $requiredAttributeId) {
                    $hasValue = true;
                    break;
                }
            }

            if (! $hasValue) {
                $validator->errors()->add(
                    'filter_attribute_value_ids',
                    __('Please select a value for each required product attribute.'),
                );
                break;
            }
        }
    }

    /**
     * @return \Illuminate\Support\Collection<int, int>
     */
    private function allowedFilterValueIdsForCategory(int $categoryId)
    {
        $category = Category::query()
            ->whereKey($categoryId)
            ->with([
                'attributes' => fn ($query) => $query
                    ->where('attributes.status', 'active')
                    ->wherePivot('is_filterable', true)
                    ->wherePivot('is_variant_axis', false)
                    ->with(['values' => fn ($values) => $values->where('status', 'active')]),
            ])
            ->first();

        if (! $category) {
            return collect();
        }

        return $category->attributes
            ->flatMap(fn ($attribute) => $attribute->values->pluck('id'))
            ->values();
    }
}
