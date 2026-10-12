export const DEFAULT_HERO_IMAGE_POSITION = 'center top';

export const HERO_MOBILE_MEDIA_QUERY = '(max-width: 767px)';

/**
 * Full-viewport hero slider frame. Shared by image and video media.
 */
export const heroBannerFrameClassName = 'relative h-full w-full overflow-hidden';

/**
 * Shared crop rules for hero image and video.
 */
export const heroMediaElementClassName =
    'absolute inset-0 h-full w-full object-cover';

/**
 * Anchor hero media to the top so heads stay visible; excess crops from the bottom.
 */
export function normalizeHeroImagePosition(position?: string | null): string {
    if (!position?.trim()) {
        return DEFAULT_HERO_IMAGE_POSITION;
    }

    const trimmed = position.trim();

    if (trimmed === 'center' || trimmed === 'center center') {
        return DEFAULT_HERO_IMAGE_POSITION;
    }

    if (/\bcenter\s*$/i.test(trimmed)) {
        return trimmed.replace(/\bcenter\s*$/i, 'top');
    }

    return trimmed;
}

export type HeroSlideMediaSource = {
    image: string | null;
    video: string | null;
    isVideo: boolean;
};

export function resolveHeroSlideMedia(
    slide?: {
        mediaType?: string | null;
        image?: string | null;
        video?: string | null;
        mobileImage?: string | null;
        mobileVideo?: string | null;
        mobile_image?: string | null;
        mobile_video?: string | null;
    } | null,
    isMobile = false,
): HeroSlideMediaSource {
    const desktopImage = slide?.image ?? null;
    const desktopVideo = slide?.mediaType === 'video' ? (slide.video ?? null) : null;
    const mobileImage = slide?.mobileImage ?? slide?.mobile_image ?? null;
    const mobileVideo = slide?.mobileVideo ?? slide?.mobile_video ?? null;

    if (isMobile) {
        if (mobileVideo) {
            return {
                image: mobileImage ?? desktopImage,
                video: mobileVideo,
                isVideo: true,
            };
        }

        if (mobileImage) {
            return {
                image: mobileImage,
                video: null,
                isVideo: false,
            };
        }
    }

    return {
        image: desktopImage,
        video: desktopVideo,
        isVideo: Boolean(desktopVideo),
    };
}

export function isHeroVideoSlide(
    slide?: {
        mediaType?: string | null;
        video?: string | null;
        mobileImage?: string | null;
        mobileVideo?: string | null;
    } | null,
    isMobile = false,
): boolean {
    return resolveHeroSlideMedia(slide, isMobile).isVideo;
}
