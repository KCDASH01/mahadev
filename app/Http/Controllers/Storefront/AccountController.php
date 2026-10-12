<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('account/index', [
            'user' => [
                'name' => $request->user()?->name,
                'email' => $request->user()?->email,
            ],
        ]);
    }

    public function profile(Request $request): Response
    {
        return Inertia::render('account/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function redirectFromLegacySettings(Request $request): RedirectResponse
    {
        if ($request->user()?->role === 'admin') {
            return redirect()->route('profile.edit');
        }

        return redirect()->route('account.profile');
    }
}
