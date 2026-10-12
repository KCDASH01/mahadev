<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FashionAttributeSeeder extends Seeder
{
    /**
     * @var array<string, int>
     */
    public static array $attributeIds = [];

    /**
     * @var array<string, int>
     */
    public static array $valueIds = [];

    public function run(): void
    {
        $definitions = [
            'color' => [
                'name' => 'Color',
                'input_type' => 'color',
                'values' => [
                    ['value' => 'Black', 'hex' => '#171717'],
                    ['value' => 'White', 'hex' => '#FFFFFF'],
                    ['value' => 'Blue', 'hex' => '#313C8D'],
                    ['value' => 'Navy', 'hex' => '#171B45'],
                    ['value' => 'Grey', 'hex' => '#6B7280'],
                    ['value' => 'Beige', 'hex' => '#D4C4A8'],
                    ['value' => 'Red', 'hex' => '#DC2626'],
                    ['value' => 'Green', 'hex' => '#16A34A'],
                    ['value' => 'Brown', 'hex' => '#78350F'],
                    ['value' => 'Pink', 'hex' => '#EC4899'],
                    ['value' => 'Orange', 'hex' => '#FF6A00'],
                    ['value' => 'Yellow', 'hex' => '#F5D020'],
                    ['value' => 'Indigo', 'hex' => '#4338CA'],
                    ['value' => 'Maroon', 'hex' => '#7F1D1D'],
                    ['value' => 'Olive', 'hex' => '#4D7C0F'],
                    ['value' => 'Teal', 'hex' => '#0D9488'],
                    ['value' => 'Purple', 'hex' => '#7C3AED'],
                    ['value' => 'Cream', 'hex' => '#FFFDD0'],
                    ['value' => 'Charcoal', 'hex' => '#374151'],
                    ['value' => 'Khaki', 'hex' => '#C3B091'],
                ],
            ],
            'size' => [
                'name' => 'Size',
                'input_type' => 'select',
                'values' => [
                    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size',
                    '28', '30', '32', '34', '36', '38', '40',
                    '6', '7', '8', '9', '10', '11', '12',
                ],
            ],
            'fit' => [
                'name' => 'Fit',
                'input_type' => 'select',
                'values' => ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Athletic', 'Straight', 'Skinny', 'Bootcut'],
            ],
            'material' => [
                'name' => 'Material',
                'input_type' => 'select',
                'values' => ['Cotton', 'Denim', 'Polyester', 'Linen', 'Wool', 'Blend', 'Rayon', 'Silk', 'Fleece', 'Leather'],
            ],
            'pattern' => [
                'name' => 'Pattern',
                'input_type' => 'select',
                'values' => ['Solid', 'Striped', 'Printed', 'Checkered', 'Floral', 'Graphic', 'Embroidered'],
            ],
            'sleeve' => [
                'name' => 'Sleeve',
                'input_type' => 'select',
                'values' => ['Full Sleeve', 'Half Sleeve', 'Sleeveless', 'Three-Quarter'],
            ],
            'neck' => [
                'name' => 'Neck',
                'input_type' => 'select',
                'values' => ['Round Neck', 'V-Neck', 'Collared', 'Mandarin', 'Boat Neck', 'Hooded'],
            ],
        ];

        foreach ($definitions as $slug => $definition) {
            $attribute = Attribute::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $definition['name'],
                    'input_type' => $definition['input_type'],
                    'sort_order' => count(self::$attributeIds),
                    'status' => 'active',
                ],
            );

            self::$attributeIds[$slug] = $attribute->id;

            foreach ($definition['values'] as $index => $valueDefinition) {
                if (is_string($valueDefinition)) {
                    $value = $valueDefinition;
                    $meta = null;
                } else {
                    $value = $valueDefinition['value'];
                    $meta = isset($valueDefinition['hex'])
                        ? ['hex' => $valueDefinition['hex']]
                        : null;
                }

                $valueSlug = Str::slug($value);

                $attributeValue = AttributeValue::updateOrCreate(
                    [
                        'attribute_id' => $attribute->id,
                        'slug' => $valueSlug,
                    ],
                    [
                        'value' => $value,
                        'meta' => $meta,
                        'sort_order' => $index,
                        'status' => 'active',
                    ],
                );

                self::$valueIds["{$slug}.{$valueSlug}"] = $attributeValue->id;
            }
        }
    }

    public static function valueId(string $attributeSlug, string $valueSlug): ?int
    {
        return self::$valueIds["{$attributeSlug}.{$valueSlug}"] ?? null;
    }

    public static function attributeId(string $slug): ?int
    {
        return self::$attributeIds[$slug] ?? null;
    }
}
