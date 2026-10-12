<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateThemeSettingRequest extends FormRequest
{
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
        $hexRule = ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6})$/'];

        return [
            'primary_color' => $hexRule,
            'secondary_color' => $hexRule,
            'button_color' => $hexRule,
            'header_color' => $hexRule,
            'footer_color' => $hexRule,
        ];
    }
}
