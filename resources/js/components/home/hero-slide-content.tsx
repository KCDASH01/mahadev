import { Link } from '@inertiajs/react';
import type { HeroSlide } from '@/types/storefront';

type HeroSlideContentProps = {
    slide?: HeroSlide | null;
};

function HeroPromoText({ text }: { text: string }) {
    const priceMatch = text.match(/(₹[\d,]+(?:\.\d+)?|\d+%\s*OFF)/i);

    if (priceMatch) {
        const highlight = priceMatch[1];
        const label = text.replace(highlight, '').replace(/\s+/g, ' ').trim();

        return (
            <div className="mt-6">
                {label && (
                    <p className="text-[11px] font-medium tracking-[0.24em] text-white/80 uppercase sm:text-xs">
                        {label}
                    </p>
                )}
                <p className="mt-1 font-helvetica text-[clamp(2rem,4vw,3rem)] leading-none font-medium tracking-tight text-white">
                    {highlight}
                </p>
            </div>
        );
    }

    return (
        <p className="mt-6 font-helvetica text-[clamp(1.5rem,3vw,2.25rem)] leading-tight font-medium tracking-tight text-white">
            {text}
        </p>
    );
}

export function HeroSlideContent({ slide }: HeroSlideContentProps) {
    if (!slide) {
        return null;
    }

    const hasHeading = Boolean(slide.accentLine || slide.mainLine);
    const ctaLabel = slide.cta?.label ?? '';
    const ctaHref = slide.cta?.href || '/';
    const hasCta = Boolean(ctaLabel);

    if (!hasHeading && !slide.tagline && !slide.promoText && !hasCta) {
        return null;
    }

    return (
        <div className="relative z-10 flex h-full items-end px-4 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
            <div className="w-full max-w-3xl text-white">
                {hasHeading && (
                    <h1 className="space-y-1 leading-none">
                        {slide.accentLine && (
                            <span className="block font-helvetica text-[clamp(2rem,5.5vw,3.5rem)] font-normal italic tracking-[0.02em] text-white/90">
                                {slide.accentLine}
                            </span>
                        )}
                        {slide.mainLine && (
                            <span className="block font-helvetica text-[clamp(2.5rem,7vw,4.75rem)] font-medium tracking-[0.01em] text-white">
                                {slide.mainLine}
                            </span>
                        )}
                    </h1>
                )}
                {slide.tagline && (
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/85 sm:mt-5 sm:text-base">
                        {slide.tagline}
                    </p>
                )}
                {slide.promoText && <HeroPromoText text={slide.promoText} />}
                {hasCta && (
                    <Link
                        href={ctaHref}
                        className="mt-8 inline-flex h-12 min-w-[168px] items-center justify-center rounded-full bg-white px-10 text-[11px] font-semibold tracking-[0.22em] text-[#222222] uppercase shadow-sm transition hover:bg-white/90 sm:h-[52px] sm:min-w-[180px] sm:text-xs"
                    >
                        {ctaLabel}
                    </Link>
                )}
            </div>
        </div>
    );
}
