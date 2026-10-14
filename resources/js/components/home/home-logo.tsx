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
                'relative z-10 flex shrink-0 items-center overflow-hidden rounded-md bg-black',
                isFooter ? 'h-[88px] w-[124px]' : 'h-14 w-[79px] sm:h-[68px] sm:w-[96px]',
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
