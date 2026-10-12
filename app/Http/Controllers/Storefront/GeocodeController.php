<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Services\GeocodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class GeocodeController extends Controller
{
    public function reverse(Request $request, GeocodeService $geocode): JsonResponse
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
        ]);

        try {
            return response()->json(
                $geocode->reverse((float) $validated['lat'], (float) $validated['lng']),
            );
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
    }

    public function pincode(string $pincode, GeocodeService $geocode): JsonResponse
    {
        try {
            return response()->json($geocode->lookupPincode($pincode));
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
    }
}
