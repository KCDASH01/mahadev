<?php

namespace App\Http\Responses;

use App\Services\StorefrontAuthRedirectService;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function __construct(
        private StorefrontAuthRedirectService $redirects,
    ) {}

    public function toResponse($request): RedirectResponse
    {
        return $this->redirects->afterAuthentication($request);
    }
}
