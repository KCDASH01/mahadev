<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CustomerOtpAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.twofactor.key' => 'testing-key']);

        Http::fake(function ($request) {
            $url = $request->url();

            if (str_contains($url, '/AUTOGEN')) {
                return Http::response(['Status' => 'Success', 'Details' => 'otp-session-id'], 200);
            }

            if (str_contains($url, '/VERIFY/otp-session-id/123456')) {
                return Http::response(['Status' => 'Success', 'Details' => 'OTP Matched'], 200);
            }

            if (str_contains($url, '/VERIFY/')) {
                return Http::response(['Status' => 'Error', 'Details' => 'OTP Mismatch'], 200);
            }

            return Http::response(['Status' => 'Error', 'Details' => 'Unknown'], 500);
        });
    }

    public function test_invalid_mobile_numbers_are_rejected(): void
    {
        $this->from('/login')->post('/login/otp/send', [
            'phone' => '12345',
        ])->assertSessionHasErrors(['phone']);
    }

    public function test_new_customer_can_verify_otp_and_create_account(): void
    {
        $this->from('/login')->post('/login/otp/send', [
            'phone' => '9876543210',
        ])->assertRedirect('/login');

        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('step', 'otp'));

        $this->post('/login/otp/verify', [
            'otp' => '123456',
        ])->assertRedirect('/login');

        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('step', 'register'));

        $this->post('/login/register', [
            'name' => 'New Customer',
        ])->assertRedirect('/');

        $this->assertAuthenticated();
        $this->assertNotEmpty(User::query()->where('phone', '9876543210')->value('remember_token'));
        $this->assertDatabaseHas('users', [
            'name' => 'New Customer',
            'email' => null,
            'phone' => '9876543210',
            'role' => 'customer',
        ]);
    }

    public function test_existing_customer_can_login_with_otp(): void
    {
        $customer = User::factory()->create([
            'phone' => '9876500001',
            'role' => 'customer',
        ]);

        $this->post('/login/otp/send', ['phone' => '9876500001'])->assertRedirect('/login');
        $this->post('/login/otp/verify', ['otp' => '123456'])->assertRedirect('/');

        $this->assertAuthenticatedAs($customer);
        $this->assertNotEmpty($customer->fresh()->remember_token);
    }

    public function test_incorrect_otp_is_rejected(): void
    {
        $this->post('/login/otp/send', ['phone' => '9876543210']);

        $this->from('/login')->post('/login/otp/verify', [
            'otp' => '000000',
        ])->assertSessionHasErrors(['otp']);

        $this->assertGuest();
    }

    public function test_excessive_otp_attempts_are_blocked(): void
    {
        $this->post('/login/otp/send', ['phone' => '9876543210']);

        for ($i = 0; $i < 5; $i++) {
            $this->from('/login')->post('/login/otp/verify', ['otp' => '000000']);
        }

        $this->from('/login')->post('/login/otp/verify', [
            'otp' => '123456',
        ])->assertSessionHasErrors(['otp']);

        $this->assertGuest();
    }

    public function test_expired_otp_is_rejected(): void
    {
        $this->post('/login/otp/send', ['phone' => '9876543210']);

        Cache::put('customer-otp:challenge:9876543210', [
            'session_id' => 'otp-session-id',
            'attempts' => 0,
            'sent_at' => now()->subMinutes(10)->getTimestamp(),
            'resends' => 0,
            'expires_at' => now()->subMinute()->getTimestamp(),
        ], now()->addHour());

        $this->from('/login')->post('/login/otp/verify', [
            'otp' => '123456',
        ])->assertSessionHasErrors(['otp']);
    }

    public function test_admin_phone_cannot_authenticate_via_customer_otp(): void
    {
        $admin = User::factory()->admin()->create([
            'phone' => '9998887776',
        ]);

        $this->from('/login')->post('/login/otp/send', [
            'phone' => '9998887776',
        ])->assertSessionHasErrors(['phone']);

        $this->assertGuest();
        $this->assertTrue($admin->isAdmin());
    }

    public function test_otp_and_api_key_are_not_exposed_in_the_login_response(): void
    {
        $this->post('/login/otp/send', ['phone' => '9876543210']);

        $response = $this->get('/login');
        $content = $response->getContent();

        $this->assertStringNotContainsString('123456', $content);
        $this->assertStringNotContainsString('otp-session-id', $content);
        $this->assertStringNotContainsString('testing-key', $content);
        $this->assertStringNotContainsString('TWOFACTOR', $content);
    }

    public function test_twofactor_failures_are_handled(): void
    {
        config(['services.twofactor.key' => null]);

        $this->from('/login')->post('/login/otp/send', [
            'phone' => '9876543210',
        ])->assertSessionHasErrors(['phone']);
    }

    public function test_checkout_intended_url_is_preserved_after_customer_login(): void
    {
        $customer = User::factory()->create([
            'phone' => '9876500002',
            'role' => 'customer',
        ]);

        $this->get('/login?redirect=/checkout');
        $this->post('/login/otp/send', ['phone' => '9876500002']);
        $this->post('/login/otp/verify', ['otp' => '123456'])->assertRedirect('/checkout');

        $this->assertAuthenticatedAs($customer);
    }
}
