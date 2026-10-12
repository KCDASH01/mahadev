import type { Auth } from '@/types/auth';
import type { CartSummary } from '@/types/cart';
import type { RazorpayCheckoutPayload } from '@/lib/razorpay-checkout';
import type { AppSettings } from '@/types/settings';
import type { FeaturedCategory, StorefrontNav } from '@/types/storefront';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            appUrl: string;
            auth: Auth;
            sidebarOpen: boolean;
            appSettings: AppSettings;
            storefrontNav: StorefrontNav;
            featuredCategories: FeaturedCategory[];
            cart: CartSummary;
            razorpayKey?: string | null;
            razorpayCheckout?: RazorpayCheckoutPayload | null;
            [key: string]: unknown;
        };
    }
}
