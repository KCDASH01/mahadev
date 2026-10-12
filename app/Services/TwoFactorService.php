<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class TwoFactorService
{
    public function sendOtp(string $mobileDigits): string
    {
        $apiKey = $this->apiKey();
        $msisdn = preg_replace('/\D+/', '', $mobileDigits) ?? '';

        // Always use the SMS OTP endpoint — never VOICE.
        // AUTOGEN is the only valid 2Factor SMS OTP auto-generate endpoint.
        $url = $this->baseUrl($apiKey).'/SMS/'.$msisdn.'/AUTOGEN';

        $template = config('services.twofactor.template');
        if (is_string($template) && trim($template) !== '') {
            $url .= '/'.rawurlencode(trim($template));
        }

        $payload = $this->request('send', $url);
        $sessionId = $payload['Details'] ?? null;

        if (! is_string($sessionId) || $sessionId === '' || strcasecmp($sessionId, 'OTP Matched') === 0) {
            throw new RuntimeException('We couldn\'t send the OTP. Please try again.');
        }

        return $sessionId;
    }

    public function verifyOtp(string $sessionId, string $otp): bool
    {
        $apiKey = $this->apiKey();
        $url = $this->baseUrl($apiKey).'/SMS/VERIFY/'.$sessionId.'/'.$otp;
        $payload = $this->request('verify', $url);
        $details = strtolower((string) ($payload['Details'] ?? ''));

        return str_contains($details, 'otp matched') || str_contains($details, 'success');
    }

    /**
     * @return array{Status?: string, Details?: string}
     */
    private function request(string $action, string $url): array
    {
        if (str_contains(strtoupper($url), '/VOICE/')) {
            throw new RuntimeException('We couldn\'t send the OTP. Please try again.');
        }

        try {
            $response = Http::timeout((int) config('services.twofactor.timeout', 15))
                ->acceptJson()
                ->get($url);
        } catch (ConnectionException|RequestException) {
            throw new RuntimeException(
                $action === 'verify'
                    ? 'We couldn\'t verify the OTP. Please try again.'
                    : 'We couldn\'t send the OTP. Please try again.',
            );
        }

        $payload = $response->json();
        $status = is_array($payload) ? strtolower((string) ($payload['Status'] ?? '')) : '';
        $details = is_array($payload) ? strtolower((string) ($payload['Details'] ?? '')) : '';

        if ($response->successful() && $status === 'success') {
            return is_array($payload) ? $payload : [];
        }

        throw new RuntimeException($this->mapError($action, $details, $response->status()));
    }

    private function mapError(string $action, string $details, int $status): string
    {
        if (str_contains($details, 'expired')) {
            return 'OTP has expired. Please request a new OTP.';
        }

        if (str_contains($details, 'mismatch') || str_contains($details, 'invalid otp') || str_contains($details, 'not match')) {
            return 'Incorrect OTP. Please try again.';
        }

        if ($status === 429 || str_contains($details, 'limit') || str_contains($details, 'exceed')) {
            return 'Too many attempts. Please try again later.';
        }

        return $action === 'verify'
            ? 'Incorrect OTP. Please try again.'
            : 'We couldn\'t send the OTP. Please try again.';
    }

    private function sendAction(): string
    {
        $action = strtoupper((string) config('services.twofactor.send_action', 'AUTOGEN'));

        // Only AUTOGEN is a valid 2Factor SMS OTP endpoint.
        // AUTOGEN2 and other values are not documented and may trigger voice fallback.
        return $action === 'AUTOGEN' ? 'AUTOGEN' : 'AUTOGEN';
    }

    private function apiKey(): string
    {
        $apiKey = config('services.twofactor.key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('We couldn\'t send the OTP. Please try again.');
        }

        return $apiKey;
    }

    private function baseUrl(string $apiKey): string
    {
        $base = rtrim((string) config('services.twofactor.base_url', 'https://2factor.in/API/V1'), '/');

        return $base.'/'.$apiKey;
    }
}
