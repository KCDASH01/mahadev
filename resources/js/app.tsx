import { createInertiaApp, router } from '@inertiajs/react';
import { RazorpayCheckoutHandler } from '@/components/checkout/razorpay-checkout-handler';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AdminAuthLayout from '@/layouts/auth/admin-auth-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

const appName = import.meta.env.VITE_APP_NAME || 'Mahadev';

createInertiaApp({
    title: (title) => {
        if (!title) {
            return appName;
        }

        return title.includes(appName) || title.includes('|') ? title : `${title} - ${appName}`;
    },
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'collection':
            case name === 'men':
            case name === 'women':
            case name === 'kids':
            case name === 'trending':
            case name === 'new-arrivals':
            case name === 'product-details':
            case name === 'cart':
            case name === 'checkout/index':
            case name === 'checkout/success':
            case name === 'checkout/failed':
            case name === 'account/index':
            case name === 'account/profile':
            case name === 'account/orders/index':
            case name === 'account/orders/show':
            case name === 'account/wishlist/index':
            case name === 'products/show':
            case name === 'blog/index':
            case name === 'blog/show':
            case name === 'static-page':
                return null;
            case name === 'auth/admin-login':
                return AdminAuthLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <RazorpayCheckoutHandler />
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Track SPA navigations for Meta Pixel (initial PageView is fired from app.blade.php).
router.on('navigate', () => {
    window.fbq?.('track', 'PageView');
});

// This will set light / dark mode on load...
initializeTheme();
