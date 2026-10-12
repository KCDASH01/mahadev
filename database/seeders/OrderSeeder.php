<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = User::query()
            ->where('role', 'customer')
            ->with('addresses')
            ->get();

        if ($customers->isEmpty()) {
            return;
        }

        $products = Product::query()->get()->keyBy('sku');

        if ($products->isEmpty()) {
            return;
        }

        $orderDefinitions = [
            [
                'customer_email' => 'rahul@gmail.com',
                'items' => [
                    ['sku' => 'MED-BP-001', 'quantity' => 3],
                    ['sku' => 'MED-PO-001', 'quantity' => 2],
                ],
            ],
            [
                'customer_email' => 'priya@gmail.com',
                'items' => [
                    ['sku' => 'MED-WC-001', 'quantity' => 2],
                    ['sku' => 'MED-BP-002', 'quantity' => 1],
                ],
            ],
            [
                'customer_email' => 'amit@gmail.com',
                'items' => [
                    ['sku' => 'MED-BP-001', 'quantity' => 5],
                    ['sku' => 'MED-NB-001', 'quantity' => 2],
                ],
            ],
            [
                'customer_email' => 'sneha@gmail.com',
                'items' => [
                    ['sku' => 'MED-WC-001', 'quantity' => 4],
                    ['sku' => 'MED-TH-001', 'quantity' => 1],
                ],
            ],
            [
                'customer_email' => 'vikram@gmail.com',
                'items' => [
                    ['sku' => 'MED-PO-001', 'quantity' => 6],
                    ['sku' => 'MED-GL-001', 'quantity' => 2],
                ],
            ],
            [
                'customer_email' => 'rahul@gmail.com',
                'items' => [
                    ['sku' => 'MED-BP-001', 'quantity' => 2],
                    ['sku' => 'MED-WK-001', 'quantity' => 1],
                ],
            ],
            [
                'customer_email' => 'priya@gmail.com',
                'items' => [
                    ['sku' => 'MED-NB-001', 'quantity' => 3],
                    ['sku' => 'MED-BP-003', 'quantity' => 2],
                ],
            ],
            [
                'customer_email' => 'amit@gmail.com',
                'items' => [
                    ['sku' => 'MED-WC-002', 'quantity' => 2],
                    ['sku' => 'MED-BP-002', 'quantity' => 4],
                ],
            ],
            [
                'customer_email' => 'sneha@gmail.com',
                'items' => [
                    ['sku' => 'MED-BP-001', 'quantity' => 1],
                    ['sku' => 'MED-GL-001', 'quantity' => 3],
                ],
            ],
            [
                'customer_email' => 'vikram@gmail.com',
                'items' => [
                    ['sku' => 'MED-OX-001', 'quantity' => 1],
                    ['sku' => 'MED-PO-001', 'quantity' => 2],
                ],
            ],
            [
                'customer_email' => 'rahul@gmail.com',
                'items' => [
                    ['sku' => 'MED-PO-001', 'quantity' => 4],
                    ['sku' => 'MED-TH-002', 'quantity' => 5],
                ],
            ],
            [
                'customer_email' => 'priya@gmail.com',
                'items' => [
                    ['sku' => 'MED-BP-002', 'quantity' => 3],
                    ['sku' => 'MED-NB-002', 'quantity' => 1],
                ],
            ],
        ];

        foreach ($orderDefinitions as $index => $definition) {
            $customer = $customers->firstWhere('email', $definition['customer_email']);
            $address = $customer?->addresses->firstWhere('is_default', true)
                ?? $customer?->addresses->first();

            if (! $customer || ! $address) {
                continue;
            }

            $lineItems = collect($definition['items'])
                ->map(function (array $item) use ($products) {
                    $product = $products->get($item['sku']);

                    if (! $product) {
                        return null;
                    }

                    $subtotal = $product->sale_price * $item['quantity'];

                    return [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ];
                })
                ->filter()
                ->values();

            if ($lineItems->isEmpty()) {
                continue;
            }

            $subtotal = $lineItems->sum('subtotal');
            $shipping = $subtotal >= 5000 ? 0 : 99;
            $grandTotal = $subtotal + $shipping;
            $orderNumber = 'ORD-2026-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);

            $order = Order::updateOrCreate(
                ['order_number' => $orderNumber],
                [
                    'user_id' => $customer->id,
                    'address_id' => $address->id,
                    'subtotal' => $subtotal,
                    'discount_amount' => 0,
                    'shipping_charge' => $shipping,
                    'tax_amount' => 0,
                    'grand_total' => $grandTotal,
                    'payment_method' => 'cod',
                    'payment_status' => 'paid',
                    'order_status' => 'delivered',
                    'transaction_id' => 'TXN-'.$orderNumber,
                    'notes' => 'Seeded demo order for homepage best sellers.',
                    'placed_at' => now()->subDays(30 - $index),
                ],
            );

            $order->items()->delete();

            foreach ($lineItems as $lineItem) {
                /** @var \App\Models\Product $product */
                $product = $lineItem['product'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'variant_id' => null,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'original_price' => $product->original_price,
                    'sale_price' => $product->sale_price,
                    'quantity' => $lineItem['quantity'],
                    'subtotal' => $lineItem['subtotal'],
                ]);
            }
        }
    }
}
