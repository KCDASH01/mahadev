<?php

namespace Tests\Feature;

use App\Support\CategorySeo;
use App\Support\StorefrontPath;
use Tests\TestCase;

class StorefrontSeoUrlTest extends TestCase
{
    public function test_legacy_collection_paths_redirect_permanently(): void
    {
        $this->get('/men')
            ->assertRedirect('/collection/men')
            ->assertStatus(301);

        $this->get('/women')
            ->assertRedirect('/collection/women')
            ->assertStatus(301);

        $this->get('/kids')
            ->assertRedirect('/collection/kids')
            ->assertStatus(301);

        $this->get('/jewellery')
            ->assertRedirect('/collection/accessories')
            ->assertStatus(301);
    }

    public function test_legacy_category_query_paths_redirect_permanently(): void
    {
        $this->get('/men?category=Shirts')
            ->assertRedirect('/collection/men/category/Shirts')
            ->assertStatus(301);

        $this->get('/jewellery?category=Necklaces')
            ->assertRedirect('/jewellery/category/Necklaces')
            ->assertStatus(301);
    }

    public function test_category_paths_use_hyphens_instead_of_spaces(): void
    {
        $this->get('/collection/women/category/Buttom%20Down%20Dress')
            ->assertRedirect('/collection/women/category/Buttom-Down-Dress')
            ->assertStatus(301);

        $this->get('/women?category=Buttom Down Dress')
            ->assertRedirect('/collection/women/category/Buttom-Down-Dress')
            ->assertStatus(301);
    }

    public function test_legacy_product_paths_redirect_permanently(): void
    {
        $this->get('/shop/sambalpuri-handloom-half-shirt')
            ->assertRedirect('/product/sambalpuri-handloom-half-shirt')
            ->assertStatus(301);

        $this->get('/products/sambalpuri-handloom-half-shirt')
            ->assertRedirect('/product/sambalpuri-handloom-half-shirt')
            ->assertStatus(301);
    }

    public function test_storefront_path_helpers_match_canonical_urls(): void
    {
        $this->assertSame('/collection/men', StorefrontPath::collection('men'));
        $this->assertSame('/collection/accessories', StorefrontPath::collection('jewellery'));
        $this->assertSame('/jewellery/category/Necklaces', StorefrontPath::collectionCategory('jewellery', 'Necklaces'));
        $this->assertSame(
            '/collection/women/category/Buttom-Down-Dress',
            StorefrontPath::collectionCategory('women', 'Buttom Down Dress'),
        );
        $this->assertSame('Buttom Down Dress', StorefrontPath::resolveCategoryName('Buttom-Down-Dress', ['Buttom Down Dress']));
        $this->assertSame('/product/sambalpuri-handloom-half-shirt', StorefrontPath::product('sambalpuri-handloom-half-shirt'));
        $this->assertSame('Accessories', StorefrontPath::displayName('jewellery'));
        $this->assertSame(
            'Sambalpuri Ethnic Shirt for Men | Bhulika',
            CategorySeo::for('men', 'Full Shirts')['title'] ?? null,
        );
    }
}
