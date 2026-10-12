import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { homeBrand } from '@/data/home-brand';
import { mediaUrl } from '@/lib/media-url';
import { cn } from '@/lib/utils';

type HomeLogoProps = {
    variant?: 'header' | 'footer';
    className?: string;
    linkClassName?: string;
};

export function HomeLogo({
    variant = 'header',
    className,
    linkClassName,
}: HomeLogoProps) {
    const isFooter = variant === 'footer';
    const [failed, setFailed] = useState(false);
    const logoSrc = mediaUrl(homeBrand.logoTransparent) ?? homeBrand.logoTransparent;
    const fallbackSrc = mediaUrl(homeBrand.logoOriginal) ?? homeBrand.logoOriginal;

    return (
        <Link
            href="/"
            className={cn(
                'relative z-10 flex shrink-0 items-center',
                isFooter
                    ? 'h-[82px] w-[150px] overflow-hidden rounded-xl bg-[#FCFAF5] p-1'
                    : 'h-[72px] w-[112px] overflow-hidden rounded-lg bg-white/95 p-1 shadow-sm sm:h-[78px] sm:w-[122px]',
                linkClassName,
            )}
        >
            <img
                src={failed ? fallbackSrc : logoSrc}
                alt={`${homeBrand.name} logo`}
                className={cn(
                    'h-full w-full object-contain transition duration-300',
                    className,
                )}
                onError={() => {
                    if (!failed && fallbackSrc !== logoSrc) {
                        setFailed(true);
                    }
                }}
            />
        </Link>
    );
}
