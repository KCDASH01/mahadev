import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminDestroyForm, adminDeleteUrl } from '@/components/admin/admin-destroy-form';
import {
    AdminFilterableContent,
    AdminFiltersBar,
    AdminSearchField,
    AdminSelectField,
} from '@/components/admin/admin-list-filters';
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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { Coupon, Paginated } from '@/types/admin';
import { index } from '@/routes/admin/coupons';
import { useAdminFilters } from '@/hooks/use-admin-filters';

export default function CouponsIndex({
    coupons,
    couponTypes = [],
    filters = { search: '', type: '' },
}: {
    coupons: Paginated<Coupon>;
    couponTypes?: Array<{ value: string; label: string }>;
    filters?: { search?: string; type?: string };
}) {
    const { values, setValue, clearFilters, hasActiveFilters, isFiltering } = useAdminFilters(
        index.url(),
        filters,
        { only: ['coupons', 'filters'] },
    );

    return (
        <>
            <Head title="Coupons" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Coupons" description="Manage offers and coupon codes" />
                    <Button asChild>
                        <Link href="/admin/coupons/create">
                            <Plus className="size-4" />
                            Add Coupon
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Coupons</CardTitle>
                        <CardDescription>
                            {coupons.total} coupon{coupons.total === 1 ? '' : 's'} in total
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AdminFiltersBar showClear={hasActiveFilters} onClear={clearFilters}>
                            <AdminSearchField
                                value={values.search ?? ''}
                                onChange={(value) => setValue('search', value)}
                                placeholder="Search by code or title..."
                                isLoading={isFiltering}
                            />
                            <AdminSelectField
                                label="Type"
                                value={values.type ?? ''}
                                onChange={(value) => setValue('type', value, true)}
                                options={couponTypes}
                                placeholder="All types"
                            />
                        </AdminFiltersBar>

                        <AdminFilterableContent isFiltering={isFiltering}>
                        {coupons.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? 'No coupons match your filters.'
                                    : 'No coupons yet. Create your first coupon.'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Code</th>
                                            <th className="px-4 py-3 text-left font-medium">Title</th>
                                            <th className="px-4 py-3 text-left font-medium">Type</th>
                                            <th className="px-4 py-3 text-left font-medium">Used</th>
                                            <th className="px-4 py-3 text-left font-medium">Total Discount</th>
                                            <th className="px-4 py-3 text-left font-medium">Status</th>
                                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.data.map((coupon) => (
                                            <tr key={coupon.id} className="border-b last:border-b-0">
                                                <td className="px-4 py-3 font-semibold">{coupon.code}</td>
                                                <td className="px-4 py-3">{coupon.title || '—'}</td>
                                                <td className="px-4 py-3 capitalize">{coupon.type.replace(/_/g, ' ')}</td>
                                                <td className="px-4 py-3">
                                                    {coupon.used_count}
                                                    {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                                                </td>
                                                <td className="px-4 py-3">
                                                    ₹{Number(coupon.usages_sum_discount_amount ?? 0).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={coupon.status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="icon" asChild>
                                                            <Link href={`/admin/coupons/${coupon.id}`}>
                                                                <Eye className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="icon" asChild>
                                                            <Link href={`/admin/coupons/${coupon.id}/edit`}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="icon">
                                                                    <Trash2 className="size-4 text-destructive" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogTitle>Delete coupon</DialogTitle>
                                                                <DialogDescription>
                                                                    Delete coupon {coupon.code}? This cannot be undone.
                                                                </DialogDescription>
                                                                <DialogFooter>
                                                                    <DialogClose asChild>
                                                                        <Button variant="outline">Cancel</Button>
                                                                    </DialogClose>
                                                                    <AdminDestroyForm
                                                                        action={adminDeleteUrl(
                                                                            '/admin/coupons',
                                                                            coupon.id,
                                                                        )}
                                                                    >
                                                                        {({ processing }) => (
                                                                            <Button type="submit" variant="destructive" disabled={processing}>
                                                                                Delete
                                                                            </Button>
                                                                        )}
                                                                    </AdminDestroyForm>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <PaginationLinks paginator={coupons} />
                        </AdminFilterableContent>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CouponsIndex.layout = {
    breadcrumbs: [{ title: 'Coupons', href: '/admin/coupons' }],
};
