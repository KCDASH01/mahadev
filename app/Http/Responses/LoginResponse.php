<?php

namespace App\Http\Responses;

use App\Services\StorefrontAuthRedirectService;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function __construct(
        private StorefrontAuthRedirectService $redirects,
    ) {}

    public function toResponse($request): RedirectResponse
    {
        if ($request->user()?->isAdmin()) {
            // Always go to the admin dashboard. Do not reuse a leftover
            // customer url.intended (e.g. homepage) from an earlier session.
            $request->session()->forget('url.intended');

            return redirect()->route('dashboard');
        }

        return $this->redirects->afterAuthentication($request);
    }
}
