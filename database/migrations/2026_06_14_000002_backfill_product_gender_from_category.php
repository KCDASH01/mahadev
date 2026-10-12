<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Product::query()
            ->with('category.parent')
            ->where(function ($query): void {
                $query->whereNull('gender')->orWhere('gender', '');
            })
            ->each(function (Product $product): void {
                $gender = $product->category?->parent?->gender
                    ?? $product->category?->gender;

                if (! filled($gender)) {
                    return;
                }

                $product->update([
                    'gender' => strtolower((string) $gender),
                ]);
            });
    }

    public function down(): void
    {
        //
    }
};
