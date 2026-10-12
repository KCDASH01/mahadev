import { mediaUrl } from '@/lib/media-url';
import {
    heroBannerFrameClassName,
    heroMediaElementClassName,
    normalizeHeroImagePosition,
} from '@/lib/hero-image-position';

type HeroSlideFocusPreviewProps = {
    image?: string | null;
    video?: string | null;
    mediaType?: 'image' | 'video';
    position: string;
};

export function HeroSlideFocusPreview({
    image,
    video,
    mediaType = 'image',
    position,
}: HeroSlideFocusPreviewProps) {
    const previewImage = mediaUrl(image) ?? image;
    const previewVideo = mediaUrl(video) ?? video;
    const objectPosition = normalizeHeroImagePosition(position);
    const showVideo = mediaType === 'video' && Boolean(previewVideo);

    if (!showVideo && !previewImage) {
        return null;
    }

    return (
        <div className="grid gap-2">
            <p className="text-xs font-medium text-muted-foreground">
                {showVideo ? 'Storefront video preview' : 'Storefront crop preview'}
            </p>
            <div className="overflow-hidden rounded-lg border bg-neutral-900">
                <div className="relative h-48 w-full sm:h-64 lg:h-72">
                    <div className={heroBannerFrameClassName}>
                        {showVideo ? (
                            <video
                                src={previewVideo ?? undefined}
                                poster={previewImage ?? undefined}
                                className={heroMediaElementClassName}
                                style={{ objectPosition }}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                aria-hidden
                            />
                        ) : (
                            <img
                                src={previewImage ?? ''}
                                alt="Hero focus preview"
                                className={heroMediaElementClassName}
                                style={{ objectPosition }}
                            />
                        )}
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Matches the homepage hero crop. Media fills the frame with{' '}
                <span className="font-medium">object-fit: cover</span> (crop,
                no black bars). Images and videos share the same focus
                position — adjust horizontal framing with the first value
                (e.g. <span className="font-medium">65% top</span>).
            </p>
        </div>
    );
}
