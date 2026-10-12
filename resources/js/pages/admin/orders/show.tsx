import { Form, Head, Link } from '@inertiajs/react';
import { CheckCircle2, Circle, ExternalLink, Truck } from 'lucide-react';
import CommerceStatusBadge from '@/components/admin/commerce-status-badge';
import {
    formatCommerceStatus,
    formatCurrency,
    formatDate,
    formatDateTime,
} from '@/components/admin/commerce-utils';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { index as ordersIndex } from '@/routes/admin/orders';
import { show as userShow } from '@/routes/admin/users';
import type { AdminOrder } from '@/types/admin';

function formatShipmentStatus(status?: string | null): string {
    if (!status) {
        return '—';
    }

    return status.replace(/_/g, ' ');
}

const selectClass =
    'border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

export default function OrdersShow({
    order,
    orderStatusOptions,
    paymentStatusOptions,
}: {
    order: AdminOrder;
    orderStatusOptions: string[];
    paymentStatusOptions: string[];
}) {
    const address = order.shipping_address_snapshot;
    const shipment = order.shipment ?? null;
    const trackings = [...(order.trackings ?? [])].sort(
        (a, b) =>
            new Date(a.created_at ?? 0).getTime() -
            new Date(b.created_at ?? 0).getTime(),
    );

    return (
        <>
            <Head title={`Order #${order.order_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        title={`Order #${order.order_number}`}
                        description={`Placed on ${formatDateTime(order.placed_at)}`}
                    />
                    <Button variant="outline" asChild>
                        <Link href={ordersIndex()}>Back to Orders</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <CommerceStatusBadge status={order.order_status} />
                    <CommerceStatusBadge status={order.payment_status} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Status Management</CardTitle>
                        <CardDescription>
                            Update the order and payment status. Cancelling an order also stops the Delhivery pickup when an AWB exists.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <Form
                            action={`/admin/orders/${order.id}/status`}
                            method="post"
                            className="space-y-3"
                        >
                            {({ processing }) => (
                                <>
                                    <Label htmlFor="order_status">Order Status</Label>
                                    <div className="flex gap-2">
                                        <select
                                            id="order_status"
                                            name="order_status"
                                            defaultValue={order.order_status}
                                            className={selectClass}
                                        >
                                            {orderStatusOptions.map((status) => (
                                                <option key={status} value={status} className="capitalize">
                                                    {formatCommerceStatus(status)}
                                                </option>
                                            ))}
                                        </select>
                                        <Button type="submit" disabled={processing}>
                                            Update
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>

                        <Form
                            action={`/admin/orders/${order.id}/payment-status`}
                            method="post"
                            className="space-y-3"
                        >
                            {({ processing }) => (
                                <>
                                    <Label htmlFor="payment_status">Payment Status</Label>
                                    <div className="flex gap-2">
                                        <select
                                            id="payment_status"
                                            name="payment_status"
                                            defaultValue={order.payment_status}
                                            className={selectClass}
                                        >
                                            {paymentStatusOptions.map((status) => (
                                                <option key={status} value={status} className="capitalize">
                                                    {formatCommerceStatus(status)}
                                                </option>
                                            ))}
                                        </select>
                                        <Button type="submit" disabled={processing}>
                                            Update
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="size-5" />
                            Shipping Information
                        </CardTitle>
                        <CardDescription>
                            Delhivery shipment details and actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {shipment ? (
                            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <p className="text-muted-foreground">Shipment Status</p>
                                    <p className="font-medium capitalize">{formatShipmentStatus(shipment.shipment_status)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Tracking Status</p>
                                    <p className="font-medium capitalize">{formatShipmentStatus(shipment.tracking_status)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">AWB Number</p>
                                    <p className="font-medium">{shipment.awb_number ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Courier</p>
                                    <p className="font-medium">{shipment.courier_name ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Pickup Location</p>
                                    <p className="font-medium">{shipment.warehouse_id}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Weight</p>
                                    <p className="font-medium">{shipment.weight ? `${shipment.weight} kg` : '—'}</p>
                                </div>
                                {(shipment.failure_reason ?? shipment.display_failure_reason) && (
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <p className="text-muted-foreground">Last Error</p>
                                        <p className="font-medium text-red-600">
                                            {shipment.failure_reason ?? shipment.display_failure_reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No Delhivery shipment has been created for this order yet.
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {!shipment?.awb_number && (
                                <Form action={`/admin/orders/${order.id}/shipment/create`} method="post">
                                    {({ processing }) => (
                                        <Button type="submit" disabled={processing}>
                                            Create Shipment
                                        </Button>
                                    )}
                                </Form>
                            )}
                            {shipment?.awb_number && (
                                <>
                                    <Form action={`/admin/orders/${order.id}/shipment/track`} method="post">
                                        {({ processing }) => (
                                            <Button type="submit" variant="outline" disabled={processing}>
                                                Refresh Status
                                            </Button>
                                        )}
                                    </Form>
                                    {shipment.tracking_url && (
                                        <Button variant="outline" asChild>
                                            <a href={shipment.tracking_url} target="_blank" rel="noreferrer">
                                                Track Shipment
                                                <ExternalLink className="size-3.5" />
                                            </a>
                                        </Button>
                                    )}
                                    {shipment.label_url && (
                                        <Button variant="outline" asChild>
                                            <a href={shipment.label_url} target="_blank" rel="noreferrer">
                                                Download Label
                                                <ExternalLink className="size-3.5" />
                                            </a>
                                        </Button>
                                    )}
                                    {shipment.manifest_url && (
                                        <Button variant="outline" asChild>
                                            <a href={shipment.manifest_url} target="_blank" rel="noreferrer">
                                                Download Manifest
                                                <ExternalLink className="size-3.5" />
                                            </a>
                                        </Button>
                                    )}
                                    {shipment.shipment_status !== 'cancelled' && shipment.shipment_status !== 'delivered' && (
                                        <Form action={`/admin/orders/${order.id}/shipment/cancel`} method="post">
                                            {({ processing }) => (
                                                <Button type="submit" variant="destructive" disabled={processing}>
                                                    Cancel Shipment
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {order.user ? (
                                <>
                                    <div>
                                        <Link
                                            href={userShow(order.user.id)}
                                            className="font-medium hover:underline"
                                        >
                                            {order.user.name}
                                        </Link>
                                        <p className="text-muted-foreground">
                                            {order.user.email}
                                        </p>
                                        {order.user.phone && (
                                            <p className="text-muted-foreground">
                                                {order.user.phone}
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">—</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            {address ? (
                                <>
                                    <p className="font-medium">{address.full_name}</p>
                                    {address.phone && (
                                        <p className="text-muted-foreground">{address.phone}</p>
                                    )}
                                    <p className="text-muted-foreground">
                                        {[address.address_line_1, address.address_line_2, address.landmark]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {[address.city, address.state, address.pincode]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted-foreground">—</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {Number(order.coupon_discount) > 0 && (
                                <div className="flex justify-between gap-4 text-emerald-700">
                                    <span>
                                        Coupon
                                        {order.coupon_code
                                            ? ` (${order.coupon_code})`
                                            : ''}
                                    </span>
                                    <span>
                                        -
                                        {formatCurrency(order.coupon_discount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Shipping
                                </span>
                                <span>
                                    {formatCurrency(order.shipping_charge)}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
                                <span>Grand Total</span>
                                <span>{formatCurrency(order.grand_total)}</span>
                            </div>
                            <div className="flex justify-between gap-4 pt-2">
                                <span className="text-muted-foreground">
                                    Payment Method
                                </span>
                                <span className="uppercase">
                                    {order.payment_method}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Estimated Delivery
                                </span>
                                <span>
                                    {formatDate(order.estimated_delivery_date)}
                                </span>
                            </div>
                            {order.transaction_id && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        Transaction ID
                                    </span>
                                    <span className="break-all text-right">
                                        {order.transaction_id}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                            <CardDescription>
                                {(order.items ?? []).length} item
                                {(order.items ?? []).length === 1 ? '' : 's'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(order.items ?? []).length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No items in this order.
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Product
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items?.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">
                                                            {item.product_name}
                                                        </p>
                                                        {item.variant_label && (
                                                            <p className="text-muted-foreground">
                                                                {
                                                                    item.variant_label
                                                                }
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {formatCurrency(
                                                            Number(
                                                                item.sale_price,
                                                            ) * item.quantity,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Attempts</CardTitle>
                            <CardDescription>
                                Razorpay payment history for this order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(order.payments ?? []).length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No payment records found.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {order.payments?.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="rounded-lg border p-4 text-sm"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-medium">
                                                    {payment.payment_gateway}
                                                </span>
                                                <CommerceStatusBadge
                                                    status={payment.status}
                                                />
                                            </div>
                                            <p className="mt-2 font-semibold">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            {payment.razorpay_payment_id && (
                                                <p className="mt-1 break-all text-muted-foreground">
                                                    {payment.razorpay_payment_id}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatDateTime(
                                                    payment.paid_at ??
                                                        payment.created_at,
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {trackings.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tracking Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-4">
                                {trackings.map((tracking, index) => (
                                    <li
                                        key={tracking.id}
                                        className="flex gap-3"
                                    >
                                        {index === trackings.length - 1 ? (
                                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                                        ) : (
                                            <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground/40" />
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold capitalize">
                                                {formatCommerceStatus(
                                                    tracking.status,
                                                )}
                                            </p>
                                            {tracking.remarks && (
                                                <p className="text-sm text-muted-foreground">
                                                    {tracking.remarks}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(
                                                    tracking.created_at,
                                                )}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

OrdersShow.layout = {
    breadcrumbs: [
        { title: 'Orders', href: ordersIndex() },
        { title: 'Order Details' },
    ],
};
