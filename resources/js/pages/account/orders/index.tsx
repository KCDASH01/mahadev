import { Link } from '@inertiajs/react';
import { ChevronRight, Package } from 'lucide-react';
import { formatPrice } from '@/data/fashion-products';
import {
    formatOrderStatus,
    formatPaymentStatus,
    orderStatusBadgeClass,
    paymentStatusBadgeClass,
} from '@/lib/order-display';
import { StorefrontAccountLayout } from '@/layouts/storefront-account-layout';
import { show as orderShow } from '@/routes/account/orders';

type OrderListItem = {
    orderNumber: string;
    placedAt?: string | null;
    grandTotal: number;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    estimatedDeliveryDate?: string | null;
};

function formatPaymentMethod(method: string): string {
    return method === 'cod' ? 'Cash on Delivery' : 'Online Payment';
}

type OrdersIndexProps = {
    orders: {
        data: OrderListItem[];
        current_page: number;
        last_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
};

function formatOrderDate(iso?: string | null): string {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function OrdersIndex({ orders }: OrdersIndexProps) {
    return (
        <StorefrontAccountLayout
            title="My Orders"
            description={`${orders.total} order${orders.total === 1 ? '' : 's'} in your account`}
        >
            {orders.data.length === 0 ? (
                <div className="py-8 text-center">
                    <Package className="mx-auto h-12 w-12 text-slate-300" />
                    <h2 className="mt-4 font-serif text-xl font-medium text-[#09233D]">No orders yet</h2>
                    <p className="mt-2 text-[#647487]">When you place an order, it will appear here.</p>
                    <Link
                        href="/collection/men"
                        className="mt-6 inline-flex h-11 items-center bg-[#062A4D] px-7 text-[11px] font-medium tracking-[0.2em] text-[#FCFAF5] uppercase transition hover:bg-[#041F3A]"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.data.map((order) => (
                        <Link
                            key={order.orderNumber}
                            href={orderShow.url(order.orderNumber)}
                            className="block border border-[#E8DDC5] p-5 transition hover:border-[#062A4D]/40 hover:shadow-[0_12px_28px_-18px_rgba(74,18,28,0.45)]"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Order #{order.orderNumber}</p>
                                    <p className="mt-1 font-semibold text-neutral-900">
                                        {formatPrice(order.grandTotal)}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Placed {formatOrderDate(order.placedAt)} · {formatPaymentMethod(order.paymentMethod)}
                                    </p>
                                    {order.estimatedDeliveryDate && (
                                        <p className="mt-1 text-sm text-slate-500">
                                            Estimated delivery by {order.estimatedDeliveryDate}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${orderStatusBadgeClass(order.orderStatus)}`}
                                    >
                                        {formatOrderStatus(order.orderStatus)}
                                    </span>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusBadgeClass(order.paymentMethod, order.paymentStatus)}`}
                                    >
                                        {formatPaymentStatus(order.paymentMethod, order.paymentStatus)}
                                    </span>
                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {orders.last_page > 1 && (
                <div className="mt-8 flex justify-center gap-4">
                    {orders.prev_page_url && (
                        <Link href={orders.prev_page_url} className="text-sm font-semibold text-[#062A4D] hover:underline">
                            Previous
                        </Link>
                    )}
                    <span className="text-sm text-slate-500">
                        Page {orders.current_page} of {orders.last_page}
                    </span>
                    {orders.next_page_url && (
                        <Link href={orders.next_page_url} className="text-sm font-semibold text-[#062A4D] hover:underline">
                            Next
                        </Link>
                    )}
                </div>
            )}
        </StorefrontAccountLayout>
    );
}
