<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'customer' => ['nullable', 'string', 'max:255'],
            'order_status' => ['nullable', 'string', Rule::in(Order::ORDER_STATUSES)],
            'payment_status' => ['nullable', 'string', Rule::in(Order::PAYMENT_STATUSES)],
            'placed_from' => ['nullable', 'date'],
            'placed_to' => ['nullable', 'date', 'after_or_equal:placed_from'],
        ]);

        $search = trim((string) ($validated['search'] ?? ''));
        $customer = trim((string) ($validated['customer'] ?? ''));
        $orderStatus = trim((string) ($validated['order_status'] ?? ''));
        $paymentStatus = trim((string) ($validated['payment_status'] ?? ''));

        $orders = Order::query()
            ->with('user:id,name,email,phone')
            ->withCount('items')
            ->where('order_status', '!=', 'pending_payment')
            ->where(function ($query) {
                $query->where('order_status', '!=', 'cancelled')
                    ->orWhereIn('payment_status', ['paid', 'refunded'])
                    ->orWhere('payment_method', '!=', 'razorpay');
            })
            ->when($search !== '', fn ($query) => $query->where('order_number', 'like', "%{$search}%"))
            ->when($customer !== '', function ($query) use ($customer) {
                $query->whereHas('user', function ($query) use ($customer) {
                    $query->where('name', 'like', "%{$customer}%")
                        ->orWhere('email', 'like', "%{$customer}%")
                        ->orWhere('phone', 'like', "%{$customer}%");
                });
            })
            ->when($orderStatus !== '', fn ($query) => $query->where('order_status', $orderStatus))
            ->when($paymentStatus !== '', fn ($query) => $query->where('payment_status', $paymentStatus))
            ->when($validated['placed_from'] ?? null, fn ($query, $from) => $query->whereDate('placed_at', '>=', $from))
            ->when($validated['placed_to'] ?? null, fn ($query, $to) => $query->whereDate('placed_at', '<=', $to))
            ->latest('placed_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'customer' => $customer,
                'order_status' => $orderStatus,
                'payment_status' => $paymentStatus,
                'placed_from' => $validated['placed_from'] ?? '',
                'placed_to' => $validated['placed_to'] ?? '',
            ],
            'orderStatusOptions' => Order::ORDER_STATUSES,
            'paymentStatusOptions' => Order::PAYMENT_STATUSES,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user:id,name,email,phone',
            'items',
            'trackings',
            'payments',
            'coupon:id,code,title',
            'shipment',
        ]);

        return Inertia::render('admin/orders/show', [
            'order' => $order,
            'orderStatusOptions' => Order::ORDER_STATUSES,
            'paymentStatusOptions' => Order::PAYMENT_STATUSES,
        ]);
    }

    public function updateStatus(Request $request, Order $order, OrderService $orders): RedirectResponse
    {
        $validated = $request->validate([
            'order_status' => ['required', Rule::in(Order::ORDER_STATUSES)],
        ]);

        try {
            $orders->updateOrderStatus($order, $validated['order_status']);
        } catch (Throwable $exception) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $this->statusUpdateError($exception, $validated['order_status']),
            ]);

            return back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $validated['order_status'] === 'cancelled'
                ? __('Order cancelled. Delhivery pickup was stopped.')
                : __('Order status updated successfully.'),
        ]);

        return back();
    }

    public function updatePaymentStatus(Request $request, Order $order, OrderService $orders): RedirectResponse
    {
        $validated = $request->validate([
            'payment_status' => ['required', Rule::in(Order::PAYMENT_STATUSES)],
        ]);

        $orders->updatePaymentStatus($order, $validated['payment_status']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Payment status updated successfully.'),
        ]);

        return back();
    }

    private function statusUpdateError(Throwable $exception, string $status): string
    {
        if ($status !== 'cancelled') {
            return __('Order status could not be updated. Please try again.');
        }

        $reason = trim($exception->getMessage());

        if ($reason === '') {
            $reason = __('Delhivery did not confirm the cancellation.');
        }

        return __('Order was not cancelled because Delhivery pickup could not be stopped: :reason', [
            'reason' => $reason,
        ]);
    }
}
