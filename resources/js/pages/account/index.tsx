import { Link } from '@inertiajs/react';
import { ChevronRight, Heart, MapPin, Package, User } from 'lucide-react';
import { StorefrontAccountLayout } from '@/layouts/storefront-account-layout';
import { profile as accountProfile } from '@/routes/account';
import { index as addressesIndex } from '@/routes/account/addresses';
import { index as ordersIndex } from '@/routes/account/orders';
import { index as wishlistIndex } from '@/routes/account/wishlist';

type AccountIndexProps = {
    user: {
        name: string;
        email: string;
    };
};

const quickLinks = [
    {
        title: 'My Orders',
        description: 'Track, return, or buy things again.',
        href: ordersIndex.url(),
        icon: Package,
    },
    {
        title: 'Saved Addresses',
        description: 'Add, edit, or remove delivery addresses.',
        href: addressesIndex.url(),
        icon: MapPin,
    },
    {
        title: 'Wishlist',
        description: 'View and shop your saved products.',
        href: wishlistIndex.url(),
        icon: Heart,
    },
    {
        title: 'Profile',
        description: 'Edit your name and email address.',
        href: accountProfile.url(),
        icon: User,
    },
];

export default function AccountIndex({ user }: AccountIndexProps) {
    return (
        <StorefrontAccountLayout
            title="My Account"
            description={`Signed in as ${user.email}`}
        >
            <p className="font-serif text-2xl font-medium tracking-tight text-[#09233D]">Hello, {user.name}</p>
            <p className="mt-2 text-sm leading-6 text-[#647487]">
                Manage your orders, wishlist, and account details from here.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
                {quickLinks.map((item) => (
                    <Link
                        key={item.title}
                        href={item.href}
                        className="group flex items-start justify-between gap-4 border border-[#E8DDC5] p-5 transition hover:border-[#062A4D]/40 hover:shadow-[0_12px_28px_-18px_rgba(74,18,28,0.45)]"
                    >
                        <div className="flex min-w-0 gap-4">
                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F5F1E8] text-[#062A4D]">
                                <item.icon className="h-5 w-5" strokeWidth={1.6} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-serif text-lg font-medium text-[#09233D] transition group-hover:text-[#062A4D]">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-[#647487]">{item.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#E8DDC5] transition group-hover:text-[#062A4D]" />
                    </Link>
                ))}
            </div>
        </StorefrontAccountLayout>
    );
}
