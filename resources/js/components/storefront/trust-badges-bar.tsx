// resources/js/components/storefront/trust-badges-bar.tsx
import { Award, ShieldCheck, Tag, Truck } from 'lucide-react';
import { themeColors } from '@/lib/theme-colors';

const badges = [
    {
        icon: ShieldCheck,
        title: '100% Genuine Products',
        subtitle: 'Certified Medical Equipment',
    },
    {
        icon: Tag,
        title: 'Best Price Guarantee',
        subtitle: 'Affordable Healthcare Solutions',
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        subtitle: 'Quick & Safe Shipping',
    },
    {
        icon: Award,
        title: 'Trusted Brands',
        subtitle: 'Top Healthcare Manufacturers',
    },
];

export default function TrustBadgesBar() {
    return (
        <section
            className="w-full px-3 sm:px-4"
            aria-label="Store benefits"
        >
            <div
                className="mx-auto grid max-w-[1440px] grid-cols-1 gap-3 rounded-xl px-3 py-5 sm:grid-cols-2 sm:gap-4 sm:px-6 sm:py-7 lg:grid-cols-4 lg:gap-6 lg:px-8"
                style={{ backgroundColor: themeColors.secondary }}
            >
                {badges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                        <div
                            key={badge.title}
                            className="flex items-center gap-3 sm:gap-4"
                        >
                            <div
                                className="flex size-11 shrink-0 items-center justify-center rounded-lg sm:size-12"
                                style={{
                                    backgroundColor:
                                        'color-mix(in srgb, var(--theme-primary, #2563EB) 35%, var(--theme-secondary, #0F172A))',
                                }}
                            >
                                <Icon className="size-5 text-white sm:size-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white sm:text-base">
                                    {badge.title}
                                </p>
                                <p className="text-xs text-slate-300 sm:text-sm">
                                    {badge.subtitle}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
