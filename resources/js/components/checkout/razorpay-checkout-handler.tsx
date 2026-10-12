import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { openRazorpayCheckout, type RazorpayCheckoutPayload } from '@/lib/razorpay-checkout';
import { verify as verifyCheckout } from '@/routes/checkout';

function abandonPayment(orderNumber: string): void {
    router.post(
        '/checkout/abandon',
        { order_number: orderNumber },
        { preserveScroll: true },
    );
}

type InertiaPage = {
    props: {
        razorpayCheckout?: RazorpayCheckoutPayload | null;
    };
};

function readInitialPage(): InertiaPage | null {
    const root = document.getElementById('app');

    if (!root?.dataset.page) {
        return null;
    }

    try {
        return JSON.parse(root.dataset.page) as InertiaPage;
    } catch {
        return null;
    }
}

function launchCheckout(payload: RazorpayCheckoutPayload, openedRef: React.RefObject<string | null>): void {
    if (openedRef.current === payload.razorpayOrderId) {
        return;
    }

    openedRef.current = payload.razorpayOrderId;

    openRazorpayCheckout(payload, {
        onSuccess: (response) => {
            router.post(
                verifyCheckout.url(),
                {
                    order_number: payload.orderNumber,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                },
                { preserveScroll: true },
            );
        },
        onDismiss: () => {
            openedRef.current = null;
            abandonPayment(payload.orderNumber);
        },
    }).catch(() => {
        openedRef.current = null;
        abandonPayment(payload.orderNumber);
    });
}

function maybeLaunchCheckout(page: InertiaPage, openedRef: React.RefObject<string | null>): void {
    const checkout = page.props.razorpayCheckout;

    if (!checkout?.orderNumber || !checkout.razorpayOrderId) {
        return;
    }

    launchCheckout(checkout, openedRef);
}

export function RazorpayCheckoutHandler() {
    const openedRef = useRef<string | null>(null);

    useEffect(() => {
        const initialPage = readInitialPage();

        if (initialPage) {
            maybeLaunchCheckout(initialPage, openedRef);
        }

        return router.on('success', (event) => {
            maybeLaunchCheckout(event.detail.page as InertiaPage, openedRef);
        });
    }, []);

    return null;
}
