import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, MapPin, Package, Truck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { OrderConfirmedOverlay } from '@/components/checkout/order-confirmed-overlay';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { homeBrand } from '@/data/home-brand';
import { formatPrice } from '@/data/fashion-products';
import { checkoutCtaClass, continueShoppingCtaClass } from '@/lib/commerce-cta';
import { displayVariantLabel } from '@/lib/size-label';
import { clearBuyNowPending } from '@/lib/buy-now-pending';
import { clearCartPending } from '@/lib/cart-pending';
import { index as ordersIndex, show as orderShow } from '@/routes/account/orders';

type CheckoutSuccessProps = {
    order: {
        orderNumber: string;
        grandTotal: number;
        paymentStatus: string;
        orderStatus: string;
        paymentMethod?: string | null;
        paymentId?: string | null;
        placedAt?: string | null;
        estimatedDeliveryDate?: string | null;
        address?: {
            fullName?: string | null;
            phone?: string | null;
            line1?: string | null;
            line2?: string | null;
            city?: string | null;
            state?: string | null;
            pincode?: string | null;
        };
        items: Array<{
            name: string;
            quantity: number;
            salePrice: number;
            variantLabel?: string | null;
        }>;
    };
    continueShoppingUrl: string;
    showConfirmationPopup?: boolean;
};

function formatOrderDate(iso?: string | null): string {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function CheckoutSuccess({
    order,
    continueShoppingUrl,
    showConfirmationPopup = false,
}: CheckoutSuccessProps) {
    const [popupOpen, setPopupOpen] = useState(showConfirmationPopup);
    const closePopup = useCallback(() => setPopupOpen(false), []);
    const isCod = order.paymentMethod === 'cod';

    useEffect(() => {
        clearCartPending();
        clearBuyNowPending();
    }, []);

    useEffect(() => {
        if (showConfirmationPopup) {
            setPopupOpen(true);
        }
    }, [showConfirmationPopup]);

    const addressLines = [
        order.address?.line1,
        order.address?.line2,
        [order.address?.city, order.address?.state, order.address?.pincode].filter(Boolean).join(', '),
    ].filter(Boolean);

    return (
        <>
            <Head title={`Order Confirmed - ${homeBrand.name}`} />

            <OrderConfirmedOverlay
                open={popupOpen}
                onClose={closePopup}
                orderNumber={order.orderNumber}
                grandTotal={order.grandTotal}
                estimatedDeliveryDate={order.estimatedDeliveryDate}
                isCod={isCod}
            />

            <div className="min-h-screen bg-[#FCFAF5] font-sans text-[#09233D] antialiased">
                <HomeHeader />

                <main className="mx-auto max-w-3xl px-4 py-10 pt-home-header sm:px-6 sm:py-16">
                    <div className="text-center">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#062A4D]/25 bg-[#F5F1E8] text-[#062A4D] sm:h-20 sm:w-20">
                            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.6} />
                        </div>
                        <p className="mt-6 text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">
                            {isCod ? 'Order Placed' : 'Payment Successful'}
                        </p>
                        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl">
                            Order Confirmed
                        </h1>
                        <HomeBrandMotif className="mt-4" />
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#647487]">
                            Thank you. Your order{' '}
                            <span className="font-medium text-[#09233D]">{order.orderNumber}</span> has been placed
                            successfully.
                            {isCod ? ' Please keep the order amount ready at delivery.' : ''}
                        </p>
                        {isCod && (
                            <p className="mt-2 text-xs tracking-[0.12em] text-[#062A4D] uppercase">Cash on Delivery</p>
                        )}
                    </div>

                    <div className="mt-10 grid gap-5">
                        <section className="border border-[#E8DDC5] bg-white p-5 sm:p-6">
                            <h2 className="text-[11px] font-medium tracking-[0.18em] text-[#062A4D] uppercase">
                                Order Summary
                            </h2>
                            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-[#647487]">Order Number</dt>
                                    <dd className="mt-1 font-medium break-all text-[#09233D]">{order.orderNumber}</dd>
                                </div>
                                <div>
                                    <dt className="text-[#647487]">Payment Method</dt>
                                    <dd className="mt-1 font-medium text-[#09233D]">
                                        {isCod ? 'Cash on Delivery' : 'Online Payment'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[#647487]">{isCod ? 'Payment Status' : 'Payment ID'}</dt>
                                    <dd className="mt-1 font-medium break-all text-[#09233D] capitalize">
                                        {isCod ? order.paymentStatus : (order.paymentId ?? '—')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[#647487]">Order Date</dt>
                                    <dd className="mt-1 font-medium text-[#09233D]">{formatOrderDate(order.placedAt)}</dd>
                                </div>
                            </dl>
                            <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#E8DDC5] pt-4">
                                <span className="text-sm text-[#647487]">Total Amount</span>
                                <span className="text-2xl font-semibold text-[#062A4D]">
                                    {formatPrice(order.grandTotal)}
                                </span>
                            </div>
                        </section>

                        <section className="border border-[#E8DDC5] bg-white p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#062A4D]" />
                                <div>
                                    <h2 className="text-[11px] font-medium tracking-[0.18em] text-[#062A4D] uppercase">
                                        Estimated Delivery
                                    </h2>
                                    <p className="mt-2 font-medium text-[#09233D]">
                                        {order.estimatedDeliveryDate ?? 'Within 5 business days'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {addressLines.length > 0 && (
                            <section className="border border-[#E8DDC5] bg-white p-5 sm:p-6">
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#062A4D]" />
                                    <div>
                                        <h2 className="text-[11px] font-medium tracking-[0.18em] text-[#062A4D] uppercase">
                                            Delivery Address
                                        </h2>
                                        <p className="mt-2 font-medium text-[#09233D]">{order.address?.fullName}</p>
                                        {order.address?.phone && (
                                            <p className="text-sm text-[#647487]">{order.address.phone}</p>
                                        )}
                                        <div className="mt-2 text-sm leading-6 text-[#647487]">
                                            {addressLines.map((line) => (
                                                <p key={line}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="border border-[#E8DDC5] bg-white p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-[#062A4D]" />
                                <h2 className="text-[11px] font-medium tracking-[0.18em] text-[#062A4D] uppercase">
                                    Ordered Products
                                </h2>
                            </div>
                            <ul className="mt-4 divide-y divide-[#E8DDC5]">
                                {order.items.map((item) => (
                                    <li
                                        key={`${item.name}-${item.variantLabel ?? ''}-${item.quantity}`}
                                        className="flex items-start justify-between gap-4 py-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium text-[#09233D]">{item.name}</p>
                                            {item.variantLabel && (
                                                <p className="text-[#647487]">{displayVariantLabel(item.variantLabel)}</p>
                                            )}
                                            <p className="text-[#647487]">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-[#09233D]">
                                            {formatPrice(item.salePrice * item.quantity)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href={orderShow.url(order.orderNumber)}
                            className={`h-11 px-6 text-[11px] ${checkoutCtaClass}`}
                        >
                            Track Order
                        </Link>
                        <Link
                            href={continueShoppingUrl}
                            className={`h-11 px-6 text-[11px] ${continueShoppingCtaClass}`}
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            href={ordersIndex.url()}
                            className="inline-flex h-11 items-center justify-center border border-[#E8DDC5] bg-white px-6 text-[11px] font-bold tracking-wide text-[#062A4D] uppercase transition hover:border-[#062A4D]"
                        >
                            View Orders
                        </Link>
                    </div>
                </main>

                <HomeFooter />
            </div>
        </>
    );
}
