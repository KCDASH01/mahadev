import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Package } from 'lucide-react';
import { OrderTrackingTimeline } from '@/components/account/order-tracking-timeline';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { homeBrand } from '@/data/home-brand';
import { formatPrice } from '@/data/fashion-products';
import { displayVariantLabel } from '@/lib/size-label';
import {
    formatOrderStatus,
    formatPaymentStatus,
    orderStatusBadgeClass,
    paymentStatusBadgeClass,
} from '@/lib/order-display';
import { index as ordersIndex } from '@/routes/account/orders';

type OrderShowProps = {
    order: {
        orderNumber: string;
        placedAt?: string | null;
        grandTotal: number;
        subtotal: number;
        couponDiscount: number;
        shippingCharge: number;
        orderStatus: string;
        paymentStatus: string;
        paymentMethod: string;
        estimatedDeliveryDate?: string | null;
        couponCode?: string | null;
        paymentId?: string | null;
        items: Array<{
            name: string;
            quantity: number;
            salePrice: number;
            variantLabel?: string | null;
        }>;
        trackings: Array<{
            status: string;
            remarks?: string | null;
            createdAt?: string | null;
        }>;
        shipment?: {
            status: string;
            courierName?: string | null;
            awbNumber?: string | null;
            trackingUrl?: string | null;
            estimatedDeliveryDate?: string | null;
        } | null;
    };
};

function formatDateTime(iso?: string | null): string {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OrderShow({ order }: OrderShowProps) {
    return (
        <>
            <Head title={`Order ${order.orderNumber} - ${homeBrand.name}`} />

            <div className="min-h-screen bg-[#FCFAF5] font-sans text-[#09233D] antialiased">
                <HomeHeader />

                <main className="mx-auto max-w-4xl px-4 py-8 pt-home-header sm:px-6 sm:py-12">
                    <Link
                        href={ordersIndex.url()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#062A4D] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Orders
                    </Link>

                    <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">Order Details</p>
                            <h1 className="mt-3 text-2xl font-semibold tracking-normal text-[#09233D] sm:text-3xl">#{order.orderNumber}</h1>
                            <p className="mt-2 text-sm text-slate-500">Placed on {formatDateTime(order.placedAt)}</p>
                            <p className="mt-1 text-sm text-slate-500">
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                {order.estimatedDeliveryDate
                                    ? ` · Estimated delivery by ${order.estimatedDeliveryDate}`
                                    : ''}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${orderStatusBadgeClass(order.orderStatus)}`}>
                                {formatOrderStatus(order.orderStatus)}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusBadgeClass(order.paymentMethod, order.paymentStatus)}`}>
                                {formatPaymentStatus(order.paymentMethod, order.paymentStatus)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6">
                        <OrderTrackingTimeline
                            trackings={order.trackings}
                            orderStatus={order.orderStatus}
                            paymentMethod={order.paymentMethod}
                            paymentStatus={order.paymentStatus}
                            estimatedDeliveryDate={order.estimatedDeliveryDate}
                            shipment={order.shipment}
                        />

                        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                            <section className="border border-[#E8DDC5] bg-white p-5 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-[#062A4D]" />
                                    <h2 className="text-sm font-bold tracking-wide text-[#062A4D] uppercase">Items</h2>
                                </div>
                                <ul className="mt-4 divide-y divide-slate-100">
                                    {order.items.map((item) => (
                                        <li
                                            key={`${item.name}-${item.variantLabel ?? ''}-${item.quantity}`}
                                            className="flex justify-between gap-4 py-4 text-sm"
                                        >
                                            <div>
                                                <p className="font-semibold text-neutral-900">{item.name}</p>
                                                {item.variantLabel && (
                                                    <p className="text-slate-500">{displayVariantLabel(item.variantLabel)}</p>
                                                )}
                                                <p className="text-slate-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">{formatPrice(item.salePrice * item.quantity)}</p>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="border border-[#E8DDC5] bg-white p-5 sm:p-6 lg:h-fit">
                                <h2 className="text-sm font-bold tracking-wide text-[#062A4D] uppercase">Payment</h2>
                                <dl className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Subtotal</dt>
                                        <dd>{formatPrice(order.subtotal)}</dd>
                                    </div>
                                    {order.couponDiscount > 0 && (
                                        <div className="flex justify-between text-emerald-700">
                                            <dt>Coupon ({order.couponCode})</dt>
                                            <dd>-{formatPrice(order.couponDiscount)}</dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Shipping</dt>
                                        <dd>{formatPrice(order.shippingCharge)}</dd>
                                    </div>
                                    <div className="flex justify-between border-t border-[#E8DDC5] pt-2 font-bold text-[#062A4D]">
                                        <dt>Grand Total</dt>
                                        <dd>{formatPrice(order.grandTotal)}</dd>
                                    </div>
                                    {order.paymentId && (
                                        <div className="pt-2">
                                            <dt className="text-slate-500">Payment ID</dt>
                                            <dd className="mt-1 break-all font-medium">{order.paymentId}</dd>
                                        </div>
                                    )}
                                </dl>
                            </section>
                        </div>
                    </div>
                </main>

                <HomeFooter />
            </div>
        </>
    );
}
