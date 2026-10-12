<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\DelhiveryApiException;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\DelhiveryService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Throwable;

class OrderShipmentController extends Controller
{
    /**
     * Example: create a Delhivery shipment for a confirmed order.
     *
     *   $delhivery->createShipment($shipmentData, 'BHULIKA B2C');
     *
     * The order-aware helper below maps the order address/items and stores AWB details.
     */
    public function create(Order $order, DelhiveryService $delhivery): RedirectResponse
    {
        try {
            $delhivery->createShipmentForOrder($order->load(['items', 'user']));

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => __('Delhivery shipment created successfully.'),
            ]);
        } catch (Throwable $exception) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $this->message($exception),
            ]);
        }

        return back();
    }

    public function track(Order $order, DelhiveryService $delhivery): RedirectResponse
    {
        $shipment = $order->shipment;

        if (! $shipment) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('No shipment record found for this order.'),
            ]);

            return back();
        }

        try {
            $delhivery->trackShipment($shipment);
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => __('Shipment tracking refreshed.'),
            ]);
        } catch (Throwable $exception) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $this->message($exception),
            ]);
        }

        return back();
    }

    public function cancel(Order $order, DelhiveryService $delhivery): RedirectResponse
    {
        $shipment = $order->shipment;

        if (! $shipment) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('No shipment record found for this order.'),
            ]);

            return back();
        }

        try {
            $delhivery->cancelShipment($shipment);
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => __('Shipment cancelled successfully.'),
            ]);
        } catch (Throwable $exception) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $this->message($exception),
            ]);
        }

        return back();
    }

    private function message(Throwable $exception): string
    {
        if ($exception instanceof DelhiveryApiException) {
            $message = trim($exception->getMessage());

            return $message !== '' ? $message : __('Delhivery request failed. Please try again.');
        }

        $message = trim($exception->getMessage());

        return $message !== '' ? $message : __('Delhivery shipping request failed. Please try again.');
    }
}
