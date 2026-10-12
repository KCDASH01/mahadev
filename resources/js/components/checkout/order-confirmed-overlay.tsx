import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Truck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { formatPrice } from '@/data/fashion-products';
import { checkoutCtaClass } from '@/lib/commerce-cta';

type OrderConfirmedOverlayProps = {
    open: boolean;
    onClose: () => void;
    orderNumber: string;
    grandTotal: number;
    estimatedDeliveryDate?: string | null;
    isCod?: boolean;
};

const AUTO_DISMISS_MS = 5000;

export function OrderConfirmedOverlay({
    open,
    onClose,
    orderNumber,
    grandTotal,
    estimatedDeliveryDate,
    isCod = false,
}: OrderConfirmedOverlayProps) {
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const timer = window.setTimeout(() => onCloseRef.current(), AUTO_DISMISS_MS);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.clearTimeout(timer);
        };
    }, [open]);

    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="order-confirmed-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-[#FCFAF5]/96 backdrop-blur-sm"
                    style={{
                        minHeight: '100dvh',
                        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
                        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                        paddingRight: 'max(1rem, env(safe-area-inset-right))',
                    }}
                >
                    <div className="flex min-h-full items-center justify-center px-4 py-6 sm:px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="w-full max-w-md text-center"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                                className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#062A4D]/25 bg-[#F5F1E8] text-[#062A4D] sm:h-24 sm:w-24"
                            >
                                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.6} />
                            </motion.div>

                            <p className="mt-6 text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase sm:mt-8">
                                {isCod ? 'Order Placed' : 'Payment Successful'}
                            </p>
                            <h2
                                id="order-confirmed-title"
                                className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl"
                            >
                                Order Confirmed
                            </h2>
                            <HomeBrandMotif className="mt-4" />
                            <p className="mt-4 text-sm leading-6 text-[#647487]">
                                {isCod
                                    ? 'Your order has been placed. Please keep the amount ready at delivery.'
                                    : 'Thank you for shopping with us. Your payment was received successfully.'}
                            </p>

                            <div className="mt-6 border border-[#E8DDC5] bg-white p-4 text-left sm:mt-8 sm:p-5">
                                <div className="flex items-start justify-between gap-4 text-sm">
                                    <span className="text-[#647487]">Order ID</span>
                                    <span className="text-right font-medium break-all text-[#09233D]">{orderNumber}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                                    <span className="text-[#647487]">Amount</span>
                                    <span className="text-lg font-semibold text-[#062A4D]">{formatPrice(grandTotal)}</span>
                                </div>
                                {estimatedDeliveryDate && (
                                    <div className="mt-4 flex items-start gap-3 bg-[#F5F1E8] px-3 py-3 sm:px-4">
                                        <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#062A4D]" />
                                        <div className="text-left text-sm">
                                            <p className="font-semibold text-[#09233D]">Estimated Delivery</p>
                                            <p className="text-[#647487]">{estimatedDeliveryDate}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className={`mt-6 h-11 w-full text-[11px] sm:mt-8 ${checkoutCtaClass}`}
                            >
                                View Order Details
                            </button>

                            <p className="mt-3 text-xs text-[#647487] sm:mt-4">
                                Opening order summary automatically...
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
