import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import StatusBadge from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Coupon } from '@/types/admin';

export default function CouponsShow({ coupon }: { coupon: Coupon }) {
    return (
        <>
            <Head title={`Coupon ${coupon.code}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        title={coupon.code}
                        description={coupon.title || 'Coupon usage history and performance'}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/coupons/${coupon.id}/edit`}>Edit</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/coupons">Back</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Status</span>
                                <StatusBadge status={coupon.status} />
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Type</span>
                                <span className="capitalize">{coupon.type.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Times Used</span>
                                <span>{coupon.used_count}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Total Discount Given</span>
                                <span className="font-semibold">
                                    ₹{Number(coupon.total_discount_given ?? 0).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Usage History</CardTitle>
                            <CardDescription>Users and orders that used this coupon</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(coupon.usages ?? []).length === 0 ? (
                                <p className="text-sm text-muted-foreground">This coupon has not been used yet.</p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">User</th>
                                                <th className="px-4 py-3 text-left font-medium">Order</th>
                                                <th className="px-4 py-3 text-left font-medium">Discount</th>
                                                <th className="px-4 py-3 text-left font-medium">Used At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coupon.usages?.map((usage) => (
                                                <tr key={usage.id} className="border-b last:border-b-0">
                                                    <td className="px-4 py-3">
                                                        {usage.user ? (
                                                            <div>
                                                                <p className="font-medium">{usage.user.name}</p>
                                                                <p className="text-muted-foreground">{usage.user.email}</p>
                                                            </div>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {usage.order ? `#${usage.order.order_number}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        ₹{usage.discount_amount.toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {usage.used_at
                                                            ? new Date(usage.used_at).toLocaleString('en-IN')
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

CouponsShow.layout = {
    breadcrumbs: [{ title: 'Coupons', href: '/admin/coupons' }],
};
