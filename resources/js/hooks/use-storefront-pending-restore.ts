import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import {
    clearBuyNowPending,
    readBuyNowPending,
} from '@/lib/buy-now-pending';
import {
    clearCartPending,
    readCartPending,
} from '@/lib/cart-pending';
import type { Auth } from '@/types/auth';

/**
 * Restores guest storefront intents from localStorage after authentication.
 * Session is the primary store; localStorage is a fallback if the session was lost.
 */
export function useStorefrontPendingRestore(auth?: Auth): void {
    const restoredRef = useRef(false);

    useEffect(() => {
        if (!auth?.user || restoredRef.current) {
            return;
        }

        const path = window.location.pathname;

        if (path === '/cart') {
            clearCartPending();
            return;
        }

        if (path.startsWith('/checkout')) {
            clearBuyNowPending();
            clearCartPending();
            return;
        }

        const buyNowPending = readBuyNowPending();

        if (buyNowPending) {
            restoredRef.current = true;

            router.post('/buy-now', buyNowPending, {
                preserveState: true,
                onSuccess: () => clearBuyNowPending(),
                onError: () => {
                    restoredRef.current = false;
                },
            });

            return;
        }

        const cartPending = readCartPending();

        if (!cartPending) {
            return;
        }

        restoredRef.current = true;

        router.post('/cart/intent', cartPending, {
            preserveState: true,
            onSuccess: () => clearCartPending(),
            onError: () => {
                restoredRef.current = false;
            },
        });
    }, [auth?.user]);
}
