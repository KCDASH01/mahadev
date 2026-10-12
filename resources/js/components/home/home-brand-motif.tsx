import { cn } from '@/lib/utils';

type HomeBrandMotifProps = {
    className?: string;
    variant?: 'divider' | 'rule';
};

export function HomeBrandMotif({ className, variant = 'divider' }: HomeBrandMotifProps) {
    if (variant === 'rule') {
        return (
            <span
                className={cn('mx-auto block h-px w-12 bg-[#062A4D]/35', className)}
                aria-hidden
            />
        );
    }

    return (
        <svg
            viewBox="0 0 168 14"
            className={cn('mx-auto h-3 w-[7.5rem] text-[#062A4D]', className)}
            fill="currentColor"
            aria-hidden
        >
            <path d="M8 11.5 14 2l6 9.5H8Z" opacity="0.28" />
            <path d="M26 11.5 32 1.5 38 11.5H26Z" opacity="0.72" />
            <path d="M44 11.5 50 2.2 56 11.5H44Z" opacity="0.4" />
            <path d="M62 11.5 70 1 78 11.5H62Z" opacity="0.9" />
            <path d="M84 11.5 90 2.4 96 11.5H84Z" opacity="0.38" />
            <path d="M102 11.5 108 1.5 114 11.5H102Z" opacity="0.72" />
            <path d="M120 11.5 126 2 132 11.5H120Z" opacity="0.28" />
            <path d="M138 11.5 144 1.8 150 11.5H138Z" opacity="0.55" />
            <rect x="4" y="12.2" width="160" height="0.9" opacity="0.55" />
        </svg>
    );
}
