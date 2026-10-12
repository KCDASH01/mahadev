export type RazorpayCheckoutPayload = {
    orderNumber: string;
    amount: number;
    currency: string;
    razorpayOrderId: string;
    key: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    description: string;
    brandName: string;
};

export type RazorpaySuccessResponse = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
};

type RazorpayHandler = (response: RazorpaySuccessResponse) => void;

type RazorpayOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme?: {
        color?: string;
    };
    handler: RazorpayHandler;
    modal?: {
        ondismiss?: () => void;
    };
};

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayOptions) => {
            open: () => void;
            on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
        };
    }
}

function loadRazorpayScript(): Promise<void> {
    if (window.Razorpay) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-razorpay-checkout]');

        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay.')));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.dataset.razorpayCheckout = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay.'));
        document.body.appendChild(script);
    });
}

export async function openRazorpayCheckout(
    payload: RazorpayCheckoutPayload,
    handlers: {
        onSuccess: RazorpayHandler;
        onDismiss?: () => void;
    },
): Promise<void> {
    await loadRazorpayScript();

    if (!window.Razorpay) {
        throw new Error('Razorpay is unavailable.');
    }

    const rzp = new window.Razorpay({
        key: payload.key,
        amount: payload.amount,
        currency: payload.currency,
        name: payload.brandName || 'Mahadev',
        description: payload.description,
        order_id: payload.razorpayOrderId,
        prefill: {
            name: payload.customer.name,
            email: payload.customer.email,
            contact: payload.customer.phone,
        },
        image: '/storage/logo.png',
        theme: {
            color: '#062A4D',
        },
        handler: handlers.onSuccess,
        modal: {
            ondismiss: handlers.onDismiss,
        },
    });

    rzp.on('payment.failed', () => {
        handlers.onDismiss?.();
    });

    rzp.open();
}
