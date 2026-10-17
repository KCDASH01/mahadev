<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_page_is_available(): void
    {
        $this->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('auth/admin-login'));
    }

    public function test_customer_can_open_admin_login_while_authenticated(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('auth/admin-login'));
    }

    public function test_authenticated_admin_is_redirected_from_admin_login(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/admin/login')
            ->assertRedirect('/dashboard');
    }

    public function test_admin_login_ignores_customer_intended_url(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'admin@mahadev.test',
            'password' => 'secret-password',
        ]);

        $this->withSession(['url.intended' => '/'])
            ->from('/admin/login')
            ->post('/admin/login', [
                'login' => $admin->email,
                'password' => 'secret-password',
            ])
            ->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_admin_can_login_with_email_and_password(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'admin@mahadev.test',
            'password' => 'secret-password',
        ]);

        $this->from('/admin/login')->post('/admin/login', [
            'login' => $admin->email,
            'password' => 'secret-password',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_admin_can_login_with_mobile_and_password(): void
    {
        $admin = User::factory()->admin()->create([
            'phone' => '9876543210',
            'password' => 'secret-password',
        ]);

        $this->from('/admin/login')->post('/admin/login', [
            'login' => '9876543210',
            'password' => 'secret-password',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_customer_cannot_login_through_admin_login(): void
    {
        $customer = User::factory()->create([
            'email' => 'customer@mahadev.test',
            'phone' => '9123456789',
            'password' => 'secret-password',
            'role' => 'customer',
        ]);

        $this->from('/admin/login')->post('/admin/login', [
            'login' => $customer->email,
            'password' => 'secret-password',
        ])->assertSessionHasErrors();

        $this->assertGuest();
    }

    public function test_customer_cannot_access_admin_dashboard(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get('/dashboard')
            ->assertRedirect('/');
    }

    public function test_guest_is_sent_to_admin_login_for_admin_routes(): void
    {
        $this->get('/dashboard')->assertRedirect('/admin/login');
        $this->get('/admin/orders')->assertRedirect('/admin/login');
    }

    public function test_customer_login_is_not_password_based(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('auth/login')
                ->where('step', 'mobile'));
    }
}
