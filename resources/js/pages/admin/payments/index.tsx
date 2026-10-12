import { Head, Link } from '@inertiajs/react';
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
import { show as orderShow } from '@/routes/admin/orders';
import { index } from '@/routes/admin/payments';
import { show as userShow } from '@/routes/admin/users';
import { useAdminFilters } from '@/hooks/use-admin-filters';
import type { AdminPayment, Paginated } from '@/types/admin';

export default function PaymentsIndex({
    payments,
    filters = { search: '', customer: '', date_from: '', date_to: '' },
}: {
    payments: Paginated<AdminPayment>;
    filters?: {
        search?: string;
        customer?: string;
        date_from?: string;
        date_to?: string;
    };
}) {
    const { values, setValue, clearFilters, hasActiveFilters, isFiltering } = useAdminFilters(
        index.url(),
        filters,
        { only: ['payments', 'filters'] },
    );

    return (
        <>
            <Head title="Payments History" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Payments History"
                    description="All Razorpay payment attempts and transactions"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>All Payments</CardTitle>
                        <CardDescription>
                            {payments.total} payment record
                            {payments.total === 1 ? '' : 's'} in total
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AdminFiltersBar showClear={hasActiveFilters} onClear={clearFilters}>
                            <AdminSearchField
                                value={values.search ?? ''}
                                onChange={(value) => setValue('search', value)}
                                placeholder="Payment ID, order ID, or order #..."
                                isLoading={isFiltering}
                            />
                            <AdminSearchField
                                label="Customer"
                                value={values.customer ?? ''}
                                onChange={(value) => setValue('customer', value)}
                                placeholder="Name or email..."
                                isLoading={isFiltering}
                            />
                            <AdminDateField
                                label="Date from"
                                value={values.date_from ?? ''}
                                onChange={(value) => setValue('date_from', value, true)}
                            />
                            <AdminDateField
                                label="Date to"
                                value={values.date_to ?? ''}
                                onChange={(value) => setValue('date_to', value, true)}
                            />
                        </AdminFiltersBar>

                        <AdminFilterableContent isFiltering={isFiltering}>
                        {payments.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? 'No payments match your filters.'
                                    : 'No payment records yet.'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                ID
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Order
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Customer
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Gateway
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Razorpay Payment ID
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.data.map((payment) => (
                                            <tr
                                                key={payment.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    #{payment.id}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {payment.order ? (
                                                        <Link
                                                            href={orderShow(
                                                                payment.order.id,
                                                            )}
                                                            className="hover:underline"
                                                        >
                                                            #
                                                            {
                                                                payment.order
                                                                    .order_number
                                                            }
                                                        </Link>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {payment.order?.user ? (
                                                        <div>
                                                            <Link
                                                                href={userShow(
                                                                    payment.order
                                                                        .user.id,
                                                                )}
                                                                className="font-medium hover:underline"
                                                            >
                                                                {
                                                                    payment.order
                                                                        .user
                                                                        .name
                                                                }
                                                            </Link>
                                                            <p className="text-muted-foreground">
                                                                {
                                                                    payment.order
                                                                        .user
                                                                        .email
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 capitalize">
                                                    {payment.payment_gateway}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <CommerceStatusBadge
                                                        status={payment.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="break-all text-muted-foreground">
                                                        {payment.razorpay_payment_id ??
                                                            '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDateTime(
                                                        payment.paid_at ??
                                                            payment.created_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end">
                                                        {payment.order && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={orderShow(
                                                                        payment
                                                                            .order
                                                                            .id,
                                                                    )}
                                                                >
                                                                    View Order
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <PaginationLinks paginator={payments} />
                        </AdminFilterableContent>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PaymentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Payments History',
            href: index(),
        },
    ],
};
