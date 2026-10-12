import { Head, Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import CommerceStatusBadge from '@/components/admin/commerce-status-badge';
import {
    formatCurrency,
    formatDateTime,
} from '@/components/admin/commerce-utils';
import {
    AdminDateField,
    AdminFilterableContent,
    AdminFiltersBar,
    AdminSearchField,
    AdminSelectField,
} from '@/components/admin/admin-list-filters';
import PaginationLinks from '@/components/admin/pagination-links';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index, show } from '@/routes/admin/orders';
import { show as userShow } from '@/routes/admin/users';
import { useAdminFilters } from '@/hooks/use-admin-filters';
import type { AdminOrder, Paginated } from '@/types/admin';

export default function OrdersIndex({
    orders,
    filters = { search: '', customer: '', order_status: '', payment_status: '', placed_from: '', placed_to: '' },
    orderStatusOptions = [],
    paymentStatusOptions = [],
}: {
    orders: Paginated<AdminOrder>;
    filters?: {
        search?: string;
        customer?: string;
        order_status?: string;
        payment_status?: string;
        placed_from?: string;
        placed_to?: string;
    };
    orderStatusOptions?: string[];
    paymentStatusOptions?: string[];
}) {
    const { values, setValue, clearFilters, hasActiveFilters, isFiltering } = useAdminFilters(
        index.url(),
        filters,
        { only: ['orders', 'filters'] },
    );

    return (
        <>
            <Head title="Orders" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Orders"
                    description="All customer orders with payment and fulfillment status"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>All Orders</CardTitle>
                        <CardDescription>
                            {orders.total} order
                            {orders.total === 1 ? '' : 's'} in total
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AdminFiltersBar showClear={hasActiveFilters} onClear={clearFilters}>
                            <AdminSearchField
                                label="Order #"
                                value={values.search ?? ''}
                                onChange={(value) => setValue('search', value)}
                                placeholder="Search by order number..."
                                isLoading={isFiltering}
                            />
                            <AdminSearchField
                                label="Customer"
                                value={values.customer ?? ''}
                                onChange={(value) => setValue('customer', value)}
                                placeholder="Name, email, or phone..."
                                isLoading={isFiltering}
                            />
                            <AdminSelectField
                                label="Order Status"
                                value={values.order_status ?? ''}
                                onChange={(value) => setValue('order_status', value, true)}
                                placeholder="All Order Statuses"
                                options={orderStatusOptions.map((status) => ({
                                    value: status,
                                    label: status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                                }))}
                            />
                            <AdminSelectField
                                label="Payment Status"
                                value={values.payment_status ?? ''}
                                onChange={(value) => setValue('payment_status', value, true)}
                                placeholder="All Payment Statuses"
                                options={paymentStatusOptions.map((status) => ({
                                    value: status,
                                    label: status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                                }))}
                            />
                            <AdminDateField
                                label="Placed from"
                                value={values.placed_from ?? ''}
                                onChange={(value) => setValue('placed_from', value, true)}
                            />
                            <AdminDateField
                                label="Placed to"
                                value={values.placed_to ?? ''}
                                onChange={(value) => setValue('placed_to', value, true)}
                            />
                        </AdminFiltersBar>

                        <AdminFilterableContent isFiltering={isFiltering}>
                        {orders.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? 'No orders match your filters.'
                                    : 'No orders have been placed yet.'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Order
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Customer
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Items
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Total
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Order Status
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Payment
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Placed
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.data.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    #{order.order_number}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {order.user ? (
                                                        <div>
                                                            <Link
                                                                href={userShow(
                                                                    order.user
                                                                        .id,
                                                                )}
                                                                className="font-medium hover:underline"
                                                            >
                                                                {
                                                                    order.user
                                                                        .name
                                                                }
                                                            </Link>
                                                            <p className="text-muted-foreground">
                                                                {
                                                                    order.user
                                                                        .email
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {order.items_count ?? 0}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {formatCurrency(
                                                        order.grand_total,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <CommerceStatusBadge
                                                        status={
                                                            order.order_status
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <CommerceStatusBadge
                                                        status={
                                                            order.payment_status
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDateTime(
                                                        order.placed_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={show(
                                                                    order.id,
                                                                )}
                                                            >
                                                                <Eye className="size-3.5" />
                                                                View
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <PaginationLinks paginator={orders} />
                        </AdminFilterableContent>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Orders',
            href: index(),
        },
    ],
};
