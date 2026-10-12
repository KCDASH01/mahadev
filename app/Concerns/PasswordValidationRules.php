<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;

trait PasswordValidationRules
{
    /**
     * Get the validation rules used to validate passwords.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function passwordRules(): array
    {
        return ['required', 'string', 'regex:/\S/', 'confirmed'];
    }

    /**
     * @return array<string, string>
     */
    protected function passwordValidationMessages(): array
    {
        return [
            'password.required' => 'Please enter a password.',
            'password.regex' => 'Password cannot be blank or contain only spaces.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }

    /**
     * Get the validation rules used to validate the current password.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function currentPasswordRules(): array
    {
        return ['required', 'string', 'current_password'];
    }
}
