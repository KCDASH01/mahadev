<?php

namespace App\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait HandlesMediaUpload
{
    protected function resolveMediaField(
        ?UploadedFile $file,
        ?string $url,
        ?string $existing = null,
        string $directory = 'uploads',
    ): ?string {
        if ($file) {
            $this->deleteStoredMedia($existing);

            return $file->store($directory, 'public');
        }

        if (filled($url)) {
            if ($this->isStoredMedia($existing) && $existing !== $url) {
                $this->deleteStoredMedia($existing);
            }

            return $url;
        }

        return $existing;
    }

    protected function deleteStoredMedia(?string $path): void
    {
        if ($this->isStoredMedia($path) && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    protected function isStoredMedia(?string $path): bool
    {
        return filled($path)
            && ! str_starts_with($path, 'http://')
            && ! str_starts_with($path, 'https://');
    }
}
