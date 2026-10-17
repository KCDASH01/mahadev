<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_lists_public_pages_on_the_www_domain(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $this->assertStringContainsString('application/xml', (string) $response->headers->get('Content-Type'));
        $response->assertSee('https://www.xml-sitemaps.com/css/sitemap.css', false);
        $response->assertSee('https://ecom.kanpritech.com/', false);
        $response->assertSee('https://ecom.kanpritech.com/collection/ladies', false);
        $response->assertSee('https://ecom.kanpritech.com/privacy-policy', false);
        $response->assertSee('<priority>1.0000</priority>', false);
    }

    public function test_sitemap_includes_active_products_and_blog_posts(): void
    {
        $category = Category::query()->create([
            'name' => 'Shirts',
            'slug' => 'shirts',
            'status' => 'active',
        ]);

        Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Sitemap Product',
            'slug' => 'sitemap-product',
            'sku' => 'SM-1',
            'original_price' => 999,
            'sale_price' => 899,
            'status' => 'active',
        ]);

        Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Hidden Product',
            'slug' => 'hidden-product',
            'sku' => 'SM-2',
            'original_price' => 999,
            'sale_price' => 899,
            'status' => 'inactive',
        ]);

        Blog::query()->create([
            'title' => 'Sitemap Post',
            'slug' => 'sitemap-post',
            'excerpt' => 'A post for sitemap tests.',
            'category' => 'News',
            'image' => 'https://example.com/post.jpg',
            'status' => 'active',
            'published_at' => now(),
        ]);

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertSee('https://ecom.kanpritech.com/product/sitemap-product', false);
        $response->assertDontSee('hidden-product', false);
        $response->assertSee('https://ecom.kanpritech.com/blog/sitemap-post', false);
    }
}
