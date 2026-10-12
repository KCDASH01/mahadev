<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'registered_from' => ['nullable', 'date'],
            'registered_to' => ['nullable', 'date', 'after_or_equal:registered_from'],
        ]);

        $search = trim((string) ($validated['search'] ?? ''));

        $users = User::query()
            ->where('role', '!=', 'admin')
            ->withCount('orders')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($validated['registered_from'] ?? null, fn ($query, $from) => $query->whereDate('created_at', '>=', $from))
            ->when($validated['registered_to'] ?? null, fn ($query, $to) => $query->whereDate('created_at', '<=', $to))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'registered_from' => $validated['registered_from'] ?? '',
                'registered_to' => $validated['registered_to'] ?? '',
            ],
        ]);
    }

    public function show(User $user): Response
    {
        abort_if($user->isAdmin(), 404);

        $user->loadCount('orders');

        $orders = $user->orders()
            ->withCount('items')
            ->latest('placed_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/users/show', [
            'user' => $user,
            'orders' => $orders,
        ]);
    }
}
