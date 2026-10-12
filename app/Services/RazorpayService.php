<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Support\Facades\Log;
use Razorpay\Api\Api;
use RuntimeException;

class RazorpayService
{
    private ?Api $client = null;

    public function key(): string
    {
        $key = (string) config('services.razorpay.key');

        if ($key === '') {
            throw new RuntimeException('Razorpay key is not configured.');
        }

        return $key;
    }

    public function createOrder(Order $order): \Razorpay\Api\Order
    {
        $amountPaise = $this->amountInPaise((float) $order->grand_total);

        $razorpayOrder = $this->client()->order->create([
            'receipt' => $order->order_number,
            'amount' => $amountPaise,
            'currency' => 'INR',
            'payment_capture' => 1,
            'notes' => [
                'brand' => 'Mahadev',
                'order_number' => $order->order_number,
                'user_id' => (string) $order->user_id,
            ],
        ]);

        Log::info('Razorpay order created', [
            'order_number' => $order->order_number,
            'razorpay_order_id' => $razorpayOrder['id'] ?? null,
            'amount_paise' => $amountPaise,
        ]);

        return $razorpayOrder;
    }

    /**
     * @return array<string, mixed>
     */
    public function checkoutPayload(
        Order $order,
        Payment $payment,
        User $user,
        UserAddress $address,
    ): array {
        return [
            'orderNumber' => $order->order_number,
            'amount' => $this->amountInPaise((float) $order->grand_total),
            'currency' => 'INR',
            'razorpayOrderId' => $payment->razorpay_order_id,
            'key' => $this->key(),
            'customer' => [
                'name' => $address->full_name ?: $user->name,
                'email' => $user->email,
                'phone' => $address->phone,
            ],
            'description' => 'Order '.$order->order_number,
            'brandName' => 'Mahadev',
        ];
    }

    public function verifyPaymentSignature(
        string $razorpayOrderId,
        string $razorpayPaymentId,
        string $razorpaySignature,
    ): void {
        $this->client()->utility->verifyPaymentSignature([
            'razorpay_order_id' => $razorpayOrderId,
            'razorpay_payment_id' => $razorpayPaymentId,
            'razorpay_signature' => $razorpaySignature,
        ]);
    }

    public function assertPaymentAmount(string $razorpayPaymentId, float $expectedAmount): void
    {
        $payment = $this->client()->payment->fetch($razorpayPaymentId);
        $paidPaise = (int) ($payment['amount'] ?? 0);
        $expectedPaise = $this->amountInPaise($expectedAmount);

        if ($paidPaise !== $expectedPaise) {
            throw new RuntimeException('Payment amount mismatch.');
        }
    }

    public function amountInPaise(float $amount): int
    {
        return (int) round($amount * 100);
    }

    private function client(): Api
    {
        if ($this->client !== null) {
            return $this->client;
        }

        $secret = (string) config('services.razorpay.secret');

        if ($secret === '') {
            throw new RuntimeException('Razorpay secret is not configured.');
        }

        $this->client = new Api($this->key(), $secret);

        return $this->client;
    }
}
