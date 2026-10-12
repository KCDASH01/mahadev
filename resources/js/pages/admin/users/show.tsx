import { Head, Link } from '@inertiajs/react';
import CommerceStatusBadge from '@/components/admin/commerce-status-badge';
import {
    formatCurrency,
    formatDate,
    formatDateTime,
} from '@/components/admin/commerce-utils';
import PaginationLinks from '@/components/admin/pagination-links';
import StatusBadge from '@/components/admin/status-badge';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index as ordersIndex, show as orderShow } from '@/routes/admin/orders';
import { index as usersIndex } from '@/routes/admin/users';
import type { AdminOrder, AdminUser, Paginated } from '@/types/admin';

export default function UsersShow({
    user,
    orders,
}: {
    user: AdminUser;
    orders: Paginated<AdminOrder>;
}) {
    return (
        <>
            <Head title={`User - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        title={user.name}
                        description="Customer profile and order history"
                    />
                    <Button variant="outline" asChild>
                        <Link href={usersIndex()}>Back to Users</Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Email
                                </span>
                                <span className="text-right">{user.email}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Phone
                                </span>
                                <span>{user.phone ?? '—'}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                <StatusBadge status={user.status} />
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Role
                                </span>
                                <span className="capitalize">{user.role}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Total Orders
                                </span>
                                <span>{user.orders_count ?? 0}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Registered
                                </span>
                                <span>{formatDate(user.created_at)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>
                                All orders placed by this customer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {orders.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    This customer has not placed any orders yet.
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
                                                                    href={orderShow(
                                                                        order.id,
                                                                    )}
                                                                >
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

UsersShow.layout = {
    breadcrumbs: [
        { title: 'User Management', href: usersIndex() },
        { title: 'Customer Details' },
    ],
};
