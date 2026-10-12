<?php

namespace App\Http\Requests\Admin;

use App\Models\Attribute;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreColorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        Attribute::query()->firstOrCreate(
            ['slug' => 'color'],
            [
                'name' => 'Color',
                'input_type' => 'color',
                'sort_order' => 0,
                'status' => 'active',
            ],
        );

        $type = $this->input('type') ?? 'solid';

        if ($type !== 'solid' || $this->input('hex') === '') {
            $this->merge(['hex' => null]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $attributeId = Attribute::query()->where('slug', 'color')->value('id');

        return [
            'value' => ['required', 'string', 'max:100'],
            'type' => ['required', Rule::in(['solid', 'multicolor', 'pattern'])],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('attribute_values', 'slug')->where(
                    fn ($query) => $query->where('attribute_id', $attributeId),
                ),
            ],
            'hex' => [
                Rule::requiredIf(fn () => $this->input('type') === 'solid'),
                'nullable',
                'string',
                'max:20',
                'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
            ],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'hex.required' => __('HEX color is required when color type is Solid.'),
            'hex.required_if' => __('HEX color is required when color type is Solid.'),
            'hex.regex' => __('Enter a valid hex color like #FF6A00.'),
            'type.required' => __('Color type is required.'),
            'type.in' => __('Color type must be Solid, Multicolor, or Pattern.'),
        ];
    }
}
