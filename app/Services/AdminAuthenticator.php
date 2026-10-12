<?php

namespace App\Services;

use App\Models\User;
use App\Support\IndianMobileNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

class AdminAuthenticator
{
    public function attempt(Request $request): ?User
    {
        $identifier = trim((string) $request->input('login', $request->input(Fortify::username())));

        if ($identifier === '' || ! is_string($request->input('password'))) {
            return null;
        }

        $admin = $this->findAdmin($identifier);

        if (! $admin || $admin->status !== 'active') {
            return null;
        }

        if (! Hash::check((string) $request->input('password'), (string) $admin->password)) {
            return null;
        }

        return $admin;
    }

    public function findAdmin(string $identifier): ?User
    {
        $query = User::query()->where('role', 'admin');

        if (str_contains($identifier, '@')) {
            return $query->whereRaw('LOWER(email) = ?', [mb_strtolower($identifier)])->first();
        }

        $digits = IndianMobileNumber::normalize($identifier);

        if ($digits) {
            $byPhone = (clone $query)
                ->whereIn('phone', IndianMobileNumber::storageVariants($digits))
                ->first();

            if ($byPhone) {
                return $byPhone;
            }
        }

        return $query->whereRaw('LOWER(email) = ?', [mb_strtolower($identifier)])->first();
    }
}
