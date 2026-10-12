<?php

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $size = Attribute::query()->where('slug', 'size')->first();

        if (! $size) {
            return;
        }

        AttributeValue::query()->updateOrCreate(
            [
                'attribute_id' => $size->id,
                'slug' => 'free-size',
            ],
            [
                'value' => 'Free Size',
                'sort_order' => 6,
                'status' => 'active',
            ],
        );
    }

    public function down(): void
    {
        $size = Attribute::query()->where('slug', 'size')->first();

        if (! $size) {
            return;
        }

        AttributeValue::query()
            ->where('attribute_id', $size->id)
            ->where('slug', 'free-size')
            ->delete();
    }
};
