<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\ValidatesAdminImageUploads;
use App\Models\HomepagePopup;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHomepagePopupRequest extends FormRequest
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
            'image' => ['nullable', 'string', 'max:2048'],
            'image_file' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:20480'],
            'mobile_image' => ['nullable', 'string', 'max:2048'],
            'mobile_image_file' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:20480'],
            'link' => ['nullable', 'string', 'max:2048'],
            'is_visible' => ['required', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $this->addImageUploadFailureMessages($validator, ['image_file', 'mobile_image_file']);

        $validator->after(function (Validator $validator): void {
            $link = $this->input('link');

            if (filled($link) && ! $this->isValidPopupLink((string) $link)) {
                $validator->errors()->add(
                    'link',
                    __('Enter a full URL (https://…) or a site path starting with /.'),
                );
            }

            $popup = HomepagePopup::query()->first();
            $hasImage = $this->file('image_file')
                || filled($this->input('image'))
                || filled($popup?->image);

            if ($this->boolean('is_visible') && ! $hasImage) {
                $validator->errors()->add(
                    'image_file',
                    __('Upload an image before making the popup visible.'),
                );
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image_file.max' => __('The popup image must not be larger than 20 MB.'),
            'mobile_image_file.max' => __('The mobile popup image must not be larger than 20 MB.'),
        ];
    }

    protected function prepareForValidation(): void
    {
        $link = $this->input('link');

        $this->merge([
            'is_visible' => filter_var($this->input('is_visible'), FILTER_VALIDATE_BOOLEAN),
            'link' => filled($link) ? trim((string) $link) : null,
        ]);
    }

    private function isValidPopupLink(string $link): bool
    {
        if (str_starts_with($link, '/') && ! str_starts_with($link, '//')) {
            return true;
        }

        return filter_var($link, FILTER_VALIDATE_URL) !== false;
    }
}
