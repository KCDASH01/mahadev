<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\ValidatesAdminImageUploads;
use App\Http\Requests\Admin\Concerns\ValidatesHeroBannerMedia;
use App\Models\Banner;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBannerRequest extends FormRequest
{
    use ValidatesAdminImageUploads;
    use ValidatesHeroBannerMedia;

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
            'accent_line' => ['nullable', 'string', 'max:255'],
            'main_line' => ['nullable', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:500'],
            'promo_text' => ['nullable', 'string', 'max:255'],
            ...$this->heroBannerMediaRules(),
            'image_position' => ['nullable', 'string', 'max:100'],
            'link' => ['nullable', 'string', 'max:2048'],
            'cta_label' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $this->addHeroBannerMediaValidation($validator);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->heroBannerMediaMessages();
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'media_type' => $this->input('media_type', Banner::MEDIA_TYPE_IMAGE),
            'accent_line' => $this->blankToNull('accent_line'),
            'main_line' => $this->blankToNull('main_line'),
            'tagline' => $this->blankToNull('tagline'),
            'promo_text' => $this->blankToNull('promo_text'),
            'cta_label' => $this->blankToNull('cta_label'),
            'link' => $this->blankToNull('link'),
        ]);
    }

    private function blankToNull(string $key): ?string
    {
        $value = $this->input($key);

        return filled($value) ? trim((string) $value) : null;
    }
}
