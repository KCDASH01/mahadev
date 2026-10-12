<?php

namespace App\Console\Commands;

use App\Services\DelhiveryService;
use Illuminate\Console\Command;

class SyncDelhiveryShipmentsCommand extends Command
{
    protected $signature = 'delhivery:sync-shipments';

    protected $description = 'Refresh in-transit Delhivery shipment tracking statuses';

    public function handle(DelhiveryService $delhivery): int
    {
        if (! $delhivery->isEnabled()) {
            $this->warn('Delhivery shipping is disabled or not configured.');

            return self::SUCCESS;
        }

        $synced = $delhivery->syncActiveShipments();

        $this->info("Synced {$synced} shipment(s).");

        return self::SUCCESS;
    }
}
