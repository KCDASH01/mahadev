<?php

namespace App\Console\Commands;

use Illuminate\Foundation\Console\ServeCommand as BaseServeCommand;
use Illuminate\Support\Str;

class ServeCommand extends BaseServeCommand
{
    /**
     * @return array<int, string>
     */
    protected function serverCommand(): array
    {
        $command = parent::serverCommand();

        $uploadTmpDir = storage_path('framework/tmp');

        if (! is_dir($uploadTmpDir)) {
            mkdir($uploadTmpDir, 0755, true);
        }

        // Do not pass `-c php.ini` here: that replaces the system php.ini entirely and
        // disables extensions such as pdo_mysql. Use `-d` overrides only.
        array_splice($command, 1, 0, [
            '-d', 'upload_tmp_dir='.Str::replace('\\', '/', $uploadTmpDir),
            '-d', 'upload_max_filesize=50M',
            '-d', 'post_max_size=55M',
        ]);

        return $command;
    }
}
