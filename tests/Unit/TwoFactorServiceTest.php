<?php

namespace Tests\Unit;

use App\Services\TwoFactorService;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class TwoFactorServiceTest extends TestCase
{
    public function test_send_otp_uses_sms_endpoint_not_voice(): void
    {
        config([
            'services.twofactor.key' => 'testing-key',
            'services.twofactor.send_action' => 'AUTOGEN',
            'services.twofactor.template' => null,
        ]);

        Http::fake([
            'https://2factor.in/*' => Http::response(['Status' => 'Success', 'Details' => 'otp-session-id'], 200),
        ]);

        app(TwoFactorService::class)->sendOtp('919876543210');

        Http::assertSent(function ($request) {
            $url = $request->url();

            return str_contains($url, '/SMS/')
                && str_contains($url, '/AUTOGEN')
                && ! str_contains($url, 'AUTOGEN2')
                && ! str_contains(strtoupper($url), '/VOICE/');
        });
    }

    public function test_send_otp_appends_template_when_configured(): void
    {
        config([
            'services.twofactor.key' => 'testing-key',
            'services.twofactor.template' => 'Bhulika Customer OTP Test',
        ]);

        Http::fake([
            'https://2factor.in/*' => Http::response(['Status' => 'Success', 'Details' => 'otp-session-id'], 200),
        ]);

        app(TwoFactorService::class)->sendOtp('919876543210');

        Http::assertSent(function ($request) {
            $url = $request->url();

            return str_contains($url, '/SMS/')
                && str_contains($url, '/AUTOGEN/')
                && str_contains($url, 'Bhulika');
        });
    }

    public function test_send_otp_maps_api_failures(): void
    {
        config(['services.twofactor.key' => 'testing-key']);

        Http::fake([
            'https://2factor.in/*' => Http::response(['Status' => 'Error', 'Details' => 'Service down'], 500),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('We couldn\'t send the OTP. Please try again.');

        app(TwoFactorService::class)->sendOtp('919876543210');
    }

    public function test_verify_otp_maps_mismatch(): void
    {
        config(['services.twofactor.key' => 'testing-key']);

        Http::fake([
            'https://2factor.in/*' => Http::response(['Status' => 'Error', 'Details' => 'OTP Mismatch'], 200),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Incorrect OTP. Please try again.');

        app(TwoFactorService::class)->verifyOtp('session-id', '000000');
    }
}
