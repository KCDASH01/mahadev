import { Head, Link, router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { homeBrand } from '@/data/home-brand';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { index as accountIndex, profile as accountProfile } from '@/routes/account';
import { index as addressesIndex } from '@/routes/account/addresses';
import { index as ordersIndex } from '@/routes/account/orders';
import { index as wishlistIndex } from '@/routes/account/wishlist';

type StorefrontAccountLayoutProps = PropsWithChildren<{
    title: string;
    description?: string;
}>;

const accountNavItems = [
    { label: 'Overview', href: accountIndex.url() },
    { label: 'My Orders', href: ordersIndex.url() },
    { label: 'Addresses', href: addressesIndex.url() },
    { label: 'Wishlist', href: wishlistIndex.url() },
    { label: 'Profile', href: accountProfile.url() },
];

export function StorefrontAccountLayout({ title, description, children }: StorefrontAccountLayoutProps) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <>
            <Head title={`${title} - ${homeBrand.name}`} />

            <div className="min-h-screen bg-[#FCFAF5] font-sans text-[#09233D] antialiased">
                <HomeHeader />

                <main className="mx-auto max-w-5xl px-4 py-8 pt-home-header sm:px-6 sm:py-12 lg:px-8">
                    <div className="mb-6 sm:mb-8">
                        <p className="text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">Account</p>
                        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl">
                            {title}
                        </h1>
                        <HomeBrandMotif className="mx-0 mt-4" />
                        {description && (
                            <p className="mt-4 text-sm leading-6 text-[#647487] sm:text-[15px]">{description}</p>
                        )}
                    </div>

                    <div className="mb-6 flex flex-col gap-3 border border-[#E8DDC5] bg-white p-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                        <nav
                            className="-mx-1 flex gap-1 overflow-x-auto px-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
                            aria-label="Account navigation"
                        >
                            {accountNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'shrink-0 px-4 py-2.5 text-[11px] font-medium tracking-[0.16em] whitespace-nowrap uppercase transition',
                                        isCurrentOrParentUrl(item.href)
                                            ? 'bg-[#062A4D] text-[#FCFAF5]'
                                            : 'text-[#647487] hover:bg-[#F5F1E8] hover:text-[#062A4D]',
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <Link
                            href={logout()}
                            as="button"
                            onClick={() => router.flushAll()}
                            className="inline-flex w-full shrink-0 items-center justify-center gap-2 border border-[#062A4D] px-5 py-2.5 text-[11px] font-medium tracking-[0.16em] text-[#062A4D] uppercase transition hover:bg-[#062A4D] hover:text-[#FCFAF5] sm:w-auto"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Log out
                        </Link>
                    </div>

                    <div className="border border-[#E8DDC5] bg-white p-5 sm:p-8">{children}</div>
                </main>

                <HomeFooter />
            </div>
        </>
    );
}
