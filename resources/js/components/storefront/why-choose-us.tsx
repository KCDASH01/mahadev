// resources/js/components/storefront/why-choose-us.tsx
import {
    CreditCard,
    Headphones,
    ShieldCheck,
    Truck,
    Verified,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SectionHeading from '@/components/storefront/section-heading';
import { themeColors } from '@/lib/theme-colors';
import type { WhyChooseUsItem } from '@/types/homepage';

const cardThemes = [
    {
        bg: 'bg-gradient-to-br from-sky-50 to-blue-100',
        border: 'border-blue-200/70',
        iconBg: 'bg-blue-600',
        accent: 'bg-blue-400/20',
        icon: Verified,
    },
    {
        bg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
        border: 'border-emerald-200/70',
        iconBg: 'bg-emerald-600',
        accent: 'bg-emerald-400/20',
        icon: CreditCard,
    },
    {
        bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
        border: 'border-amber-200/70',
        iconBg: 'bg-amber-600',
        accent: 'bg-amber-400/20',
        icon: Truck,
    },
    {
        bg: 'bg-gradient-to-br from-violet-50 to-purple-100',
        border: 'border-violet-200/70',
        iconBg: 'bg-violet-600',
        accent: 'bg-violet-400/20',
        icon: Headphones,
    },
    {
        bg: 'bg-gradient-to-br from-rose-50 to-pink-100',
        border: 'border-rose-200/70',
        iconBg: 'bg-rose-600',
        accent: 'bg-rose-400/20',
        icon: ShieldCheck,
    },
] as const;

function resolveTheme(index: number) {
    return cardThemes[index % cardThemes.length];
}

export default function WhyChooseUs({ items }: { items: WhyChooseUsItem[] }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto w-full max-w-7xl px-3 pb-10 sm:px-4 sm:pb-12 md:pb-16">
            <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-100 sm:rounded-3xl sm:p-6 md:p-12">
                <SectionHeading
                    title="Why Choose MedEcom?"
                    description="We're committed to providing you with the best medical shopping experience"
                    align="center"
                    withIcon={false}
                    className="mx-auto"
                />

                <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-4">
                    {items.map((item, index) => {
                        const theme = resolveTheme(index);
                        const Icon: LucideIcon = theme.icon;

                        return (
                            <div
                                key={item.title}
                                className={`group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6 ${theme.bg} ${theme.border}`}
                            >
                                <div
                                    className={`pointer-events-none absolute -top-6 -right-6 size-24 rounded-full blur-2xl transition-transform duration-300 group-hover:scale-125 ${theme.accent}`}
                                />
                                <div
                                    className={`relative mb-4 inline-flex rounded-xl p-3 text-white shadow-md transition-transform duration-300 group-hover:scale-110 ${theme.iconBg}`}
                                >
                                    <Icon className="size-5" />
                                </div>
                                <h3
                                    className="relative font-semibold text-lg"
                                    style={{ color: themeColors.secondary }}
                                >
                                    {item.title}
                                </h3>
                                <p className="relative mt-2 text-sm leading-relaxed text-slate-600">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
