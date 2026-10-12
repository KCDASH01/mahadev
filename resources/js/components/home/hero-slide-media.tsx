import { useEffect, useRef } from 'react';
import { mediaUrl } from '@/lib/media-url';
import {
    heroMediaElementClassName,
    normalizeHeroImagePosition,
    resolveHeroSlideMedia,
} from '@/lib/hero-image-position';
import type { HeroSlide } from '@/types/storefront';

type HeroSlideMediaProps = {
    slide?: HeroSlide | null;
    isActive: boolean;
    muted: boolean;
    preferReducedMotion: boolean;
    preload?: 'none' | 'metadata' | 'auto';
    loading?: 'eager' | 'lazy';
    onVideoRef?: (node: HTMLVideoElement | null) => void;
};

type MediaLayerProps = {
    imageSrc: string | null;
    videoSrc: string | null;
    isVideo: boolean;
    alt: string;
    objectPosition: string;
    isActive: boolean;
    muted: boolean;
    preferReducedMotion: boolean;
    preload: 'none' | 'metadata' | 'auto';
    loading: 'eager' | 'lazy';
    onVideoRef?: (node: HTMLVideoElement | null) => void;
};

function HeroMediaLayer({
    imageSrc,
    videoSrc,
    isVideo,
    alt,
    objectPosition,
    isActive,
    muted,
    preferReducedMotion,
    preload,
    loading,
    onVideoRef,
}: MediaLayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const showVideo = isVideo && Boolean(videoSrc) && !preferReducedMotion;
    const showPausedVideoFallback = isVideo && Boolean(videoSrc) && preferReducedMotion && !imageSrc;

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !(showVideo || showPausedVideoFallback)) {
            return;
        }

        if (!isActive || showPausedVideoFallback) {
            video.pause();
            if (!showPausedVideoFallback) {
                video.currentTime = 0;
            }
            video.muted = true;
            return;
        }

        video.muted = true;

        void video
            .play()
            .then(() => {
                video.muted = muted;
            })
            .catch(() => {
                // Autoplay can be blocked; poster/image remains visible.
            });
    }, [isActive, muted, showPausedVideoFallback, showVideo, videoSrc]);

    if ((showVideo || showPausedVideoFallback) && videoSrc) {
        return (
            <video
                ref={(node) => {
                    videoRef.current = node;
                    onVideoRef?.(node);
                }}
                className={heroMediaElementClassName}
                style={{ objectPosition }}
                src={videoSrc}
                autoPlay={showVideo && isActive}
                muted={muted}
                loop
                playsInline
                preload={isActive ? preload : 'none'}
                poster={imageSrc ?? undefined}
                aria-hidden
                draggable={false}
            />
        );
    }

    if (imageSrc) {
        return (
            <img
                src={imageSrc}
                alt={alt}
                className={heroMediaElementClassName}
                style={{ objectPosition }}
                loading={loading}
                decoding="async"
                draggable={false}
            />
        );
    }

    return <div className="absolute inset-0 bg-neutral-900" aria-hidden />;
}

export function HeroSlideMedia({
    slide,
    isActive,
    muted,
    preferReducedMotion,
    preload = 'metadata',
    loading = 'lazy',
    onVideoRef,
}: HeroSlideMediaProps) {
    const objectPosition = normalizeHeroImagePosition(slide?.imagePosition);
    const alt = `${slide?.accentLine ?? ''} ${slide?.mainLine ?? ''}`.trim() || 'Hero banner';
    const desktop = resolveHeroSlideMedia(slide, false);
    const mobile = resolveHeroSlideMedia(slide, true);
    const desktopImageSrc = mediaUrl(desktop.image) ?? desktop.image ?? null;
    const mobileImageSrc = mediaUrl(mobile.image) ?? mobile.image ?? null;
    const desktopVideoSrc = mediaUrl(desktop.video) ?? desktop.video ?? null;
    const mobileVideoSrc = mediaUrl(mobile.video) ?? mobile.video ?? null;
    const hasSeparateMobileMedia =
        mobileImageSrc !== desktopImageSrc || mobileVideoSrc !== desktopVideoSrc;

    const shared = {
        objectPosition,
        alt,
        isActive,
        muted,
        preferReducedMotion,
        preload,
        loading,
    };

    if (!hasSeparateMobileMedia) {
        return (
            <HeroMediaLayer
                {...shared}
                imageSrc={desktopImageSrc}
                videoSrc={desktopVideoSrc}
                isVideo={desktop.isVideo}
                onVideoRef={onVideoRef}
            />
        );
    }

    return (
        <>
            <div className="absolute inset-0 md:hidden">
                <HeroMediaLayer
                    {...shared}
                    imageSrc={mobileImageSrc}
                    videoSrc={mobileVideoSrc}
                    isVideo={mobile.isVideo}
                    onVideoRef={mobile.isVideo ? onVideoRef : undefined}
                />
            </div>
            <div className="absolute inset-0 hidden md:block">
                <HeroMediaLayer
                    {...shared}
                    imageSrc={desktopImageSrc}
                    videoSrc={desktopVideoSrc}
                    isVideo={desktop.isVideo}
                    onVideoRef={desktop.isVideo ? onVideoRef : undefined}
                />
            </div>
        </>
    );
}
