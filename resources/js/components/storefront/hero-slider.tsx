// resources/js/components/storefront/hero-slider.tsx
import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Truck, Verified, Shield, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { mediaUrl } from '@/lib/media-url';
import { themeColors } from '@/lib/theme-colors';
import type { HomepageBanner } from '@/types/homepage';

const heroHeightClass =
    'h-[calc(100dvh-7.25rem)] min-h-[500px] sm:min-h-[600px] md:h-[calc(100dvh-8.75rem)]';

export default function HeroSlider({ banners }: { banners: HomepageBanner[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (banners.length <= 1 || !isPlaying || isHovering) return;
        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % banners.length);
        }, 6000);
        return () => window.clearInterval(timer);
    }, [banners.length, isPlaying, isHovering]);

    if (banners.length === 0) {
        return (
            <section className="w-full">
                <div
                    className={`flex ${heroHeightClass} items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500`}
                >
                    <div className="text-center">
                        <Shield className="mx-auto size-12 opacity-50" />
                        <p className="mt-3">Discover our latest medical equipment</p>
                    </div>
                </div>
            </section>
        );
    }

    const goTo = (index: number) => {
        setActiveIndex((index + banners.length) % banners.length);
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 8000);
    };

    const nextSlide = () => goTo(activeIndex + 1);
    const prevSlide = () => goTo(activeIndex - 1);

    return (
        <section
            className="w-full overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div
                ref={sliderRef}
                className={`group relative w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black ${heroHeightClass}`}
            >
                {/* Slides */}
                <div
                    className="flex h-full w-full transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {banners.map((banner, idx) => {
                        const image = mediaUrl(banner.image) ?? banner.image;
                        const isActive = idx === activeIndex;

                        return (
                            <div
                                key={banner.id}
                                className={`relative w-full shrink-0 ${heroHeightClass}`}
                            >
                                {/* Background Image with Parallax Effect */}
                                <div
                                    className="absolute inset-0 transition-transform duration-[8000ms] ease-out"
                                    style={{
                                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={banner.title}
                                        loading={idx === 0 ? "eager" : "lazy"}
                                        referrerPolicy="no-referrer"
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                {/* Enhanced Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                {/* Animated Pattern Overlay */}
                                <div className="absolute inset-0 opacity-30">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 flex items-center">
                                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                                        <div className="max-w-2xl">
                                            {/* Badge with animation */}
                                            <div className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '0ms' }}>
                                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 border border-white/20">
                                                    <Sparkles className="size-3.5 text-yellow-400" />
                                                    <span
                                                        className="text-[11px] font-semibold tracking-wide uppercase"
                                                        style={{ color: themeColors.primary }}
                                                    >
                                                        Limited Time Offer
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Title with gradient text */}
                                            <div className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '150ms' }}>
                                                <h2 className="mt-4 text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                                                    {banner.title.split(' ').map((word, i) => (
                                                        <span key={i} className="inline-block">
                                                            {word}
                                                            {i !== banner.title.split(' ').length - 1 && ' '}
                                                        </span>
                                                    ))}
                                                </h2>
                                            </div>

                                            {/* Description */}
                                            <div className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '300ms' }}>
                                                <p className="mt-4 max-w-lg text-base text-white/90 sm:text-lg md:text-xl">
                                                    Discover genuine medical equipment with certified quality and fast delivery.
                                                </p>
                                            </div>

                                            {/* CTA Buttons */}
                                            <div className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '450ms' }}>
                                                <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                                                    {banner.link && (
                                                        <a
                                                            href={banner.link}
                                                            className="group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-2xl overflow-hidden"
                                                            style={{
                                                                backgroundColor: themeColors.button,
                                                            }}
                                                        >
                                                            <span className="relative z-10">Shop Now</span>
                                                            <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-1" />
                                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                        </a>
                                                    )}

                                                    {/* Trust Badges - Modern Design */}
                                                    <div className="flex flex-wrap gap-4 text-xs text-white/80 sm:text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="rounded-full bg-green-500/20 p-1.5">
                                                                <Verified className="size-3 text-green-400" />
                                                            </div>
                                                            <span>100% Genuine</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="rounded-full bg-blue-500/20 p-1.5">
                                                                <Truck className="size-3 text-blue-400" />
                                                            </div>
                                                            <span>Free Shipping*</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="rounded-full bg-purple-500/20 p-1.5">
                                                                <Clock className="size-3 text-purple-400" />
                                                            </div>
                                                            <span>24/7 Support</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Buttons - Enhanced */}
                {banners.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prevSlide}
                            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-md p-3 text-white transition-all duration-300 hover:bg-white/30 hover:scale-110 opacity-0 group-hover:opacity-100 sm:left-6"
                            aria-label="Previous banner"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            type="button"
                            onClick={nextSlide}
                            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-md p-3 text-white transition-all duration-300 hover:bg-white/30 hover:scale-110 opacity-0 group-hover:opacity-100 sm:right-6"
                            aria-label="Next banner"
                        >
                            <ChevronRight className="size-5" />
                        </button>

                        {/* Progress Bar Indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                                className="h-full transition-all duration-7000 ease-linear"
                                style={{
                                    width: `${((activeIndex + 1) / banners.length) * 100}%`,
                                    backgroundColor: themeColors.primary,
                                    transitionDuration: isPlaying && !isHovering ? '6000ms' : '0ms'
                                }}
                            />
                        </div>

                        {/* Dots Indicator - Modern */}
                        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3 sm:bottom-8">
                            {banners.map((banner, index) => (
                                <button
                                    key={banner.id}
                                    type="button"
                                    onClick={() => goTo(index)}
                                    className="group relative"
                                    aria-label={`Go to banner ${index + 1}`}
                                >
                                    <div
                                        className={`transition-all duration-300 ${
                                            index === activeIndex
                                                ? 'h-2 w-8 rounded-full'
                                                : 'h-2 w-2 rounded-full bg-white/40 hover:bg-white/70'
                                        }`}
                                        style={{
                                            backgroundColor: index === activeIndex ? themeColors.primary : undefined,
                                            background: index === activeIndex ? undefined : 'rgba(255,255,255,0.4)',
                                        }}
                                    />
                                    {index === activeIndex && (
                                        <div
                                            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            {banner.title}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </section>
    );
}


