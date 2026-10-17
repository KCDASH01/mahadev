<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('social_stories')
            ->where('overlay_hashtag', '#STYLEWITHBHULIKA')
            ->update(['overlay_hashtag' => '#STYLEWITHMAHADEV']);
    }

    public function down(): void
    {
        // The previous hashtag is not restored.
    }
};
