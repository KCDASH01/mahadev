import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mediaUrl } from '@/lib/media-url';
import {
    heroBannerFrameClassName,
    isHeroVideoSlide,
} from '@/lib/hero-image-position';
import { HeroSlideContent } from '@/components/home/hero-slide-content';
import { HeroSlideMedia } from '@/components/home/hero-slide-media';
import type { HeroSlide } from '@/types/storefront';

const AUTOPLAY_MS = 5500;
const SWIPE_THRESHOLD_PX = 48;

function usePrefersReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(media.matches);

        update();
        media.addEventListener('change', update);

        return () => media.removeEventListener('change', update);
    }, []);

    return prefersReducedMotion;
}

export function HomeHero({ slides }: { slides?: HeroSlide[] | null }) {
    const safeSlides = useMemo(
        () =>
            Array.isArray(slides)
                ? slides.filter(
                      (slide): slide is HeroSlide =>
                          Boolean(slide) &&
                          (Boolean(slide.image) || isHeroVideoSlide(slide)),
                  )
                : [],
        [slides],
    );
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [videoMuted, setVideoMuted] = useState(true);
    const touchStartX = useRef<number | null>(null);
    const touchDeltaX = useRef(0);
    const prefersReducedMotion = usePrefersReducedMotion();

    const slideCount = safeSlides.length;
    const activeSlide = safeSlides[index] ?? null;
    const hasDesktopVideo = isHeroVideoSlide(activeSlide, false);
    const hasMobileVideo = isHeroVideoSlide(activeSlide, true);
    const showMuteControl =
        Boolean(activeSlide) &&
        (hasDesktopVideo || hasMobileVideo) &&
        !prefersReducedMotion;

    const goTo = useCallback(
        (nextIndex: number) => {
            if (slideCount === 0) {
                return;
            }

            setIndex((nextIndex + slideCount) % slideCount);
        },
        [slideCount],
    );

    const next = useCallback(() => goTo(index + 1), [goTo, index]);
    const prev = useCallback(() => goTo(index - 1), [goTo, index]);

    useEffect(() => {
        if (slideCount === 0) {
            setIndex(0);
            return;
        }

        setIndex((current) => current % slideCount);
    }, [slideCount]);

    useEffect(() => {
        safeSlides.forEach((slide) => {
            [slide.image, slide.mobileImage].forEach((src) => {
                if (!src) {
                    return;
                }

                const img = new Image();
                img.src = mediaUrl(src) ?? src;
            });
        });
    }, [safeSlides]);

    useEffect(() => {
        if (slideCount <= 1 || isPaused) {
            return;
        }

        const timer = window.setInterval(() => {
            setIndex((current) => (current + 1) % slideCount);
        }, AUTOPLAY_MS);

        return () => window.clearInterval(timer);
    }, [isPaused, slideCount]);

    const handleTouchStart = (event: React.TouchEvent) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
        touchDeltaX.current = 0;
        setIsPaused(true);
    };

    const handleTouchMove = (event: React.TouchEvent) => {
        if (touchStartX.current === null) {
            return;
        }

        touchDeltaX.current = event.touches[0].clientX - touchStartX.current;
    };

    const handleTouchEnd = () => {
        if (Math.abs(touchDeltaX.current) >= SWIPE_THRESHOLD_PX) {
            if (touchDeltaX.current < 0) {
                next();
            } else {
                prev();
            }
        }

        touchStartX.current = null;
        touchDeltaX.current = 0;

        window.setTimeout(() => setIsPaused(false), AUTOPLAY_MS);
    };

    if (slideCount === 0) {
        return null;
    }

    return (
        <section className="hero relative h-[calc(100svh-var(--home-announcement-offset))] min-h-[520px] w-full overflow-x-hidden bg-neutral-900">
            <div
                className={`group/slider ${heroBannerFrameClassName}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {safeSlides.map((slide, slideIndex) => (
                        <div
                            key={slide.id}
                            className="relative h-full w-full shrink-0"
                        >
                            <div className="hero-media absolute inset-0">
                                <HeroSlideMedia
                                    slide={slide}
                                    isActive={slideIndex === index}
                                    muted={videoMuted}
                                    preferReducedMotion={prefersReducedMotion}
                                    preload={
                                        slideIndex === index ||
                                        slideIndex === (index + 1) % slideCount
                                            ? 'metadata'
                                            : 'none'
                                    }
                                    loading={slideIndex === 0 ? 'eager' : 'lazy'}
                                />
                            </div>

                            <div className="hero-content relative z-10 h-full">
                                <HeroSlideContent slide={slide} />
                            </div>
                        </div>
                    ))}
                </div>

                {slideCount > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            className="absolute top-1/2 left-4 z-20 hidden -translate-y-1/2 rounded-full border border-white/40 bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-6 sm:flex"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            className="absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 rounded-full border border-white/40 bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-6 sm:flex"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </>
                )}

                {showMuteControl && (
                    <button
                        type="button"
                        onClick={() => setVideoMuted((current) => !current)}
                        className={`hero-video-toggle absolute right-4 bottom-6 z-20 size-10 place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-6 sm:bottom-8 ${
                            hasMobileVideo && hasDesktopVideo
                                ? 'grid'
                                : hasMobileVideo
                                  ? 'grid md:hidden'
                                  : 'hidden md:grid'
                        }`}
                        aria-label={videoMuted ? 'Unmute video' : 'Mute video'}
                    >
                        {videoMuted ? (
                            <VolumeX className="size-4" />
                        ) : (
                            <Volume2 className="size-4" />
                        )}
                    </button>
                )}
            </div>
        </section>
    );
}
