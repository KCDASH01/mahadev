// resources/js/components/storefront/storefront-header.tsx
import { Link, usePage } from '@inertiajs/react';
import { useState, type CSSProperties } from 'react';
import {
    GitCompare,
    Heart,
    Menu,
    Search,
    ShoppingCart,
    User,
    X,
} from 'lucide-react';
import StorefrontNav from '@/components/storefront/storefront-nav';
import { mediaUrl } from '@/lib/media-url';
import { themeColors } from '@/lib/theme-colors';
import { dashboard, home, login } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import type { HomepageCategory } from '@/types/homepage';
import type { AppSettings } from '@/types/settings';

function RoundIconButton({
    label,
    children,
    href,
}: {
    label: string;
    children: React.ReactNode;
    href?: ReturnType<typeof login>;
}) {
    const className =
        'flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 sm:size-10';

    if (href) {
        return (
            <Link href={href} className={className} aria-label={label}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={className} aria-label={label}>
            {children}
        </button>
    );
}

export default function StorefrontHeader({
    categories = [],
}: {
    categories?: HomepageCategory[];
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { auth, appSettings } = usePage().props as {
        auth: { user?: { name: string; role?: string } | null };
        appSettings: AppSettings;
    };

    const isAdmin = auth.user?.role === 'admin';

    const general = appSettings?.general;
    const logo = mediaUrl(general?.logo);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#f5f6f8] shadow-sm">
            <div className="mx-auto w-full max-w-[1440px] px-3 py-2.5 sm:px-4 sm:py-3 md:py-3.5">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white xl:hidden"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </button>

                    <Link
                        href={home()}
                        className="flex shrink-0 items-center gap-2.5"
                    >
                        {logo ? (
                            <img
                                src={logo}
                                alt={general?.site_name ?? 'Store'}
                                className="h-14 w-auto object-contain md:h-16"
                            />
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <div className="grid size-9 grid-cols-2 gap-0.5 md:size-10">
                                    <span className="rounded-sm bg-emerald-500" />
                                    <span className="rounded-sm bg-amber-400" />
                                    <span className="rounded-sm bg-slate-400" />
                                    <span
                                        className="rounded-sm"
                                        style={{
                                            backgroundColor: themeColors.primary,
                                        }}
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <p
                                        className="text-base font-bold tracking-tight md:text-lg"
                                        style={{ color: themeColors.primary }}
                                    >
                                        {general?.site_name ?? 'MedEcom'}
                                    </p>
                                    <p className="text-[10px] tracking-wide text-slate-500">
                                        connect · share · transform
                                    </p>
                                </div>
                            </div>
                        )}
                    </Link>

                    <div className="hidden min-w-0 flex-1 md:block">
                        <form
                            className="relative mx-auto w-full max-w-2xl"
                            action="#"
                            role="search"
                        >
                            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
                            <input
                                name="q"
                                placeholder="Search for products"
                                className="h-11 w-full rounded-full border border-slate-200 bg-white pr-5 pl-12 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-offset-0"
                                style={
                                    {
                                        '--tw-ring-color':
                                            'color-mix(in srgb, var(--theme-primary, #2563EB) 30%, white)',
                                    } as CSSProperties
                                }
                            />
                        </form>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white md:hidden"
                        aria-label="Toggle search"
                    >
                        <Search className="size-5" />
                    </button>

                    <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-2.5">
                        <div className="hidden items-center gap-1.5 sm:flex md:gap-2.5">
                            <RoundIconButton label="Compare">
                                <GitCompare className="size-4" />
                            </RoundIconButton>

                            <RoundIconButton label="Wishlist">
                                <Heart className="size-4" />
                            </RoundIconButton>
                        </div>

                        {auth.user ? (
                            <RoundIconButton
                                label={isAdmin ? 'Admin Panel' : 'Account'}
                                href={isAdmin ? dashboard() : profileEdit()}
                            >
                                <User className="size-4" />
                            </RoundIconButton>
                        ) : (
                            <RoundIconButton label="Login" href={login()}>
                                <User className="size-4" />
                            </RoundIconButton>
                        )}

                        <button
                            type="button"
                            className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-white transition-opacity hover:opacity-90 sm:gap-2 sm:px-3 md:px-4 md:py-2.5"
                            style={{ backgroundColor: themeColors.secondary }}
                            aria-label="Cart"
                        >
                            <ShoppingCart className="size-4" />
                            <span className="text-xs font-medium sm:text-sm">0</span>
                            <span className="hidden text-sm font-medium md:inline">
                                ₹0
                            </span>
                        </button>

                        {!auth.user && (
                            <Link
                                href={login()}
                                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:inline-flex"
                                style={{ backgroundColor: themeColors.button }}
                            >
                                Register
                            </Link>
                        )}
                    </div>
                </div>

                {isSearchOpen && (
                    <div className="mt-3 md:hidden">
                        <form className="relative w-full" action="#" role="search">
                            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
                            <input
                                name="q"
                                placeholder="Search for products"
                                className="h-11 w-full rounded-full border border-slate-200 bg-white pr-4 pl-12 text-sm outline-none focus:border-transparent focus:ring-2"
                                autoFocus
                            />
                        </form>
                    </div>
                )}
            </div>

            <StorefrontNav categories={categories} />

            {isMobileMenuOpen && (
                <div className="border-t border-slate-200 bg-white xl:hidden">
                    <div className="mx-auto max-w-[1440px] px-4 py-4">
                        <div className="flex flex-col gap-1">
                            <Link
                                href={home()}
                                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <p className="px-4 pt-2 pb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Categories
                            </p>
                            {categories.map((category) => (
                                <a
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="rounded-lg px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {category.name}
                                </a>
                            ))}
                            <a
                                href="/offers"
                                className="rounded-lg px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Offers
                            </a>
                            <a
                                href="/contact"
                                className="rounded-lg px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contact
                            </a>
                            {!auth.user && (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={login()}
                                        className="mx-4 mt-2 rounded-full px-4 py-3 text-center text-sm font-semibold text-white"
                                        style={{ backgroundColor: themeColors.button }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
