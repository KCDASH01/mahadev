<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CustomerOtpAuthService;
use App\Services\StorefrontAuthRedirectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAuthController extends Controller
{
    public function create(Request $request, CustomerOtpAuthService $otp, StorefrontAuthRedirectService $redirects): Response
    {
        $redirect = $request->query('redirect');

        if (is_string($redirect)) {
            $redirects->rememberIntendedUrl($request, $redirect);
        }

        if ($request->boolean('restart')) {
            $otp->restart($request);
        }

        return Inertia::render('auth/login', $otp->viewState($request));
    }

    public function send(Request $request, CustomerOtpAuthService $otp): RedirectResponse
    {
        $otp->send($request);

        return redirect()->route('login');
    }

    public function verify(Request $request, CustomerOtpAuthService $otp): RedirectResponse
    {
        $result = $otp->verify($request);

        if ($result instanceof User) {
            return $otp->afterAuthentication($request);
        }

        return redirect()->route('login');
    }

    public function resend(Request $request, CustomerOtpAuthService $otp): RedirectResponse
    {
        $otp->send($request, resend: true);

        return redirect()->route('login');
    }

    public function register(Request $request, CustomerOtpAuthService $otp): RedirectResponse
    {
        $otp->completeProfile($request);

        return $otp->afterAuthentication($request);
    }
}
