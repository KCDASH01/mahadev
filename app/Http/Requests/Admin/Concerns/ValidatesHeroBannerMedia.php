<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Models\Banner;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

trait ValidatesHeroBannerMedia
{
    /**
     * @return array<string, mixed>
     */
    protected function heroBannerMediaRules(): array
    {
        return [
            'media_type' => ['required', Rule::in([Banner::MEDIA_TYPE_IMAGE, Banner::MEDIA_TYPE_VIDEO])],
            'image' => ['nullable', 'string', 'max:2048'],
            'image_file' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:20480'],
            'video' => ['nullable', 'string', 'max:2048'],
            'video_file' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:51200'],
            'mobile_image' => ['nullable', 'string', 'max:2048'],
            'mobile_image_file' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:20480'],
            'mobile_video' => ['nullable', 'string', 'max:2048'],
            'mobile_video_file' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:51200'],
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function heroBannerMediaMessages(): array
    {
        return [
            'image_file.max' => __('The hero image must not be larger than 20 MB.'),
            'image_file.required_without' => __('Please upload a hero image or provide an image URL.'),
            'video_file.max' => __('The hero video must not be larger than 50 MB.'),
            'video_file.mimetypes' => __('The hero video must be an MP4, WebM, or MOV file.'),
            'mobile_image_file.max' => __('The mobile hero image must not be larger than 20 MB.'),
            'mobile_video_file.max' => __('The mobile hero video must not be larger than 50 MB.'),
            'mobile_video_file.mimetypes' => __('The mobile hero video must be an MP4, WebM, or MOV file.'),
        ];
    }

    protected function addHeroBannerMediaValidation(Validator $validator): void
    {
        $this->addImageUploadFailureMessages($validator, ['image_file', 'mobile_image_file']);
        $this->addVideoUploadFailureMessages($validator, ['video_file', 'mobile_video_file']);

        $validator->after(function (Validator $validator): void {
            $mediaType = $this->input('media_type', Banner::MEDIA_TYPE_IMAGE);
            $existing = $this->existingBanner();

            if ($mediaType === Banner::MEDIA_TYPE_VIDEO) {
                $hasVideo = $this->file('video_file') instanceof UploadedFile
                    || filled($this->input('video'))
                    || filled($existing?->video);

                if (! $hasVideo) {
                    $validator->errors()->add(
                        'video',
                        __('Please upload a hero video or provide a video URL.'),
                    );
                }

                return;
            }

            $hasImage = $this->file('image_file') instanceof UploadedFile
                || filled($this->input('image'))
                || filled($existing?->image);

            if (! $hasImage) {
                $validator->errors()->add(
                    'image',
                    __('Please upload a hero image or provide an image URL.'),
                );
            }
        });
    }

    /**
     * @param  array<int, string>  $fields
     */
    protected function addVideoUploadFailureMessages(Validator $validator, array $fields): void
    {
        $validator->after(function (Validator $validator) use ($fields): void {
            foreach ($fields as $field) {
                $file = $this->file($field);

                if (! $file instanceof UploadedFile || $file->isValid()) {
                    continue;
                }

                $validator->errors()->add($field, match ($file->getError()) {
                    UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => __(
                        'The video is too large. Please use a file under :size MB.',
                        ['size' => 50],
                    ),
                    UPLOAD_ERR_PARTIAL => __('The video upload was interrupted. Please try again.'),
                    default => __('The video could not be uploaded. Use MP4, WebM, or MOV under 50 MB.'),
                });
            }
        });
    }

    protected function existingBanner(): ?Banner
    {
        $banner = $this->route('banner');

        return $banner instanceof Banner ? $banner : null;
    }
}
