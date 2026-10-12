<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingApiLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'shipping_shipment_id',
        'endpoint',
        'method',
        'response_status',
        'request_headers',
        'request_body',
        'response_body',
        'duration_ms',
        'error_message',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'request_headers' => 'array',
            'request_body' => 'array',
            'response_body' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(ShippingShipment::class, 'shipping_shipment_id');
    }
}
