<?php

namespace App\Http\Requests\Admin\Concerns;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

trait ValidatesAdminImageUploads
{
    /**
     * @param  array<int, string>  $fields
     */
    protected function addImageUploadFailureMessages(Validator $validator, array $fields): void
    {
        $validator->after(function (Validator $validator) use ($fields): void {
            foreach ($fields as $field) {
                $file = $this->file($field);

                if (! $file instanceof UploadedFile) {
                    continue;
                }

                if (! $file->isValid()) {
                    Log::warning('Admin image upload failed at PHP layer', [
                        'field' => $field,
                        'error_code' => $file->getError(),
                        'error_message' => $file->getErrorMessage(),
                        'client_name' => $file->getClientOriginalName(),
                        'size' => $file->getSize(),
                        'upload_tmp_dir' => ini_get('upload_tmp_dir'),
                        'upload_max_filesize' => ini_get('upload_max_filesize'),
                        'post_max_size' => ini_get('post_max_size'),
                    ]);

                    $validator->errors()->add(
                        $field,
                        $this->imageUploadErrorMessage($file),
                    );
                }
            }
        });
    }

    protected function imageUploadErrorMessage(UploadedFile $file): string
    {
        return match ($file->getError()) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => __(
                'The image is too large. Please use a file under :size MB or compress it before uploading.',
                ['size' => 20],
            ),
            UPLOAD_ERR_PARTIAL => __('The image upload was interrupted. Please try again.'),
            UPLOAD_ERR_NO_FILE => __('Please choose an image file to upload.'),
            UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE => __(
                'The server could not store the uploaded file temporarily. Restart `composer run dev` and ensure storage/framework/tmp is writable.',
            ),
            default => __(
                'The image could not be uploaded. Use JPG, PNG, GIF, or WebP under :size MB.',
                ['size' => 20],
            ),
        };
    }
}
