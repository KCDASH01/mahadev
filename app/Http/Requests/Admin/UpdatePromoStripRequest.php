<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\ValidatesAdminImageUploads;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePromoStripRequest extends FormRequest
{
    use ValidatesAdminImageUploads;

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
            'image_file' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:20480'],
            'mobile_image_file' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:20480'],
            'is_visible' => ['required', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $this->addImageUploadFailureMessages($validator, ['image_file', 'mobile_image_file']);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image_file.max' => __('The promo strip image must not be larger than 20 MB.'),
            'mobile_image_file.max' => __('The mobile promo strip image must not be larger than 20 MB.'),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_visible' => filter_var($this->input('is_visible'), FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
