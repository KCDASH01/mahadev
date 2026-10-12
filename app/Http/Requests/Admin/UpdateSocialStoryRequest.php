<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSocialStoryRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['image', 'video'])],
            'image' => ['nullable', 'string', 'max:2048'],
            'image_file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:8192'],
            'video_url' => ['nullable', 'string', 'max:2048', 'required_if:type,video'],
            'link_url' => ['nullable', 'string', 'max:2048'],
            'overlay_eyebrow' => ['nullable', 'string', 'max:255'],
            'overlay_title' => ['nullable', 'string', 'max:255'],
            'overlay_discount' => ['nullable', 'string', 'max:255'],
            'overlay_note' => ['nullable', 'string', 'max:1000'],
            'overlay_hashtag' => ['nullable', 'string', 'max:255'],
            'show_thumbnail_promo' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
