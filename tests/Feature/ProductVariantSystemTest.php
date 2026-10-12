<?php

namespace Tests\Feature;

use App\Services\StorefrontProductService;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProductVariantSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_size_color_variants_with_shared_color_images(): void
    {
        $admin = User::factory()->admin()->create();
        $category = $this->category();
        [$sizeXs, $sizeS, $black] = $this->variantValues();

        $response = $this->actingAs($admin)->post('/admin/products', [
            ...$this->productPayload($category),
            'variants' => [
                [
                    'option_value_ids' => [$sizeXs->id, $black->id],
                    'sku' => 'TSHIRT-XS-BLK',
                    'stock' => 10,
                    'original_price' => 1499,
                    'sale_price' => 999,
                    'status' => 'active',
                    'sync_images' => '1',
                    'images' => [
                        [
                            'image' => 'https://example.com/black-front.jpg',
                            'sort_order' => 0,
                            'color_value_id' => $black->id,
                        ],
                        [
                            'image' => 'https://example.com/black-back.jpg',
                            'sort_order' => 1,
                            'color_value_id' => $black->id,
                        ],
                    ],
                ],
                [
                    'option_value_ids' => [$sizeS->id, $black->id],
                    'sku' => 'TSHIRT-S-BLK',
                    'stock' => 8,
                    'original_price' => 1499,
                    'sale_price' => 999,
                    'status' => 'active',
                ],
            ],
        ]);

        $response->assertRedirect('/admin/products');

        $product = Product::query()->where('sku', 'URBAN-DENIM')->firstOrFail();

        $this->assertCount(2, $product->variants);
        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'size_value_id' => $sizeXs->id,
            'color_value_id' => $black->id,
            'sku' => 'TSHIRT-XS-BLK',
            'stock' => 10,
        ]);
        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'size_value_id' => $sizeS->id,
            'color_value_id' => $black->id,
            'sku' => 'TSHIRT-S-BLK',
            'stock' => 8,
        ]);
        $this->assertDatabaseCount('product_images', 2);
        $this->assertDatabaseHas('product_images', [
            'product_id' => $product->id,
            'color_value_id' => $black->id,
            'image' => 'https://example.com/black-front.jpg',
        ]);
    }

    public function test_admin_cannot_submit_duplicate_size_color_combinations(): void
    {
        $admin = User::factory()->admin()->create();
        $category = $this->category();
        [$sizeXs,, $black] = $this->variantValues();

        $response = $this->actingAs($admin)->from('/admin/products/create')->post('/admin/products', [
            ...$this->productPayload($category),
            'variants' => [
                [
                    'option_value_ids' => [$sizeXs->id, $black->id],
                    'sku' => 'TSHIRT-XS-BLK',
                    'stock' => 10,
                    'original_price' => 1499,
                    'sale_price' => 999,
                    'status' => 'active',
                ],
                [
                    'option_value_ids' => [$sizeXs->id, $black->id],
                    'sku' => 'TSHIRT-XS-BLK-2',
                    'stock' => 5,
                    'original_price' => 1499,
                    'sale_price' => 999,
                    'status' => 'active',
                ],
            ],
        ]);

        $response
            ->assertRedirect('/admin/products/create')
            ->assertSessionHasErrors('variants.1.option_value_ids');
    }

    public function test_admin_update_reuses_existing_variant_by_size_color_combination(): void
    {
        $admin = User::factory()->admin()->create();
        $category = $this->category();
        [$sizeXs,, $black] = $this->variantValues();
        $product = Product::query()->create($this->productPayload($category));
        $variant = $product->variants()->create([
            'size_value_id' => $sizeXs->id,
            'color_value_id' => $black->id,
            'sku' => 'TSHIRT-XS-BLK',
            'stock' => 10,
            'original_price' => 1499,
            'sale_price' => 999,
            'status' => 'inactive',
        ]);
        $variant->optionValues()->sync([$sizeXs->id, $black->id]);

        $response = $this->actingAs($admin)->post("/admin/products/{$product->id}/update", [
            ...$this->productPayload($category, ['name' => 'Urban Denim Overshirt Updated']),
            'variants' => [
                [
                    'option_value_ids' => [$sizeXs->id, $black->id],
                    'sku' => 'TSHIRT-XS-BLK-NEW',
                    'stock' => 12,
                    'original_price' => 1599,
                    'sale_price' => 1099,
                    'status' => 'active',
                ],
            ],
        ]);

        $response->assertRedirect('/admin/products');

        $this->assertDatabaseCount('product_variants', 1);
        $this->assertDatabaseHas('product_variants', [
            'id' => $variant->id,
            'sku' => 'TSHIRT-XS-BLK-NEW',
            'status' => 'active',
            'stock' => 12,
        ]);
    }

    public function test_cart_rejects_variant_id_that_does_not_match_selected_color_and_size(): void
    {
        $customer = User::factory()->create();
        $category = $this->category();
        [$sizeXs,, $black, $white] = $this->variantValues();
        $product = Product::query()->create($this->productPayload($category));
        $blackVariant = $product->variants()->create([
            'size_value_id' => $sizeXs->id,
            'color_value_id' => $black->id,
            'sku' => 'TSHIRT-XS-BLK',
            'stock' => 10,
            'original_price' => 1499,
            'sale_price' => 999,
            'status' => 'active',
        ]);
        $blackVariant->optionValues()->sync([$sizeXs->id, $black->id]);

        $response = $this->actingAs($customer)->from("/product/{$product->slug}")->post('/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $blackVariant->id,
            'color' => $white->value,
            'size' => $sizeXs->value,
            'quantity' => 1,
        ]);

        $response
            ->assertRedirect("/product/{$product->slug}")
            ->assertSessionHasErrors('variant_id');
    }

    public function test_storefront_product_without_variants_has_empty_sizes_and_colors(): void
    {
        $category = $this->category();
        $product = Product::query()->create($this->productPayload($category, [
            'name' => 'Plain Tee',
            'sku' => 'PLAIN-TEE',
            'stock' => 12,
            'thumbnail' => 'https://example.com/plain-thumb.jpg',
            'status' => 'active',
        ]));

        $product->images()->create([
            'image' => 'https://example.com/plain-1.jpg',
            'sort_order' => 0,
        ]);
        $product->images()->create([
            'image' => 'https://example.com/plain-2.jpg',
            'sort_order' => 1,
        ]);

        $formatted = app(StorefrontProductService::class)->toFashionProduct(
            $product->load([
                'category:id,name,slug,parent_id,gender',
                'images' => fn ($query) => $query->orderBy('sort_order'),
                'variants' => fn ($query) => $query
                    ->where('status', 'active')
                    ->with(['optionValues.attribute']),
                'attributeValues.attribute',
            ]),
        );

        $this->assertSame([], $formatted['sizes']);
        $this->assertNull($formatted['colors']);
        $this->assertNull($formatted['color']);
        $this->assertSame([], $formatted['variantOptions']);
        $this->assertCount(3, $formatted['gallery']);
        $this->assertContains('https://example.com/plain-1.jpg', $formatted['gallery']);
        $this->assertContains('https://example.com/plain-2.jpg', $formatted['gallery']);
    }

    public function test_storefront_product_with_variants_keeps_real_sizes_and_colors(): void
    {
        $category = $this->category();
        [$sizeXs,, $black] = $this->variantValues();
        $product = Product::query()->create($this->productPayload($category, [
            'name' => 'Variant Tee',
            'sku' => 'VARIANT-TEE',
            'stock' => 0,
            'status' => 'active',
        ]));

        $variant = $product->variants()->create([
            'sku' => 'VARIANT-TEE-XS-BLK',
            'stock' => 5,
            'original_price' => 1499,
            'sale_price' => 999,
            'status' => 'active',
            'size_value_id' => $sizeXs->id,
            'color_value_id' => $black->id,
        ]);
        $variant->optionValues()->sync([$sizeXs->id, $black->id]);

        $product->images()->create([
            'image' => 'https://example.com/black-front.jpg',
            'sort_order' => 0,
            'color_value_id' => $black->id,
        ]);

        $formatted = app(StorefrontProductService::class)->toFashionProduct(
            $product->load([
                'category:id,name,slug,parent_id,gender',
                'images' => fn ($query) => $query->orderBy('sort_order'),
                'variants' => fn ($query) => $query
                    ->where('status', 'active')
                    ->with(['optionValues.attribute']),
                'attributeValues.attribute',
            ]),
        );

        $this->assertSame(['XS'], $formatted['sizes']);
        $this->assertNotNull($formatted['colors']);
        $this->assertSame('Black', $formatted['colors'][0]['name']);
        $this->assertCount(1, $formatted['variantOptions']);
    }

    public function test_cart_line_for_base_product_omits_size_and_color(): void
    {
        $customer = User::factory()->create();
        $category = $this->category();
        $product = Product::query()->create($this->productPayload($category, [
            'name' => 'Base Cart Tee',
            'sku' => 'BASE-CART-TEE',
            'stock' => 5,
            'status' => 'active',
        ]));

        $this->actingAs($customer)->post('/cart/items', [
            'product_id' => $product->id,
            'variant_id' => null,
            'color' => null,
            'size' => null,
            'quantity' => 1,
        ])->assertRedirect();

        $this->actingAs($customer)
            ->get('/cart')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('cart')
                ->has('cartItems', 1)
                ->where('cartItems.0.size', null)
                ->where('cartItems.0.color', null)
                ->where('cartItems.0.variantId', null));
    }

    private function category(): Category
    {
        return Category::query()->create([
            'name' => 'Shirts',
            'slug' => 'shirts',
            'status' => 'active',
        ]);
    }

    /**
     * @return array{0: AttributeValue, 1: AttributeValue, 2: AttributeValue, 3: AttributeValue}
     */
    private function variantValues(): array
    {
        $size = Attribute::query()->create([
            'name' => 'Size',
            'slug' => 'size',
            'status' => 'active',
        ]);
        $color = Attribute::query()->create([
            'name' => 'Color',
            'slug' => 'color',
            'input_type' => 'color',
            'status' => 'active',
        ]);

        return [
            AttributeValue::query()->create([
                'attribute_id' => $size->id,
                'value' => 'XS',
                'slug' => 'xs',
                'status' => 'active',
            ]),
            AttributeValue::query()->create([
                'attribute_id' => $size->id,
                'value' => 'S',
                'slug' => 's',
                'status' => 'active',
            ]),
            AttributeValue::query()->create([
                'attribute_id' => $color->id,
                'value' => 'Black',
                'slug' => 'black',
                'meta' => ['hex' => '#171717'],
                'status' => 'active',
            ]),
            AttributeValue::query()->create([
                'attribute_id' => $color->id,
                'value' => 'White',
                'slug' => 'white',
                'meta' => ['hex' => '#FFFFFF'],
                'status' => 'active',
            ]),
        ];
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function productPayload(Category $category, array $overrides = []): array
    {
        $name = $overrides['name'] ?? 'Urban Denim Overshirt';

        return [
            'category_id' => $category->id,
            'brand_id' => null,
            'name' => $name,
            'slug' => Str::slug($name),
            'sku' => 'URBAN-DENIM',
            'short_description' => 'A compact overshirt.',
            'description' => 'A compact overshirt.',
            'original_price' => 1499,
            'sale_price' => 999,
            'stock' => 0,
            'weight' => 0.5,
            'status' => 'active',
            'is_featured' => '0',
            ...$overrides,
        ];
    }
}
