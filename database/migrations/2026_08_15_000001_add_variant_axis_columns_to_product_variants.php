<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->foreignId('size_value_id')
                ->nullable()
                ->after('product_id')
                ->constrained('attribute_values')
                ->nullOnDelete();

            $table->foreignId('color_value_id')
                ->nullable()
                ->after('size_value_id')
                ->constrained('attribute_values')
                ->nullOnDelete();
        });

        $this->backfillVariantAxes();

        Schema::table('product_variants', function (Blueprint $table) {
            $table->unique(
                ['product_id', 'size_value_id', 'color_value_id'],
                'product_variant_size_color_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropUnique('product_variant_size_color_unique');
            $table->dropForeign(['size_value_id']);
            $table->dropForeign(['color_value_id']);
            $table->dropColumn(['size_value_id', 'color_value_id']);
        });
    }

    private function backfillVariantAxes(): void
    {
        $axisRows = DB::table('product_variant_option_values')
            ->join('attribute_values', 'attribute_values.id', '=', 'product_variant_option_values.attribute_value_id')
            ->join('attributes', 'attributes.id', '=', 'attribute_values.attribute_id')
            ->whereIn('attributes.slug', ['size', 'color'])
            ->get([
                'product_variant_option_values.product_variant_id',
                'product_variant_option_values.attribute_value_id',
                'attributes.slug as attribute_slug',
            ])
            ->groupBy('product_variant_id');

        if ($axisRows->isEmpty()) {
            return;
        }

        $variants = DB::table('product_variants')
            ->whereIn('id', $axisRows->keys()->all())
            ->get(['id', 'product_id']);

        $seenCombinations = [];

        foreach ($variants as $variant) {
            $axes = $axisRows->get($variant->id);
            $sizeIds = $axes
                ->where('attribute_slug', 'size')
                ->pluck('attribute_value_id')
                ->unique()
                ->values();
            $colorIds = $axes
                ->where('attribute_slug', 'color')
                ->pluck('attribute_value_id')
                ->unique()
                ->values();

            if ($sizeIds->count() !== 1 || $colorIds->count() !== 1) {
                continue;
            }

            $sizeValueId = (int) $sizeIds->first();
            $colorValueId = (int) $colorIds->first();
            $combinationKey = "{$variant->product_id}:{$sizeValueId}:{$colorValueId}";

            if (isset($seenCombinations[$combinationKey])) {
                continue;
            }

            DB::table('product_variants')
                ->where('id', $variant->id)
                ->update([
                    'size_value_id' => $sizeValueId,
                    'color_value_id' => $colorValueId,
                ]);

            $seenCombinations[$combinationKey] = true;
        }
    }
};
