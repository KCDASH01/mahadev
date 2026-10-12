<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'order_id',
    'velocity_order_id',
    'velocity_shipment_id',
    'awb_number',
    'warehouse_id',
    'courier_name',
    'carrier_id',
    'tracking_url',
    'label_url',
    'manifest_url',
    'shipping_charge',
    'cod_charge',
    'weight',
    'length',
    'breadth',
    'height',
    'shipment_status',
    'tracking_status',
    'pickup_status',
    'pickup_date',
    'delivery_date',
    'cancelled_at',
    'last_tracked_at',
    'pickup_generated',
    'manifest_generated',
    'failure_reason',
    'api_response',
])]
class ShippingShipment extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_CREATED = 'created';

    public const STATUS_FAILED = 'failed';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_DELIVERED = 'delivered';

    /**
     * @var list<string>
     */
    protected $hidden = [
        'api_response',
    ];

    protected function casts(): array
    {
        return [
            'shipping_charge' => 'decimal:2',
            'cod_charge' => 'decimal:2',
            'weight' => 'decimal:2',
            'length' => 'decimal:2',
            'breadth' => 'decimal:2',
            'height' => 'decimal:2',
            'pickup_date' => 'date',
            'delivery_date' => 'date',
            'cancelled_at' => 'datetime',
            'last_tracked_at' => 'datetime',
            'pickup_generated' => 'boolean',
            'manifest_generated' => 'boolean',
            'api_response' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function hasAwb(): bool
    {
        return filled($this->awb_number);
    }

    public function isCancellable(): bool
    {
        return $this->hasAwb()
            && $this->shipment_status !== self::STATUS_CANCELLED
            && $this->shipment_status !== self::STATUS_DELIVERED;
    }
}
