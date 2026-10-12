import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CreditCard,
    Layers,
    Package,
    Percent,
    ShoppingBag,
    Tag,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CommerceStatusBadge from '@/components/admin/commerce-status-badge';
import { formatCurrency, formatDateTime } from '@/components/admin/commerce-utils';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { index as brandsIndex } from '@/routes/admin/brands';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as ordersIndex, show as orderShow } from '@/routes/admin/orders';
import { index as paymentsIndex } from '@/routes/admin/payments';
import { index as productsIndex } from '@/routes/admin/products';
import { index as usersIndex } from '@/routes/admin/users';
import { dashboard } from '@/routes';
import type { AdminOrder } from '@/types/admin';

type DashboardStats = {
    revenue: { total: number; this_month: number };
    orders: { total: number; pending: number; today: number };
    customers: { total: number; new_this_month: number };
    products: { total: number; active: number; low_stock: number };
    categories: number;
    brands: number;
    coupons: number;
    payments: number;
};

const statusColors: Record<string, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-blue-500',
    processing: 'bg-indigo-500',
    shipped: 'bg-violet-500',
    delivered: 'bg-emerald-500',
    cancelled: 'bg-red-500',
};

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    gradient,
    href,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    gradient: string;
    href?: string;
}) {
    const content = (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-5 text-white shadow-sm transition-transform hover:scale-[1.02]',
                gradient,
            )}
        >
            <div className="absolute -top-4 -right-4 size-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 size-20 rounded-full bg-white/5" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-white/85">{title}</p>
                    <p className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
                    {subtitle && <p className="text-xs text-white/75">{subtitle}</p>}
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
                {content}
            </Link>
        );
    }

    return content;
}

function MiniStat({
    label,
    value,
    href,
    className,
}: {
    label: string;
    value: number;
    href: string;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'flex flex-col gap-1 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50',
                className,
            )}
        >
            <span className="text-2xl font-bold tabular-nums">{value.toLocaleString('en-IN')}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </Link>
    );
}

export default function Dashboard({
    stats,
    orderStatusCounts,
    recentOrders,
}: {
    stats: DashboardStats;
    orderStatusCounts: Record<string, number>;
    recentOrders: AdminOrder[];
}) {
    const totalOrdersForBar = Object.values(orderStatusCounts).reduce((sum, n) => sum + n, 0);

    const statusEntries = Object.entries(orderStatusCounts).sort(([, a], [, b]) => b - a);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Dashboard"
                    description="Overview of your store — sales, orders, and catalog at a glance"
                />

                {/* Primary stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.revenue.total)}
                        subtitle={`${formatCurrency(stats.revenue.this_month)} this month`}
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                        href={paymentsIndex()}
                    />
                    <StatCard
                        title="Orders"
                        value={stats.orders.total}
                        subtitle={`${stats.orders.today} today · ${stats.orders.pending} pending`}
                        icon={ShoppingBag}
                        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                        href={ordersIndex()}
                    />
                    <StatCard
                        title="Customers"
                        value={stats.customers.total}
                        subtitle={`${stats.customers.new_this_month} new this month`}
                        icon={Users}
                        gradient="bg-gradient-to-br from-violet-500 to-purple-600"
                        href={usersIndex()}
                    />
                    <StatCard
                        title="Products"
                        value={stats.products.active}
                        subtitle={`${stats.products.total} total · ${stats.products.low_stock} low stock`}
                        icon={Package}
                        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                        href={productsIndex()}
                    />
                </div>

                {/* Secondary stats + order breakdown */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Catalog &amp; Offers</CardTitle>
                            <CardDescription>Quick counts across your store</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <MiniStat label="Categories" value={stats.categories} href={categoriesIndex()} />
                            <MiniStat label="Brands" value={stats.brands} href={brandsIndex()} />
                            <MiniStat label="Coupons" value={stats.coupons} href="/admin/coupons" />
                            <MiniStat
                                label="Paid Payments"
                                value={stats.payments}
                                href={paymentsIndex()}
                            />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Orders by Status</CardTitle>
                            <CardDescription>
                                {totalOrdersForBar} order{totalOrdersForBar === 1 ? '' : 's'} in total
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {statusEntries.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No orders yet.</p>
                            ) : (
                                <>
                                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                                        {statusEntries.map(([status, count]) => (
                                            <div
                                                key={status}
                                                className={cn(
                                                    'h-full transition-all',
                                                    statusColors[status] ?? 'bg-slate-400',
                                                )}
                                                style={{
                                                    width: `${(count / totalOrdersForBar) * 100}%`,
                                                }}
                                                title={`${status}: ${count}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {statusEntries.map(([status, count]) => (
                                            <div
                                                key={status}
                                                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                                            >
                                                <span
                                                    className={cn(
                                                        'size-2.5 shrink-0 rounded-full',
                                                        statusColors[status] ?? 'bg-slate-400',
                                                    )}
                                                />
                                                <span className="capitalize text-muted-foreground">
                                                    {status.replace(/_/g, ' ')}
                                                </span>
                                                <span className="ml-auto font-semibold tabular-nums">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent orders */}
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-base">Recent Orders</CardTitle>
                            <CardDescription>Latest customer orders</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                            <Link href={ordersIndex()}>
                                View all
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No orders placed yet.</p>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto rounded-lg border md:block">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">Order</th>
                                                <th className="px-4 py-3 text-left font-medium">Customer</th>
                                                <th className="px-4 py-3 text-left font-medium">Total</th>
                                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                                <th className="px-4 py-3 text-left font-medium">Placed</th>
                                                <th className="px-4 py-3 text-right font-medium" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map((order) => (
                                                <tr key={order.id} className="border-b last:border-0">
                                                    <td className="px-4 py-3 font-medium">
                                                        #{order.order_number}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-medium">
                                                            {order.user?.name ?? '—'}
                                                        </span>
                                                        {order.user?.email && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {order.user.email}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {formatCurrency(order.grand_total)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            <CommerceStatusBadge status={order.order_status} />
                                                            <CommerceStatusBadge status={order.payment_status} />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {formatDateTime(order.placed_at)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={orderShow(order.id)}>View</Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="space-y-3 md:hidden">
                                    {recentOrders.map((order) => (
                                        <Link
                                            key={order.id}
                                            href={orderShow(order.id)}
                                            className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold">#{order.order_number}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.user?.name ?? 'Guest'}
                                                    </p>
                                                </div>
                                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(order.grand_total)}
                                                </p>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <CommerceStatusBadge status={order.order_status} />
                                                <CommerceStatusBadge status={order.payment_status} />
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(order.placed_at)}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                    {[
                        { label: 'Products', href: productsIndex(), icon: Package, color: 'text-orange-500' },
                        { label: 'Orders', href: ordersIndex(), icon: ShoppingBag, color: 'text-blue-500' },
                        { label: 'Customers', href: usersIndex(), icon: Users, color: 'text-violet-500' },
                        { label: 'Categories', href: categoriesIndex(), icon: Layers, color: 'text-cyan-500' },
                        { label: 'Brands', href: brandsIndex(), icon: Tag, color: 'text-pink-500' },
                        { label: 'Payments', href: paymentsIndex(), icon: CreditCard, color: 'text-emerald-500' },
                        { label: 'Coupons', href: '/admin/coupons', icon: Percent, color: 'text-amber-500' },
                    ].map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:bg-muted/50"
                        >
                            <link.icon className={cn('size-6', link.color)} />
                            <span className="text-xs font-medium">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
