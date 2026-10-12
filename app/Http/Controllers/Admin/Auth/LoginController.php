<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Requests\LoginRequest;

class LoginController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()?->isAdmin()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/admin-login', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()?->isAdmin()) {
            return redirect()->route('dashboard');
        }

        $request->validate([
            'login' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $request->merge([
            'email' => $request->input('login'),
        ]);

        // Drop any storefront intended URL left by a customer session.
        $request->session()->forget('url.intended');

        $loginRequest = LoginRequest::createFrom($request);
        $loginRequest->setContainer(app())->setRedirector(app('redirect'));
        $loginRequest->validateResolved();

        return app(AuthenticatedSessionController::class)->store($loginRequest);
    }
}
