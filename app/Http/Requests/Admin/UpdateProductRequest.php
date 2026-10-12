<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\ValidatesJewelleryProduct;
use App\Http\Requests\Admin\Concerns\ValidatesProductFilterAttributes;
use App\Http\Requests\Admin\Concerns\ValidatesProductVariants;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProductRequest extends FormRequest
{
    use ValidatesJewelleryProduct;
    use ValidatesProductFilterAttributes;
    use ValidatesProductVariants;
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('product');

        if ($this->isJewelleryRequest()) {
            return $this->jewelleryRules($product?->id);
        }

        return [
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($product),
            ],
            'sku' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'sku')->ignore($product),
            ],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'original_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'display_rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'display_review_count' => ['nullable', 'integer', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'thumbnail' => ['nullable', 'string', 'max:8192'],
            'thumbnail_file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:8192'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'offers' => ['nullable', 'array'],
            'offers.*.title' => ['required', 'string', 'max:255'],
            'offers.*.detail' => ['nullable', 'string', 'max:500'],
            'offers.*.code' => ['nullable', 'string', 'max:50'],
            'gallery' => ['nullable', 'array'],
            'gallery.*.id' => ['nullable', 'integer'],
            'gallery.*.image' => ['nullable', 'string', 'max:8192'],
            'gallery.*.file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:8192'],
            'gallery.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'variants' => ['nullable', 'array'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.option_value_ids' => ['nullable', 'array'],
            'variants.*.option_value_ids.*' => ['integer'],
            'variants.*.original_price' => ['required_with:variants.*.sku', 'numeric', 'min:0'],
            'variants.*.sale_price' => ['required_with:variants.*.sku', 'numeric', 'min:0'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0'],
            'variants.*.sku' => ['required_with:variants.*.original_price', 'string', 'max:255', 'distinct'],
            'variants.*.status' => ['nullable', Rule::in(['active', 'inactive'])],
            'variants.*.sync_images' => ['nullable', 'boolean'],
            'variants.*.images' => ['nullable', 'array'],
            'variants.*.images.*.id' => ['nullable', 'integer'],
            'variants.*.images.*.image' => ['nullable', 'string', 'max:8192'],
            'variants.*.images.*.file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:8192'],
            'variants.*.images.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'variants.*.images.*.color_value_id' => ['nullable', 'integer'],
            'gallery.*.color_value_id' => ['nullable', 'integer'],
            ...$this->filterAttributeRules(),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->isJewelleryRequest()) {
                $this->validateJewelleryCategory($validator);

                return;
            }

            $this->validateFilterAttributeValues($validator);
            $this->validateProductVariants($validator);
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->isJewelleryRequest() ? $this->jewelleryMessages() : [];
    }
}
