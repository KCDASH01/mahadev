import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import HorizontalScrollRow from '@/components/storefront/horizontal-scroll-row';
import { homeBrand } from '@/data/home-brand';
import { mediaUrl } from '@/lib/media-url';
import type { SocialStoryData, SocialStoryOverlayData } from '@/types/storefront';

function StoryThumbnailPromo({ overlay }: { overlay: SocialStoryOverlayData }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 px-4 text-center text-white">
            {overlay.eyebrow && (
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase sm:text-xs">{overlay.eyebrow}</p>
            )}
            <p className="mt-2 border border-white/80 px-4 py-1 font-helvetica text-xl font-medium tracking-wide sm:text-2xl">
                {overlay.title}
            </p>
            <p className="mt-3 text-sm font-bold tracking-wide sm:text-base">{overlay.discount}</p>
        </div>
    );
}

function StoryModalOverlay({ overlay }: { overlay: SocialStoryOverlayData }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 px-6 text-center text-white">
            <img
                src={mediaUrl(homeBrand.logoTransparent) ?? homeBrand.logoTransparent}
                alt={homeBrand.name}
                className="mb-6 h-8 w-auto brightness-0 invert sm:h-10"
            />
            {overlay.eyebrow && (
                <p className="text-xs font-medium tracking-[0.25em] uppercase sm:text-sm">{overlay.eyebrow}</p>
            )}
            <p className="mt-3 border border-white/80 px-6 py-2 font-helvetica text-3xl font-medium tracking-wide sm:text-4xl">
                {overlay.title}
            </p>
            <p className="mt-4 text-2xl font-bold tracking-wide sm:text-3xl">{overlay.discount}</p>
            {overlay.note && (
                <p className="mt-5 max-w-xs text-[10px] leading-relaxed font-medium tracking-wide uppercase sm:text-xs">
                    {overlay.note}
                </p>
            )}
            {overlay.hashtag && <p className="mt-4 text-xs font-semibold tracking-wide sm:text-sm">{overlay.hashtag}</p>}
            <p className="absolute right-3 bottom-3 text-[10px] text-white/70">*T&amp;C APPLY</p>
        </div>
    );
}

function StoryCard({ story, onOpen }: { story: SocialStoryData; onOpen: () => void }) {
    const imageSrc = mediaUrl(story.image) ?? story.image;
    const videoSrc = story.videoUrl ? (mediaUrl(story.videoUrl) ?? story.videoUrl) : null;
    const isVideo = story.type === 'video' && videoSrc;

    return (
        <button
            type="button"
            onClick={onOpen}
            className="group relative aspect-[3/4] w-[188px] shrink-0 snap-start overflow-hidden rounded-2xl bg-neutral-100 sm:w-[220px] lg:w-[240px]"
        >
            {isVideo ? (
                <video
                    src={videoSrc}
                    poster={imageSrc}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="h-full w-full object-cover"
                />
            ) : (
                <img
                    src={imageSrc}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
            )}
            {isVideo && (
                <div className="pointer-events-none absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/45">
                    <Play className="h-4 w-4 fill-white text-white" />
                </div>
            )}
            {story.showThumbnailPromo && story.overlay && <StoryThumbnailPromo overlay={story.overlay} />}
        </button>
    );
}

function StoryModal({
    story,
    onClose,
    onPrev,
    onNext,
    hasPrev,
    hasNext,
}: {
    story: SocialStoryData;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    hasPrev: boolean;
    hasNext: boolean;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const imageSrc = mediaUrl(story.image) ?? story.image;
    const videoSrc = story.videoUrl ? (mediaUrl(story.videoUrl) ?? story.videoUrl) : null;

    useEffect(() => {
        const video = videoRef.current;
        if (!video || story.type !== 'video') {
            return;
        }

        void video.play().catch(() => undefined);
    }, [story.id, story.type]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-8">
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center text-white transition hover:opacity-70 sm:top-6 sm:right-6"
                aria-label="Close story"
            >
                <X className="h-7 w-7" />
            </button>

            {hasPrev && (
                <button
                    type="button"
                    onClick={onPrev}
                    className="absolute top-1/2 left-2 z-10 hidden -translate-y-1/2 items-center justify-center border border-[#E8DDC5] bg-[#FCFAF5] p-3 text-[#09233D] shadow-sm transition hover:border-[#062A4D] hover:text-[#062A4D] sm:left-6 sm:flex"
                    aria-label="Previous story"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
            )}

            <div className="relative aspect-[3/4] max-h-[85vh] w-full max-w-sm overflow-hidden bg-[#09233D] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]">
                {story.type === 'video' && videoSrc ? (
                    <video
                        ref={videoRef}
                        key={story.id}
                        src={videoSrc}
                        poster={imageSrc}
                        loop
                        playsInline
                        controls
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <img src={imageSrc} alt="" className="h-full w-full object-cover" />
                )}
                {story.overlay && <StoryModalOverlay overlay={story.overlay} />}
            </div>

            {hasNext && (
                <button
                    type="button"
                    onClick={onNext}
                    className="absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 items-center justify-center border border-[#E8DDC5] bg-[#FCFAF5] p-3 text-[#09233D] shadow-sm transition hover:border-[#062A4D] hover:text-[#062A4D] sm:right-6 sm:flex"
                    aria-label="Next story"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            )}
        </div>
    );
}

export function HomeSocialStories({ stories = [] }: { stories?: SocialStoryData[] }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const openStory = (index: number) => setActiveIndex(index);
    const closeStory = () => setActiveIndex(null);

    const goPrev = useCallback(() => {
        setActiveIndex((current) => (current !== null && current > 0 ? current - 1 : current));
    }, []);

    const goNext = useCallback(() => {
        setActiveIndex((current) =>
            current !== null && current < stories.length - 1 ? current + 1 : current,
        );
    }, [stories.length]);

    useEffect(() => {
        if (activeIndex === null) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeStory();
            }
            if (event.key === 'ArrowLeft') {
                goPrev();
            }
            if (event.key === 'ArrowRight') {
                goNext();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [activeIndex, goNext, goPrev]);

    if (stories.length === 0) {
        return null;
    }

    const activeStory = activeIndex !== null ? stories[activeIndex] : null;

    return (
        <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="text-center">
                    <p className="text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">Community</p>
                    <h2 className="mt-3 font-helvetica text-3xl font-medium tracking-tight text-[#09233D] sm:text-[2.15rem]">
                        Social Stories @{homeBrand.instagramHandle}
                    </h2>
                    <HomeBrandMotif className="mt-4" />
                </div>

                <div className="relative mt-8">
                    <HorizontalScrollRow className="px-1" itemClassName="gap-4 py-1">
                        {stories.map((story, index) => (
                            <StoryCard key={story.id} story={story} onOpen={() => openStory(index)} />
                        ))}
                    </HorizontalScrollRow>
                </div>
            </div>

            {activeStory && activeIndex !== null && (
                <StoryModal
                    story={activeStory}
                    onClose={closeStory}
                    onPrev={goPrev}
                    onNext={goNext}
                    hasPrev={activeIndex > 0}
                    hasNext={activeIndex < stories.length - 1}
                />
            )}
        </section>
    );
}
