<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'customer' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $search = trim((string) ($validated['search'] ?? ''));
        $customer = trim((string) ($validated['customer'] ?? ''));

        $payments = Payment::query()
            ->with([
                'order:id,order_number,user_id,grand_total',
                'order.user:id,name,email',
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('razorpay_payment_id', 'like', "%{$search}%")
                        ->orWhere('razorpay_order_id', 'like', "%{$search}%")
                        ->orWhereHas('order', fn ($query) => $query->where('order_number', 'like', "%{$search}%"));
                });
            })
            ->when($customer !== '', function ($query) use ($customer) {
                $query->whereHas('order.user', function ($query) use ($customer) {
                    $query->where('name', 'like', "%{$customer}%")
                        ->orWhere('email', 'like', "%{$customer}%");
                });
            })
            ->when($validated['date_from'] ?? null, function ($query, $from) {
                $query->whereRaw('DATE(COALESCE(paid_at, created_at)) >= ?', [$from]);
            })
            ->when($validated['date_to'] ?? null, function ($query, $to) {
                $query->whereRaw('DATE(COALESCE(paid_at, created_at)) <= ?', [$to]);
            })
            ->latest('created_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'customer' => $customer,
                'date_from' => $validated['date_from'] ?? '',
                'date_to' => $validated['date_to'] ?? '',
            ],
        ]);
    }
}
