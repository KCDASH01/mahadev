import type { ReactNode } from 'react';
import SiteFooter from '@/components/site-footer';
import FloatingContact from '@/components/storefront/floating-contact';
import StorefrontHeader from '@/components/storefront/storefront-header';
import { themeColors } from '@/lib/theme-colors';
import type { HomepageCategory } from '@/types/homepage';

export default function StorefrontLayout({
    children,
    categories = [],
}: {
    children: ReactNode;
    categories?: HomepageCategory[];
}) {
    return (
        <div
            className="flex min-h-screen flex-col overflow-x-hidden bg-[#f4f7fb]"
            style={{ color: themeColors.secondary }}
        >
            <StorefrontHeader categories={categories} />
            {children}
            <SiteFooter />
            <FloatingContact />
        </div>
    );
}
