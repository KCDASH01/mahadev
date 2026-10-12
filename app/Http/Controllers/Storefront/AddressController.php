<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\StoreAddressRequest;
use App\Models\UserAddress;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request, CartService $cart): Response
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return Inertia::render('account/addresses/index', [
            'addresses' => $addresses
                ->map(fn (UserAddress $address) => $cart->formatAddress($address))
                ->values()
                ->all(),
        ]);
    }

    public function store(StoreAddressRequest $request, CartService $cart): RedirectResponse
    {
        $data = $request->validated();
        $isDefault = $request->boolean('is_default');

        if ($isDefault || ! $request->user()->addresses()->exists()) {
            $request->user()->addresses()->update(['is_default' => false]);
            $isDefault = true;
        }

        $address = $request->user()->addresses()->create([
            ...$data,
            'is_default' => $isDefault,
        ]);

        $cart->setSelectedAddress($request, $address->id);

        return back();
    }

    public function update(StoreAddressRequest $request, UserAddress $address, CartService $cart): RedirectResponse
    {
        $this->authorizeAddress($request, $address);

        $data = $request->validated();

        if ($request->boolean('is_default')) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
            $data['is_default'] = true;
        }

        $address->update($data);

        $cart->setSelectedAddress($request, $address->id);

        return back();
    }

    public function destroy(Request $request, UserAddress $address, CartService $cart): RedirectResponse
    {
        $this->authorizeAddress($request, $address);

        $wasSelected = $cart->selectedAddressId($request) === $address->id;
        $wasDefault = $address->is_default;

        $address->update(['is_default' => false]);
        $address->delete();

        if ($wasDefault) {
            $request->user()
                ->addresses()
                ->orderByDesc('is_default')
                ->first()
                ?->update(['is_default' => true]);
        }

        if ($wasSelected) {
            $nextAddress = $request->user()->addresses()->orderByDesc('is_default')->first();
            $cart->setSelectedAddress($request, $nextAddress?->id);
        }

        return back()->with('status', __('Address removed from your saved addresses.'));
    }

    public function makeDefault(Request $request, UserAddress $address, CartService $cart): RedirectResponse
    {
        $this->authorizeAddress($request, $address);

        $request->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);
        $cart->setSelectedAddress($request, $address->id);

        return back();
    }

    private function authorizeAddress(Request $request, UserAddress $address): void
    {
        abort_unless($address->user_id === $request->user()?->id, 403);
    }
}
