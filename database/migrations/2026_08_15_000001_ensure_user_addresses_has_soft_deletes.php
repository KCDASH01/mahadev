<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_addresses') && ! Schema::hasColumn('user_addresses', 'deleted_at')) {
            Schema::table('user_addresses', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('user_addresses') && Schema::hasColumn('user_addresses', 'deleted_at')) {
            Schema::table('user_addresses', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
