import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Clapperboard,
    CreditCard,
    Image,
    Layers,
    LayoutGrid,
    Megaphone,
    MessageCircle,
    Package,
    Palette,
    Percent,
    PictureInPicture2,
    Quote,
    ShoppingBag,
    Tag,
    Truck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { index as bannersIndex } from '@/routes/admin/banners';
import { edit as lookbookSectionEdit } from '@/routes/admin/lookbook-section';
import { edit as promoStripEdit } from '@/routes/admin/promo-strip';
import { index as socialStoriesIndex } from '@/routes/admin/social-stories';
import { index as testimonialsIndex } from '@/routes/admin/testimonials';
import { index as brandsIndex } from '@/routes/admin/brands';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as colorsIndex } from '@/routes/admin/colors';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as paymentsIndex } from '@/routes/admin/payments';
import { index as productsIndex } from '@/routes/admin/products';
import { index as usersIndex } from '@/routes/admin/users';
import { dashboard, home } from '@/routes';
import type { Auth } from '@/types/auth';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Categories',
        href: categoriesIndex(),
        icon: Layers,
    },
    {
        title: 'Brands',
        href: brandsIndex(),
        icon: Tag,
    },
    {
        title: 'Colors',
        href: colorsIndex(),
        icon: Palette,
    },
    {
        title: 'Products',
        href: productsIndex(),
        icon: Package,
    },
    {
        title: 'Coupons',
        href: '/admin/coupons',
        icon: Percent,
    },
    {
        title: 'User Management',
        href: usersIndex(),
        icon: Users,
    },
    {
        title: 'Orders',
        href: ordersIndex(),
        icon: ShoppingBag,
    },
    {
        title: 'Payments History',
        href: paymentsIndex(),
        icon: CreditCard,
    },
    {
        title: 'Shipping Management',
        href: '/admin/shipping',
        icon: Truck,
    },
    {
        title: 'Hero Slides',
        href: bannersIndex(),
        icon: Image,
    },
    {
        title: 'Announcement Offers',
        href: '/admin/announcement-offers',
        icon: Bell,
    },
    {
        title: 'Promo Strip',
        href: promoStripEdit(),
        icon: Megaphone,
    },
    {
        title: 'Homepage Popup',
        href: '/admin/homepage-popup',
        icon: PictureInPicture2,
    },
    {
        title: 'Lookbook Section',
        href: lookbookSectionEdit(),
        icon: Clapperboard,
    },
    {
        title: 'Social Stories',
        href: socialStoriesIndex(),
        icon: MessageCircle,
    },
    {
        title: 'Testimonials',
        href: testimonialsIndex(),
        icon: Quote,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as { auth: Auth };
    const isAdmin = auth.user?.role === 'admin';
    const closeMobileNav = useMobileNavigation();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={isAdmin ? dashboard() : home()}
                                prefetch
                                onClick={closeMobileNav}
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isAdmin && <NavMain items={mainNavItems} />}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
