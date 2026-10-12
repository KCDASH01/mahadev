// resources/js/components/storefront/storefront-nav.tsx
import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown, Home as HomeIcon, LayoutGrid } from 'lucide-react';
import { themeColors } from '@/lib/theme-colors';
import { home } from '@/routes';
import type { HomepageCategory } from '@/types/homepage';

function NavDivider() {
    return (
        <span
            className="hidden h-5 w-px shrink-0 bg-white/25 lg:block"
            aria-hidden
        />
    );
}

function NavLink({
    href,
    children,
    icon,
}: {
    href: string;
    children: ReactNode;
    icon?: ReactNode;
}) {
    return (
        <a
            href={href}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm text-white/95 transition-colors hover:bg-white/10 hover:text-white lg:px-4"
        >
            {icon}
            {children}
        </a>
    );
}

export default function StorefrontNav({
    categories,
}: {
    categories: HomepageCategory[];
}) {
    return (
        <nav
            className="hidden border-t border-white/10 xl:block"
            style={{ backgroundColor: themeColors.primary }}
            aria-label="Main navigation"
        >
            <div className="mx-auto flex w-full max-w-[1440px] items-center overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="relative shrink-0 group">
                    <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                        <LayoutGrid className="size-4" />
                        Categories
                        <ChevronDown className="size-3.5 text-white/70" />
                    </button>
                    <div className="absolute top-full left-0 z-50 hidden w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-xl group-hover:block">
                        {categories.map((category) => (
                            <a
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                                {category.name}
                            </a>
                        ))}
                    </div>
                </div>

                <NavDivider />

                <Link
                    href={home()}
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm text-white/95 transition-colors hover:bg-white/10 hover:text-white lg:px-4"
                >
                    <HomeIcon className="size-3.5" />
                    Home
                </Link>

                {categories.slice(0, 6).map((category) => (
                    <span key={category.id} className="flex shrink-0 items-center">
                        <NavDivider />
                        <NavLink href={`/categories/${category.slug}`}>
                            {category.name}
                        </NavLink>
                    </span>
                ))}

                <NavDivider />

                <NavLink href="/offers">Offers</NavLink>

                <NavDivider />

                <NavLink href="/contact">Contact</NavLink>
            </div>
        </nav>
    );
}
