import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Heart, ShoppingBag, ChevronDown, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeAuthLinks } from '@/components/home/home-auth-links';
import { HomeLogo } from '@/components/home/home-logo';
import { useStorefrontPendingRestore } from '@/hooks/use-storefront-pending-restore';
import { login } from '@/routes';
import { index as wishlistIndex } from '@/routes/account/wishlist';
import type { Auth } from '@/types/auth';
import { HomeAnnouncementBar } from '@/components/home/home-announcement-bar';
import { SignupPopup } from '@/components/home/signup-popup';
import { cn } from '@/lib/utils';
import type { NavMegaMenu, StorefrontNav, StorefrontNavItem } from '@/types/storefront';

const EMPTY_NAV: StorefrontNav = { items: [], megaMenus: {} };

function MegaMenuPanel({
    menu,
    collectionLabel,
    onNavigate,
}: {
    menu: NavMegaMenu;
    collectionLabel: string;
    onNavigate: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-[min(720px,calc(100vw-2rem))] rounded-2xl border border-[#E7DFC9] bg-white p-6 shadow-[0_18px_40px_-24px_rgba(74,18,28,0.35)]"
        >
            <div className="grid gap-6 sm:grid-cols-3">
                {menu.columns.map((column) => (
                    <div key={column.title}>
                        <p className="text-[11px] font-medium tracking-[0.22em] text-[#062A4D] uppercase">
                            {column.title}
                        </p>
                        <div className="mt-3 grid gap-2">
                            {column.links.map((link) => (
                                <Link
                                    key={`${column.title}-${link.label}`}
                                    href={link.href}
                                    className="text-sm text-[#647487] transition hover:text-[#062A4D]"
                                    onClick={onNavigate}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Link
                href={menu.href}
                className="mt-5 inline-flex text-sm font-medium tracking-wide text-[#062A4D] transition hover:text-[#041F3A]"
                onClick={onNavigate}
            >
                Shop all {collectionLabel} →
            </Link>
        </motion.div>
    );
}

type HomeHeaderProps = {
    overlayOnHero?: boolean;
    showSignupPopup?: boolean;
};

export function HomeHeader({
    overlayOnHero = false,
    showSignupPopup = true,
}: HomeHeaderProps) {
    const { storefrontNav = EMPTY_NAV, cart, auth, wishlist } = usePage().props as {
        storefrontNav?: StorefrontNav;
        cart?: { count: number };
        auth?: Auth;
        wishlist?: { productIds?: number[] };
    };
    useStorefrontPendingRestore(auth);
    const cartCount = cart?.count ?? 0;
    const wishlistCount = wishlist?.productIds?.length ?? 0;
    const wishlistHref = auth?.user ? wishlistIndex.url() : login();
    const { items, megaMenus } = storefrontNav ?? EMPTY_NAV;
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeMega, setActiveMega] = useState<string | null>(null);
    const [mobileMega, setMobileMega] = useState<string | null>(null);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fixedHeaderRef = useRef<HTMLDivElement>(null);
    const announcementRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);

    const openMega = useCallback((key: string) => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        setActiveMega(key);
    }, []);

    const scheduleCloseMega = useCallback(() => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }
        closeTimerRef.current = setTimeout(() => {
            setActiveMega(null);
            closeTimerRef.current = null;
        }, 120);
    }, []);

    useEffect(() => {
        return () => {
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const headerNode = fixedHeaderRef.current;

        if (!headerNode) {
            return;
        }

        const syncHeaderHeight = () => {
            const announcementHeight =
                announcementRef.current?.getBoundingClientRect().height ?? 0;
            const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
            const root = document.documentElement;

            root.style.setProperty('--home-announcement-offset', `${announcementHeight}px`);
            root.style.setProperty('--home-header-height', `${navHeight}px`);
            root.style.setProperty(
                '--home-fixed-header-height',
                `${announcementHeight + navHeight}px`,
            );
        };

        syncHeaderHeight();

        const observer = new ResizeObserver(syncHeaderHeight);
        observer.observe(headerNode);
        window.addEventListener('resize', syncHeaderHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', syncHeaderHeight);
        };
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 80);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isOverlay = overlayOnHero && !scrolled;
    const navTone = isOverlay ? 'light' : 'dark';

    const navLinkClass = (highlight?: boolean) =>
        cn(
            "shrink-0 px-2 py-2 text-[12px] font-medium tracking-[0.16em] whitespace-nowrap uppercase transition lg:px-3 lg:text-[13px]",
            isOverlay
                ? highlight
                    ? 'text-white/90 hover:text-white'
                    : 'text-white hover:text-white/80'
                : highlight
                  ? 'text-[#D6A62D]'
                  : 'text-[#D6A62D] hover:text-[#041F3A]',
        );

    const iconLinkClass = cn(
        'relative grid h-10 w-10 place-items-center transition',
        isOverlay ? 'text-white hover:text-white/80' : 'text-[#09233D] hover:text-[#062A4D]',
    );

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const closeMega = () => setActiveMega(null);

    const renderDesktopNavItem = (item: StorefrontNavItem) => {
        if (!item.mega) {
            return (
                <Link
                    key={item.label}
                    href={item.href}
                    className={navLinkClass(item.highlight)}
                >
                    {item.label}
                </Link>
            );
        }

        const megaKey = item.key ?? item.label;
        const megaMenu = megaMenus[megaKey];

        if (!megaMenu) {
            return (
                <Link
                    key={item.label}
                    href={item.href}
                    className={navLinkClass()}
                >
                    {item.label}
                </Link>
            );
        }

        const isOpen = activeMega === megaKey;

        return (
            <div
                key={item.label}
                className="relative shrink-0"
                onMouseEnter={() => openMega(megaKey)}
                onMouseLeave={scheduleCloseMega}
            >
                <Link
                    href={megaMenu.href}
                    className={cn(
                        'inline-flex items-center gap-1 lg:gap-1.5',
                        navLinkClass(isOpen && !isOverlay),
                    )}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    {item.label}
                    <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                        strokeWidth={2.5}
                        aria-hidden
                    />
                </Link>

                <AnimatePresence>
                    {isOpen && (
                        <div
                            className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-2"
                            onMouseEnter={() => openMega(megaKey)}
                            onMouseLeave={scheduleCloseMega}
                        >
                            <MegaMenuPanel
                                menu={megaMenu}
                                collectionLabel={item.label}
                                onNavigate={closeMega}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const renderMobileNavItem = (item: StorefrontNavItem) => {
        if (!item.mega) {
            return (
                <Link
                    key={item.label}
                    href={item.href}
                    className="flex h-12 items-center border-b border-[#E8DDC5] text-sm font-medium tracking-wide text-[#D6A62D] uppercase"
                    onClick={() => setMobileOpen(false)}
                >
                    {item.label}
                </Link>
            );
        }

        const megaKey = item.key ?? item.label;
        const megaMenu = megaMenus[megaKey];
        const open = mobileMega === megaKey;

        if (!megaMenu) {
            return (
                <Link
                    key={item.label}
                    href={item.href}
                    className="flex h-12 items-center border-b border-[#E8DDC5] text-sm font-medium tracking-wide text-[#D6A62D] uppercase"
                    onClick={() => setMobileOpen(false)}
                >
                    {item.label}
                </Link>
            );
        }

        return (
            <div key={item.label} className="border-b border-[#E8DDC5]">
                <button
                    type="button"
                    className="flex h-12 w-full items-center justify-between text-sm font-medium tracking-wide text-[#D6A62D] uppercase"
                    onClick={() => setMobileMega(open ? null : megaKey)}
                >
                    {item.label}
                    <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#647487] transition-transform duration-200 ${
                            open ? 'rotate-180' : ''
                        }`}
                        strokeWidth={2.5}
                        aria-hidden
                    />
                </button>
                {open && (
                    <div className="space-y-4 pb-4 pl-3">
                        {megaMenu.columns.map((column) => (
                            <div key={column.title}>
                                <p className="text-[11px] font-medium tracking-[0.22em] text-[#062A4D] uppercase">
                                    {column.title}
                                </p>
                                <div className="mt-2 grid gap-1">
                                    {column.links.map((link) => (
                                        <Link
                                            key={`${column.title}-${link.label}`}
                                            href={link.href}
                                            className="block py-1.5 text-sm text-[#647487] hover:text-[#062A4D]"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <Link
                            href={megaMenu.href}
                            className="inline-flex text-sm font-medium tracking-wide text-[#062A4D]"
                            onClick={() => setMobileOpen(false)}
                        >
                            Shop all {item.label} →
                        </Link>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div
                ref={fixedHeaderRef}
                className={cn(
                    'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300',
                    scrolled && !overlayOnHero && 'shadow-[0_8px_24px_-16px_rgba(74,18,28,0.28)]',
                    scrolled && overlayOnHero && 'shadow-[0_8px_24px_-16px_rgba(74,18,28,0.18)]',
                )}
            >
                <div ref={announcementRef}>
                    <HomeAnnouncementBar />
                </div>

                <header
                    ref={navRef}
                    className={cn(
                        'transition-[background-color,border-color,backdrop-filter] duration-300',
                        isOverlay
                            ? 'border-b border-transparent bg-transparent'
                            : 'border-b border-[#E7DFC9] bg-white',
                    )}
                >
                    <div className="mx-auto flex h-[5rem] w-full max-w-[1800px] flex-nowrap items-center gap-3 px-4 sm:h-[5.25rem] sm:px-5 lg:h-[5.5rem] lg:gap-6 lg:px-8">
                        <HomeLogo />

                        <nav className="relative hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-1 font-helvetica md:flex lg:gap-2">
                            {items.map(renderDesktopNavItem)}
                        </nav>

                        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                            <div className="hidden items-center gap-1 font-helvetica md:flex lg:gap-2">
                                <HomeAuthLinks variant="header" tone={navTone} />
                            </div>
                            <Link
                                href={wishlistHref}
                                className={iconLinkClass}
                                aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
                            >
                                <Heart className="h-5 w-5" strokeWidth={1.6} />
                                {wishlistCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center bg-[#062A4D] px-0.5 text-[9px] font-medium text-[#FCFAF5]">
                                        {wishlistCount > 99 ? '99+' : wishlistCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                href="/cart"
                                className={iconLinkClass}
                                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
                            >
                                <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
                                {cartCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center bg-[#062A4D] px-0.5 text-[9px] font-medium text-[#FCFAF5]">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                type="button"
                                className={cn(iconLinkClass, 'md:hidden')}
                                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                                onClick={() => setMobileOpen((open) => !open)}
                            >
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </header>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    >
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            className="absolute top-0 right-0 flex h-full w-full max-w-sm flex-col bg-white shadow-[0_24px_60px_-20px_rgba(74,18,28,0.4)]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-[#E8DDC5] p-4">
                                <HomeLogo />
                                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 font-helvetica">
                                {items.map(renderMobileNavItem)}

                                <div className="mt-6 grid gap-2">
                                    <HomeAuthLinks variant="stacked" onNavigate={() => setMobileOpen(false)} />
                                </div>
                            </div>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>

            {showSignupPopup ? <SignupPopup /> : null}
        </>
    );
}
