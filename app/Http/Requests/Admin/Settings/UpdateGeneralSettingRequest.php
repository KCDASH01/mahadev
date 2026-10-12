<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGeneralSettingRequest extends FormRequest
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
        return [
            'site_name' => ['required', 'string', 'max:255'],
            'site_email' => ['required', 'email', 'max:255'],
            'site_phone' => ['required', 'string', 'max:20'],
            'site_address' => ['nullable', 'string'],
            'logo' => ['nullable', 'string', 'max:2048'],
            'logo_file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:8192'],
            'favicon' => ['nullable', 'string', 'max:2048'],
            'favicon_file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp,ico', 'max:1024'],
            'whatsapp_number' => ['nullable', 'string', 'max:20'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'support_phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}
