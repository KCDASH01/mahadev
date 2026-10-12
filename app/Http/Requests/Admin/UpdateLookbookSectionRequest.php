<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLookbookSectionRequest extends FormRequest
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
            'eyebrow' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:1000'],
            'cta_label' => ['required', 'string', 'max:255'],
            'cta_href' => ['required', 'string', 'max:2048'],
            'poster_image' => ['nullable', 'string', 'max:2048'],
            'poster_image_file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:8192'],
            'video_url' => ['nullable', 'string', 'max:2048'],
            'video_url_file' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm', 'max:51200'],
            'is_visible' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_visible' => filter_var($this->input('is_visible'), FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
