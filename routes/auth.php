<?php

use App\Http\Controllers\Admin\Auth\LoginController as AdminLoginController;
use App\Http\Controllers\Storefront\CustomerAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [CustomerAuthController::class, 'create'])->name('login');
    Route::post('/login/otp/send', [CustomerAuthController::class, 'send'])->name('login.otp.send');
    Route::post('/login/otp/verify', [CustomerAuthController::class, 'verify'])->name('login.otp.verify');
    Route::post('/login/otp/resend', [CustomerAuthController::class, 'resend'])->name('login.otp.resend');
    Route::post('/login/register', [CustomerAuthController::class, 'register'])->name('login.register');
    Route::get('/register', function (Request $request) {
        return redirect()->route('login', $request->query());
    })->name('register');
});

// Admin login must stay reachable even when a customer session is active.
Route::get('/admin/login', [AdminLoginController::class, 'create'])->name('admin.login');
Route::post('/admin/login', [AdminLoginController::class, 'store'])
    ->middleware('throttle:login')
    ->name('admin.login.store');
