<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $todayStart = $now->copy()->startOfDay();

        $paidOrders = Order::query()->where('payment_status', 'paid');

        $revenueTotal = (float) (clone $paidOrders)->sum('grand_total');
        $revenueThisMonth = (float) (clone $paidOrders)
            ->where('placed_at', '>=', $monthStart)
            ->sum('grand_total');

        $orderStatusCounts = Order::query()
            ->select('order_status', DB::raw('count(*) as count'))
            ->groupBy('order_status')
            ->pluck('count', 'order_status')
            ->all();

        $recentOrders = Order::query()
            ->with('user:id,name,email')
            ->withCount('items')
            ->latest('placed_at')
            ->latest('id')
            ->limit(6)
            ->get([
                'id',
                'order_number',
                'user_id',
                'grand_total',
                'payment_status',
                'order_status',
                'placed_at',
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'revenue' => [
                    'total' => $revenueTotal,
                    'this_month' => $revenueThisMonth,
                ],
                'orders' => [
                    'total' => Order::count(),
                    'pending' => Order::where('order_status', 'pending')->count(),
                    'today' => Order::where('placed_at', '>=', $todayStart)->count(),
                ],
                'customers' => [
                    'total' => User::where('role', '!=', 'admin')->count(),
                    'new_this_month' => User::where('role', '!=', 'admin')
                        ->where('created_at', '>=', $monthStart)
                        ->count(),
                ],
                'products' => [
                    'total' => Product::count(),
                    'active' => Product::where('status', 'active')->count(),
                    'low_stock' => Product::where('status', 'active')->where('stock', '<=', 5)->count(),
                ],
                'categories' => Category::count(),
                'brands' => Brand::count(),
                'coupons' => Coupon::count(),
                'payments' => Payment::where('status', 'paid')->count(),
            ],
            'orderStatusCounts' => $orderStatusCounts,
            'recentOrders' => $recentOrders,
        ]);
    }
}
