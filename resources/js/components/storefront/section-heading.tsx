// resources/js/components/storefront/section-heading.tsx
import { themeColors } from '@/lib/theme-colors';
import { Sparkles } from 'lucide-react';

type SectionHeadingProps = {
    title: string;
    description?: string;
    align?: 'left' | 'center';
    withIcon?: boolean;
    className?: string;
};

export default function SectionHeading({
    title,
    description,
    align = 'left',
    withIcon = true,
    className = '',
}: SectionHeadingProps) {
    const alignment =
        align === 'center'
            ? 'items-center text-center mx-auto'
            : 'items-start text-left';

    return (
        <div className={`mb-4 flex flex-col gap-2 sm:mb-5 sm:gap-3 md:mb-6 ${alignment} ${className}`}>
            <div
                className={`flex flex-wrap items-center gap-2 sm:gap-3 ${align === 'center' ? 'justify-center' : ''}`}
            >
                {withIcon && align === 'left' && (
                    <Sparkles
                        className="size-4 shrink-0 sm:size-5"
                        style={{ color: themeColors.primary }}
                    />
                )}
                <h2
                    className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl"
                    style={{ color: themeColors.secondary }}
                >
                    {title}
                </h2>
                {withIcon && align === 'center' && (
                    <div
                        className="h-0.5 w-12 rounded-full"
                        style={{ backgroundColor: themeColors.primary }}
                    />
                )}
            </div>
            {description && (
                <p
                    className={`max-w-2xl text-xs text-slate-500 sm:text-sm md:text-base ${align === 'center' ? 'mx-auto' : ''}`}
                >
                    {description}
                </p>
            )}
            {align === 'left' && (
                <div
                    className="mt-0.5 h-1 w-12 rounded-full sm:w-16"
                    style={{ backgroundColor: themeColors.primary }}
                />
            )}
        </div>
    );
}
