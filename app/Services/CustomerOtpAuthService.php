<?php

namespace App\Services;

use App\Models\User;
use App\Support\IndianMobileNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class CustomerOtpAuthService
{
    private const SESSION_PHONE = 'customer_otp.phone';
    private const SESSION_VERIFIED = 'customer_otp.verified';

    public function __construct(
        private TwoFactorService $twoFactor,
        private StorefrontAuthRedirectService $redirects,
    ) {}

    /**
     * @return array{step: string, masked_phone: string|null, resend_available_in: int, redirect: string|null, status: mixed}
     */
    public function viewState(Request $request): array
    {
        $phone = $this->sessionPhone($request);
        $challenge = $phone ? $this->challenge($phone) : null;
        $verified = $request->session()->get(self::SESSION_VERIFIED) === $phone && $phone;

        $step = 'mobile';
        if ($verified) {
            $step = 'register';
        } elseif ($phone && $challenge) {
            $step = 'otp';
        }

        return [
            'step' => $step,
            'masked_phone' => $phone ? IndianMobileNumber::mask($phone) : null,
            'resend_available_in' => $this->resendAvailableIn($challenge),
            'redirect' => $request->query('redirect'),
            'status' => $request->session()->get('status'),
        ];
    }

    public function send(Request $request, bool $resend = false): void
    {
        $phone = $this->validatedPhone($request, $resend);

        $this->assertSendable($request, $phone, $resend);

        if ($this->findAdminByPhone($phone)) {
            throw ValidationException::withMessages([
                'phone' => __('We couldn\'t send the OTP. Please try again.'),
            ]);
        }

        $existing = $this->findCustomerByPhone($phone);
        if ($existing && $existing->status !== 'active') {
            throw ValidationException::withMessages([
                'phone' => __('We couldn\'t send the OTP. Please try again.'),
            ]);
        }

        try {
            $sessionId = $this->twoFactor->sendOtp(IndianMobileNumber::toMsisdn($phone));
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages([
                'phone' => $exception->getMessage(),
            ]);
        }

        $previous = $this->challenge($phone);

        Cache::put($this->challengeKey($phone), [
            'session_id' => $sessionId,
            'attempts' => 0,
            'sent_at' => now()->getTimestamp(),
            'resends' => $resend ? ((int) ($previous['resends'] ?? 0) + 1) : 0,
            'expires_at' => now()->addSeconds($this->otpTtl())->getTimestamp(),
        ], now()->addSeconds($this->otpTtl() + 60));

        $request->session()->put(self::SESSION_PHONE, $phone);
        $request->session()->forget(self::SESSION_VERIFIED);

        $this->hitSendLimiters($request, $phone);
    }

    public function verify(Request $request): User|string
    {
        $phone = $this->sessionPhone($request);
        $otp = preg_replace('/\D+/', '', (string) $request->input('otp')) ?? '';

        if (! $phone) {
            throw ValidationException::withMessages([
                'otp' => __('OTP has expired. Please request a new OTP.'),
            ]);
        }

        if (! preg_match('/^\d{6}$/', $otp)) {
            throw ValidationException::withMessages([
                'otp' => __('Incorrect OTP. Please try again.'),
            ]);
        }

        $this->assertVerifyNotLocked($request, $phone);

        $challenge = $this->challenge($phone);

        if (! $challenge || empty($challenge['session_id'])) {
            throw ValidationException::withMessages([
                'otp' => __('OTP has expired. Please request a new OTP.'),
            ]);
        }

        if (now()->getTimestamp() > (int) ($challenge['expires_at'] ?? 0)) {
            $this->forgetChallenge($phone);
            throw ValidationException::withMessages([
                'otp' => __('OTP has expired. Please request a new OTP.'),
            ]);
        }

        if ((int) ($challenge['attempts'] ?? 0) >= $this->maxVerifyAttempts()) {
            $this->lockVerification($request, $phone);
            throw ValidationException::withMessages([
                'otp' => __('Too many attempts. Please try again later.'),
            ]);
        }

        $this->incrementVerifyAttempts($phone, $challenge);

        try {
            $matched = $this->twoFactor->verifyOtp((string) $challenge['session_id'], $otp);
        } catch (RuntimeException $exception) {
            $message = $exception->getMessage();

            if (str_contains(strtolower($message), 'expired')) {
                $this->forgetChallenge($phone);
            }

            throw ValidationException::withMessages([
                'otp' => $message,
            ]);
        }

        if (! $matched) {
            throw ValidationException::withMessages([
                'otp' => __('Incorrect OTP. Please try again.'),
            ]);
        }

        $this->forgetChallenge($phone);
        RateLimiter::clear($this->verifyPhoneKey($phone));
        RateLimiter::clear($this->verifyIpKey($request));

        $customer = $this->findCustomerByPhone($phone);

        if ($customer) {
            if ($customer->isAdmin() || $customer->status !== 'active') {
                throw ValidationException::withMessages([
                    'otp' => __('We couldn\'t verify the OTP. Please try again.'),
                ]);
            }

            $request->session()->forget([self::SESSION_PHONE, self::SESSION_VERIFIED]);
            Auth::login($customer, remember: true);
            $request->session()->regenerate();

            return $customer;
        }

        $request->session()->put(self::SESSION_VERIFIED, $phone);

        return 'register';
    }

    public function completeProfile(Request $request): User
    {
        $phone = $this->sessionPhone($request);

        if (! $phone || $request->session()->get(self::SESSION_VERIFIED) !== $phone) {
            throw ValidationException::withMessages([
                'name' => __('OTP has expired. Please request a new OTP.'),
            ]);
        }

        if ($this->findAdminByPhone($phone) || $this->findCustomerByPhone($phone)) {
            throw ValidationException::withMessages([
                'phone' => __('We couldn\'t create your account. Please try again.'),
            ]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => null,
            'phone' => $phone,
            'password' => Str::password(32),
            'role' => 'customer',
            'status' => 'active',
        ]);

        $request->session()->forget([self::SESSION_PHONE, self::SESSION_VERIFIED]);
        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return $user;
    }

    public function restart(Request $request): void
    {
        $phone = $this->sessionPhone($request);

        if ($phone) {
            $this->forgetChallenge($phone);
        }

        $request->session()->forget([self::SESSION_PHONE, self::SESSION_VERIFIED]);
    }

    public function afterAuthentication(Request $request)
    {
        return $this->redirects->afterAuthentication($request);
    }

    private function validatedPhone(Request $request, bool $resend): string
    {
        if ($resend) {
            $phone = $this->sessionPhone($request);

            if (! $phone) {
                throw ValidationException::withMessages([
                    'phone' => __('OTP has expired. Please request a new OTP.'),
                ]);
            }

            return $phone;
        }

        $phone = IndianMobileNumber::normalize($request->input('phone'));

        if (! $phone) {
            throw ValidationException::withMessages([
                'phone' => __('Please enter a valid mobile number.'),
            ]);
        }

        return $phone;
    }

    private function assertSendable(Request $request, string $phone, bool $resend): void
    {
        if (RateLimiter::tooManyAttempts($this->sendPhoneKey($phone), $this->sendPerPhone())
            || RateLimiter::tooManyAttempts($this->sendIpKey($request), $this->sendPerIp())) {
            throw ValidationException::withMessages([
                'phone' => __('Too many attempts. Please try again later.'),
            ]);
        }

        $challenge = $this->challenge($phone);

        if (! $challenge) {
            return;
        }

        $wait = $this->resendAvailableIn($challenge);

        if ($wait > 0) {
            throw ValidationException::withMessages([
                'phone' => __('Too many attempts. Please try again later.'),
            ]);
        }

        if ($resend && (int) ($challenge['resends'] ?? 0) >= $this->maxResends()) {
            throw ValidationException::withMessages([
                'phone' => __('Too many attempts. Please try again later.'),
            ]);
        }
    }

    private function assertVerifyNotLocked(Request $request, string $phone): void
    {
        if (RateLimiter::tooManyAttempts($this->verifyPhoneKey($phone), $this->maxVerifyAttempts())
            || RateLimiter::tooManyAttempts($this->verifyIpKey($request), 20)) {
            throw ValidationException::withMessages([
                'otp' => __('Too many attempts. Please try again later.'),
            ]);
        }

        RateLimiter::hit($this->verifyIpKey($request), 3600);
    }

    /**
     * @param  array<string, mixed>  $challenge
     */
    private function incrementVerifyAttempts(string $phone, array $challenge): void
    {
        $attempts = (int) ($challenge['attempts'] ?? 0) + 1;
        $challenge['attempts'] = $attempts;

        Cache::put($this->challengeKey($phone), $challenge, now()->addSeconds($this->otpTtl() + 60));
        RateLimiter::hit($this->verifyPhoneKey($phone), 900);

        if ($attempts >= $this->maxVerifyAttempts()) {
            $this->forgetChallenge($phone);
        }
    }

    private function lockVerification(Request $request, string $phone): void
    {
        $this->forgetChallenge($phone);
        RateLimiter::hit($this->verifyPhoneKey($phone), 900);
        RateLimiter::hit($this->verifyIpKey($request), 3600);
    }

    private function hitSendLimiters(Request $request, string $phone): void
    {
        RateLimiter::hit($this->sendPhoneKey($phone), 3600);
        RateLimiter::hit($this->sendIpKey($request), 3600);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function challenge(string $phone): ?array
    {
        $challenge = Cache::get($this->challengeKey($phone));

        return is_array($challenge) ? $challenge : null;
    }

    private function forgetChallenge(string $phone): void
    {
        Cache::forget($this->challengeKey($phone));
    }

    /**
     * @param  array<string, mixed>|null  $challenge
     */
    private function resendAvailableIn(?array $challenge): int
    {
        if (! $challenge || empty($challenge['sent_at'])) {
            return 0;
        }

        $availableAt = (int) $challenge['sent_at'] + $this->resendCooldown();

        return max(0, $availableAt - now()->getTimestamp());
    }

    private function sessionPhone(Request $request): ?string
    {
        $phone = $request->session()->get(self::SESSION_PHONE);

        return is_string($phone) ? $phone : null;
    }

    public function findCustomerByPhone(string $phone): ?User
    {
        return User::query()
            ->where('role', 'customer')
            ->whereIn('phone', IndianMobileNumber::storageVariants($phone))
            ->first();
    }

    private function findAdminByPhone(string $phone): ?User
    {
        return User::query()
            ->where('role', 'admin')
            ->whereIn('phone', IndianMobileNumber::storageVariants($phone))
            ->first();
    }

    private function challengeKey(string $phone): string
    {
        return 'customer-otp:challenge:'.$phone;
    }

    private function sendPhoneKey(string $phone): string
    {
        return 'customer-otp:send-phone:'.$phone;
    }

    private function sendIpKey(Request $request): string
    {
        return 'customer-otp:send-ip:'.$request->ip();
    }

    private function verifyPhoneKey(string $phone): string
    {
        return 'customer-otp:verify-phone:'.$phone;
    }

    private function verifyIpKey(Request $request): string
    {
        return 'customer-otp:verify-ip:'.$request->ip();
    }

    private function otpTtl(): int
    {
        return (int) config('customer_auth.otp_ttl', 300);
    }

    private function resendCooldown(): int
    {
        return (int) config('customer_auth.resend_cooldown', 60);
    }

    private function maxVerifyAttempts(): int
    {
        return (int) config('customer_auth.max_verify_attempts', 5);
    }

    private function maxResends(): int
    {
        return (int) config('customer_auth.max_resends', 5);
    }

    private function sendPerPhone(): int
    {
        return (int) config('customer_auth.send_per_phone_per_hour', 5);
    }

    private function sendPerIp(): int
    {
        return (int) config('customer_auth.send_per_ip_per_hour', 10);
    }
}
