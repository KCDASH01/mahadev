import { router, usePage } from '@inertiajs/react';
import type { MouseEvent } from 'react';
import type { Auth } from '@/types/auth';
import type { WishlistSummary } from '@/types/wishlist';

export function useWishlist() {
    const { auth, wishlist } = usePage().props as {
        auth?: Auth;
        wishlist?: WishlistSummary;
    };

    const productIds = wishlist?.productIds ?? [];

    const isWishlisted = (productId: number) => productIds.includes(productId);

    const toggleWishlist = (productId: number, event?: MouseEvent) => {
        event?.preventDefault();
        event?.stopPropagation();

        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        router.post(
            '/wishlist/toggle',
            { product_id: productId },
            {
                preserveScroll: true,
            },
        );
    };

    return {
        productIds,
        isWishlisted,
        toggleWishlist,
    };
}
