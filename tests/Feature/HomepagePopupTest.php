<?php

namespace Tests\Feature;

use App\Models\HomepagePopup;
use App\Models\User;
use App\Services\HomepageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomepagePopupTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_homepage_popup_settings(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/admin/homepage-popup')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/homepage-popup/edit')
                ->has('homepagePopup'));
    }

    public function test_admin_can_save_visible_popup_with_optional_link(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post('/admin/homepage-popup/update', [
                'image' => 'https://example.com/popup.jpg',
                'mobile_image' => 'https://example.com/popup-mobile.jpg',
                'link' => '/women',
                'is_visible' => '1',
            ])
            ->assertRedirect('/admin/homepage-popup');

        $this->assertDatabaseHas('homepage_popups', [
            'image' => 'https://example.com/popup.jpg',
            'mobile_image' => 'https://example.com/popup-mobile.jpg',
            'link' => '/women',
            'is_visible' => 1,
        ]);
    }

    public function test_homepage_payload_includes_visible_popup_and_omits_hidden_one(): void
    {
        HomepagePopup::query()->create([
            'image' => 'https://example.com/popup.jpg',
            'mobile_image' => null,
            'link' => 'https://example.com/sale',
            'is_visible' => true,
        ]);

        $data = app(HomepageService::class)->data();

        $this->assertSame('https://example.com/popup.jpg', $data['homepagePopup']['image']);
        $this->assertSame('https://example.com/sale', $data['homepagePopup']['link']);

        HomepagePopup::query()->update(['is_visible' => false]);

        $hidden = app(HomepageService::class)->data();
        $this->assertNull($hidden['homepagePopup']);
    }
}
