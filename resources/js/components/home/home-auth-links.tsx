import { Link, usePage } from '@inertiajs/react';
import { User } from 'lucide-react';
import { openSignupPopup } from '@/components/home/signup-popup';
import { cn } from '@/lib/utils';
import { index as accountIndex } from '@/routes/account';
import { index as ordersIndex } from '@/routes/account/orders';
import { index as wishlistIndex } from '@/routes/account/wishlist';
import { dashboard, login } from '@/routes';

type AuthUser = { name: string; role?: string };

export function HomeAuthLinks({
    onNavigate,
    variant = 'inline',
    tone = 'dark',
}: {
    onNavigate?: () => void;
    variant?: 'inline' | 'stacked' | 'icon' | 'header';
    tone?: 'light' | 'dark';
}) {
    const { auth } = usePage().props as { auth: { user?: AuthUser | null } };
    const isAdmin = auth.user?.role === 'admin';
    const accountHref = isAdmin ? dashboard() : accountIndex.url();
    const isLight = tone === 'light';

    const navLinkClass = cn(
        'hidden h-9 items-center px-2 text-[12px] font-medium tracking-[0.16em] uppercase transition lg:inline-flex lg:px-3',
        isLight ? 'text-white hover:text-white/80' : 'text-[#09233D] hover:text-[#062A4D]',
    );

    const accountClass = cn(
        variant === 'stacked'
            ? 'flex h-12 items-center justify-center gap-2 border border-[#E8DDC5] text-sm font-medium tracking-wide text-[#062A4D]'
            : variant === 'header'
              ? 'inline-flex h-9 items-center gap-1.5 text-[12px] font-medium tracking-[0.16em] uppercase transition'
              : 'hidden h-10 items-center gap-2 px-3 text-sm font-medium transition sm:inline-flex',
        variant === 'header' && (isLight ? 'text-white hover:text-white/80' : 'text-[#09233D] hover:text-[#062A4D]'),
        variant === 'inline' && !isLight && 'text-[#09233D] hover:text-[#062A4D]',
    );

    const loginClass = cn(
        variant === 'stacked'
            ? 'flex h-12 items-center justify-center border border-[#E8DDC5] text-sm font-medium tracking-wide text-[#062A4D]'
            : variant === 'header'
              ? 'inline-flex h-9 items-center px-2 text-[12px] font-medium tracking-[0.16em] uppercase transition lg:px-3'
              : 'hidden h-10 items-center px-3 text-sm font-medium transition sm:inline-flex',
        variant === 'header' && (isLight ? 'text-white hover:text-white/80' : 'text-[#09233D] hover:text-[#062A4D]'),
        variant === 'inline' && !isLight && 'text-[#09233D] hover:text-[#062A4D]',
    );

    const registerClass = cn(
        variant === 'stacked'
            ? 'flex h-12 items-center justify-center bg-[#062A4D] text-sm font-medium tracking-wide text-[#FCFAF5]'
            : variant === 'header'
              ? 'inline-flex h-9 items-center border px-3.5 text-[12px] font-medium tracking-[0.16em] uppercase transition lg:px-4'
              : 'hidden h-10 items-center px-4 text-sm font-medium transition sm:inline-flex',
        variant === 'header' &&
            (isLight
                ? 'border-white text-white hover:bg-white hover:text-[#09233D]'
                : 'border-[#062A4D] text-[#062A4D] hover:bg-[#062A4D] hover:text-[#FCFAF5]'),
        variant === 'inline' && 'bg-[#062A4D] text-[#FCFAF5] hover:bg-[#041F3A]',
    );

    const iconClass = cn(
        'grid h-10 w-10 place-items-center transition',
        isLight ? 'text-white hover:text-white/80' : 'text-[#09233D] hover:text-[#062A4D]',
    );

    if (auth.user) {
        if (variant === 'icon') {
            return (
                <Link
                    href={accountHref}
                    onClick={onNavigate}
                    className={iconClass}
                    aria-label={isAdmin ? 'Dashboard' : 'Account'}
                >
                    <User className="h-5 w-5" strokeWidth={1.6} />
                </Link>
            );
        }

        return (
            <>
                {!isAdmin && variant === 'header' && (
                    <>
                        <Link href={ordersIndex.url()} onClick={onNavigate} className={navLinkClass}>
                            Orders
                        </Link>
                        <Link href={wishlistIndex.url()} onClick={onNavigate} className={navLinkClass}>
                            Wishlist
                        </Link>
                    </>
                )}
                <Link href={accountHref} onClick={onNavigate} className={accountClass}>
                    <User className="h-4 w-4" strokeWidth={1.6} />
                    {isAdmin ? 'Dashboard' : 'Account'}
                </Link>
                {!isAdmin && variant === 'stacked' && (
                    <>
                        <Link
                            href={ordersIndex.url()}
                            onClick={onNavigate}
                            className="flex h-12 items-center justify-center gap-2 border border-[#E8DDC5] text-sm font-medium tracking-wide text-[#062A4D]"
                        >
                            My Orders
                        </Link>
                        <Link
                            href={wishlistIndex.url()}
                            onClick={onNavigate}
                            className="flex h-12 items-center justify-center gap-2 border border-[#E8DDC5] text-sm font-medium tracking-wide text-[#062A4D]"
                        >
                            Wishlist
                        </Link>
                    </>
                )}
            </>
        );
    }

    if (variant === 'icon') {
        return (
            <Link href={login()} onClick={onNavigate} className={iconClass} aria-label="Login">
                <User className="h-5 w-5" strokeWidth={1.6} />
            </Link>
        );
    }

    return (
        <>
            <Link href={login()} onClick={onNavigate} className={loginClass}>
                Login
            </Link>
            <button
                type="button"
                onClick={() => {
                    onNavigate?.();
                    openSignupPopup();
                }}
                className={registerClass}
            >
                Sign Up
            </button>
        </>
    );
}
