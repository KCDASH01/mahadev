import { useState } from 'react';
import MediaInput from '@/components/admin/media-input';
import VideoInput from '@/components/admin/video-input';
import { HeroSlideFocusPreview } from '@/components/admin/hero-slide-focus-preview';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { mediaUrl } from '@/lib/media-url';
import type { Banner } from '@/types/admin';

type BannerFormFieldsProps = {
    banner?: Banner;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function BannerFormFields({
    banner,
    errors,
    processing,
    submitLabel,
}: BannerFormFieldsProps) {
    const [imagePosition, setImagePosition] = useState(banner?.image_position ?? 'center top');
    const [mediaType, setMediaType] = useState<'image' | 'video'>(
        banner?.media_type === 'video' ? 'video' : 'image',
    );
    const [videoPreview, setVideoPreview] = useState<string | null>(
        mediaUrl(banner?.video) ?? banner?.video ?? null,
    );

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="title">Admin label</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={banner?.title}
                    required
                    placeholder="Pyjama Pants slide"
                />
                <p className="text-xs text-muted-foreground">
                    Internal name for admin reference only.
                </p>
                <InputError message={errors.title} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="accent_line">Accent line</Label>
                    <Input
                        id="accent_line"
                        name="accent_line"
                        defaultValue={banner?.accent_line ?? ''}
                        placeholder="PYJAMA"
                    />
                    <p className="text-xs text-muted-foreground">Optional. Leave blank for a media-only slide.</p>
                    <InputError message={errors.accent_line} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="main_line">Main line</Label>
                    <Input
                        id="main_line"
                        name="main_line"
                        defaultValue={banner?.main_line ?? ''}
                        placeholder="PANTS"
                    />
                    <InputError message={errors.main_line} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                    id="tagline"
                    name="tagline"
                    defaultValue={banner?.tagline ?? ''}
                    placeholder="Comfort you can wear all day."
                />
                <InputError message={errors.tagline} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="promo_text">Promo text</Label>
                <Input
                    id="promo_text"
                    name="promo_text"
                    defaultValue={banner?.promo_text ?? ''}
                    placeholder="UPTO 60% OFF"
                />
                <InputError message={errors.promo_text} />
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between gap-4">
                    <Label>Media type</Label>
                    <ToggleGroup
                        type="single"
                        value={mediaType}
                        onValueChange={(value) => {
                            if (value === 'image' || value === 'video') {
                                setMediaType(value);
                            }
                        }}
                        variant="outline"
                        size="sm"
                    >
                        <ToggleGroupItem value="image" aria-label="Image banner">
                            Image
                        </ToggleGroupItem>
                        <ToggleGroupItem value="video" aria-label="Video banner">
                            Video
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <input type="hidden" name="media_type" value={mediaType} />
                <p className="text-xs text-muted-foreground">
                    Image and video use the same full-width hero crop. Existing
                    image slides are unchanged.
                </p>
                <InputError message={errors.media_type} />
            </div>

            {mediaType === 'image' ? (
                <MediaInput
                    label="Hero image"
                    urlFieldName="image"
                    fileFieldName="image_file"
                    currentValue={banner?.image}
                    errors={errors}
                    urlPlaceholder="https://example.com/hero.jpg"
                />
            ) : (
                <>
                    <VideoInput
                        label="Hero video"
                        urlFieldName="video"
                        fileFieldName="video_file"
                        currentValue={banner?.video}
                        errors={errors}
                        urlPlaceholder="https://example.com/hero.mp4"
                        hidePreview
                        onPreviewChange={setVideoPreview}
                        helperText="MP4, WebM, or MOV up to 50MB. Autoplay is muted, looped, and inline on mobile. Crop is previewed below."
                    />
                    <MediaInput
                        label="Poster image (optional)"
                        urlFieldName="image"
                        fileFieldName="image_file"
                        currentValue={banner?.image}
                        errors={errors}
                        urlPlaceholder="https://example.com/hero-poster.jpg"
                        helperText="Shown while the video loads and as a fallback if autoplay is blocked. JPG, PNG, GIF, or WebP."
                    />
                </>
            )}

            <div className="grid gap-4 rounded-lg border border-dashed p-4">
                <div>
                    <p className="text-sm font-medium">Mobile media (optional)</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Shown on phones (under 768px). If you leave these empty, the
                        desktop image or video is used.
                    </p>
                </div>
                <MediaInput
                    label="Mobile image"
                    urlFieldName="mobile_image"
                    fileFieldName="mobile_image_file"
                    currentValue={banner?.mobile_image}
                    errors={errors}
                    urlPlaceholder="https://example.com/hero-mobile.jpg"
                    helperText="Portrait crop works best, around 1080 × 1920 px. JPG, PNG, GIF, or WebP up to 20MB."
                />
                <VideoInput
                    label="Mobile video"
                    urlFieldName="mobile_video"
                    fileFieldName="mobile_video_file"
                    currentValue={banner?.mobile_video}
                    errors={errors}
                    urlPlaceholder="https://example.com/hero-mobile.mp4"
                    helperText="Optional. MP4, WebM, or MOV up to 50MB. If set, this plays on phones instead of the desktop video."
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="image_position">Media focus position</Label>
                <Input
                    id="image_position"
                    name="image_position"
                    value={imagePosition}
                    onChange={(event) => setImagePosition(event.target.value)}
                    placeholder="center top"
                />
                <InputError message={errors.image_position} />
                <HeroSlideFocusPreview
                    mediaType={mediaType}
                    image={banner?.image}
                    video={videoPreview}
                    position={imagePosition}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cta_label">Button label</Label>
                    <Input
                        id="cta_label"
                        name="cta_label"
                        defaultValue={banner?.cta_label ?? ''}
                        placeholder="SHOP NOW"
                    />
                    <InputError message={errors.cta_label} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="link">Button link</Label>
                    <Input
                        id="link"
                        name="link"
                        defaultValue={banner?.link ?? ''}
                        placeholder="/collection/men"
                    />
                    <InputError message={errors.link} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="sort_order">Sort order</Label>
                    <Input
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        min={0}
                        defaultValue={banner?.sort_order ?? 0}
                    />
                    <InputError message={errors.sort_order} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="status">Visibility on website</Label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={banner?.status ?? 'active'}
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    >
                        <option value="active">Visible</option>
                        <option value="inactive">Hidden</option>
                    </select>
                    <InputError message={errors.status} />
                </div>
            </div>

            <Button type="submit" disabled={processing}>
                {submitLabel}
            </Button>
        </>
    );
}
