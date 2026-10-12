import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { mediaUrl } from '@/lib/media-url';
import { cn } from '@/lib/utils';
import type { LookbookSectionData } from '@/types/storefront';

type VideoOrientation = 'portrait' | 'landscape' | 'square';

function resolveVideoOrientation(video: HTMLVideoElement): VideoOrientation {
    const { videoWidth, videoHeight } = video;

    if (!videoWidth || !videoHeight) {
        return 'landscape';
    }

    const ratio = videoWidth / videoHeight;

    if (ratio < 0.95) {
        return 'portrait';
    }

    if (ratio > 1.05) {
        return 'landscape';
    }

    return 'square';
}

export function HomeVideoSection({ lookbookSection }: { lookbookSection?: LookbookSectionData | null }) {
    const ref = useRef<HTMLElement>(null);
    const backgroundVideoRef = useRef<HTMLVideoElement>(null);
    const modalVideoRef = useRef<HTMLVideoElement>(null);
    const [videoOpen, setVideoOpen] = useState(false);
    const [videoOrientation, setVideoOrientation] = useState<VideoOrientation | null>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

    const videoUrl = lookbookSection?.videoUrl ?? null;
    const resolvedVideoUrl = videoUrl ? (mediaUrl(videoUrl) ?? videoUrl) : null;
    const isPortraitVideo = videoOrientation === 'portrait';

    const handleVideoMetadata = useCallback((event: SyntheticEvent<HTMLVideoElement>) => {
        setVideoOrientation(resolveVideoOrientation(event.currentTarget));
    }, []);

    const openVideo = useCallback(() => {
        if (!resolvedVideoUrl) {
            return;
        }

        setVideoOpen(true);
    }, [resolvedVideoUrl]);

    const handleVideoOpenChange = useCallback((open: boolean) => {
        setVideoOpen(open);

        if (!open && modalVideoRef.current) {
            modalVideoRef.current.pause();
            modalVideoRef.current.currentTime = 0;
        }
    }, []);

    useEffect(() => {
        const backgroundVideo = backgroundVideoRef.current;

        if (!backgroundVideo) {
            return;
        }

        backgroundVideo.load();
        void backgroundVideo.play().catch(() => {
            // Autoplay may be blocked until user interaction.
        });
    }, [resolvedVideoUrl]);

    useEffect(() => {
        if (!videoOpen || !modalVideoRef.current) {
            return;
        }

        const modalVideo = modalVideoRef.current;
        modalVideo.currentTime = 0;
        void modalVideo.play().catch(() => {
            // Browser may block playback until controls are used.
        });
    }, [videoOpen, resolvedVideoUrl]);

    if (!lookbookSection) {
        return null;
    }

    const { eyebrow, title, subtitle, cta, posterImage } = lookbookSection;
    const posterSrc = posterImage ? (mediaUrl(posterImage) ?? posterImage) : null;
    const ctaClassName =
        'mt-8 inline-flex h-11 items-center gap-2 border border-[#FCFAF5] bg-[#FCFAF5] px-7 text-[11px] font-medium tracking-[0.2em] text-[#03182D] uppercase transition hover:bg-transparent hover:text-[#FCFAF5]';

    return (
        <>
            <section
                ref={ref}
                className={cn(
                    'relative overflow-hidden bg-[#03182D]',
                    isPortraitVideo && 'min-h-[520px] sm:min-h-[600px]',
                )}
            >
                <motion.div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center',
                        !isPortraitVideo && 'scale-110',
                    )}
                    style={{ y: imageY }}
                >
                    {resolvedVideoUrl ? (
                        <>
                            {isPortraitVideo && (
                                <video
                                    key={`${resolvedVideoUrl}-backdrop`}
                                    src={resolvedVideoUrl}
                                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    aria-hidden
                                />
                            )}
                            <video
                                key={resolvedVideoUrl}
                                ref={backgroundVideoRef}
                                src={resolvedVideoUrl}
                                className={cn(
                                    'h-full w-full',
                                    isPortraitVideo
                                        ? 'relative z-10 object-contain object-center opacity-70'
                                        : 'object-cover object-top opacity-50',
                                )}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                poster={posterSrc ?? undefined}
                                onLoadedMetadata={handleVideoMetadata}
                            />
                        </>
                    ) : posterSrc ? (
                        <img src={posterSrc} alt={title} className="h-full w-full object-cover object-top opacity-50" />
                    ) : null}
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#03182D]/92 via-[#03182D]/70 to-[#03182D]/35" />

                <div
                    className={cn(
                        'relative mx-auto flex max-w-7xl flex-col items-start justify-center px-4 py-20 sm:px-6 lg:px-8',
                        isPortraitVideo ? 'min-h-[520px] sm:min-h-[600px]' : 'min-h-[420px] sm:min-h-[480px]',
                    )}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-xl text-white"
                    >
                        <p className="text-[11px] font-medium tracking-[0.28em] text-[#F4D77C] uppercase">{eyebrow}</p>
                        <h2 className="mt-3 font-helvetica text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
                        {subtitle && (
                            <p className="mt-4 max-w-lg text-base leading-8 text-white/80">{subtitle}</p>
                        )}
                        {resolvedVideoUrl ? (
                            <button type="button" onClick={openVideo} className={ctaClassName}>
                                {cta.label}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <Link href={cta.href} className={ctaClassName}>
                                {cta.label}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                    </motion.div>
                </div>
            </section>

            {resolvedVideoUrl && (
                <Dialog open={videoOpen} onOpenChange={handleVideoOpenChange}>
                    <DialogContent
                        className={cn(
                            'overflow-hidden border-0 bg-black p-0',
                            isPortraitVideo
                                ? 'w-[min(100%-1rem,24rem)] max-w-[24rem] sm:max-w-[28rem]'
                                : 'sm:max-w-4xl',
                        )}
                    >
                        <DialogTitle className="sr-only">{title}</DialogTitle>
                        <video
                            key={`modal-${resolvedVideoUrl}`}
                            ref={modalVideoRef}
                            src={resolvedVideoUrl}
                            controls
                            playsInline
                            className={cn(
                                'w-full bg-black object-contain',
                                isPortraitVideo ? 'h-auto max-h-[85vh]' : 'aspect-video max-h-[85vh]',
                            )}
                            poster={posterSrc ?? undefined}
                            onLoadedMetadata={handleVideoMetadata}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
