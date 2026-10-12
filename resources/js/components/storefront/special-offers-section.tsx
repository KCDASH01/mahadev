// resources/js/components/storefront/special-offers-section.tsx
import { ChevronRight } from 'lucide-react';
import { themeColors } from '@/lib/theme-colors';

const offers = [
    {
        badge: '35% OFF + Free Shipping',
        price: '₹1,699',
        originalPrice: '₹2,499',
        title: 'BP Monitors Mega Sale',
        description: 'Authentic Omron & Dr Trust monitors at unbeatable prices.',
        cta: 'Shop Now',
        href: '/offers',
        className: 'bg-gradient-to-br from-indigo-100 via-violet-50 to-blue-50',
    },
    {
        badge: '25% OFF',
        badgeLabel: 'Limited Offer',
        title: 'Home Healthcare Essentials',
        description: 'Wheelchairs, walkers, oxygen concentrators & more.',
        cta: 'Shop Now',
        href: '/offers',
        className: 'bg-gradient-to-r from-slate-300/80 via-slate-100 to-white',
    },
];

export default function SpecialOffersSection() {
    return (
        <section className="w-full px-3 sm:px-4">
            <div className="mx-auto grid max-w-[1440px] gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
                {offers.map((offer) => (
                    <div
                        key={offer.title}
                        className={`flex min-h-[180px] flex-col justify-between rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/60 sm:min-h-[200px] sm:p-6 md:min-h-[220px] md:p-8 ${offer.className}`}
                    >
                        <div>
                            {offer.badgeLabel && (
                                <p className="text-xs font-medium text-slate-500">
                                    {offer.badgeLabel}
                                </p>
                            )}
                            <p className="text-sm font-semibold text-slate-700">
                                {offer.badge}
                                {offer.price && (
                                    <>
                                        {' '}
                                        <span
                                            className="text-base font-bold"
                                            style={{ color: themeColors.primary }}
                                        >
                                            {offer.price}
                                        </span>
                                        {offer.originalPrice && (
                                            <span className="ml-1 text-sm text-slate-400 line-through">
                                                {offer.originalPrice}
                                            </span>
                                        )}
                                    </>
                                )}
                            </p>
                            <h3
                                className="mt-2 text-lg font-bold leading-tight sm:mt-3 sm:text-xl md:text-2xl"
                                style={{ color: themeColors.secondary }}
                            >
                                {offer.title}
                            </h3>
                            <p className="mt-2 max-w-md text-sm text-slate-600">
                                {offer.description}
                            </p>
                        </div>
                        <a
                            href={offer.href}
                            className="mt-5 inline-flex w-fit items-center gap-1 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: themeColors.button }}
                        >
                            {offer.cta}
                            <ChevronRight className="size-4" />
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}
