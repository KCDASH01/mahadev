import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminDestroyForm, adminDeleteUrl } from '@/components/admin/admin-destroy-form';
import {
    AdminFilterableContent,
    AdminFiltersBar,
    AdminSearchField,
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
import { create, edit, index } from '@/routes/admin/brands';
import { useAdminFilters } from '@/hooks/use-admin-filters';
import type { Brand, Paginated } from '@/types/admin';

export default function BrandsIndex({
    brands,
    filters = { search: '' },
}: {
    brands: Paginated<Brand>;
    filters?: { search?: string };
}) {
    const { values, setValue, clearFilters, hasActiveFilters, isFiltering } = useAdminFilters(
        index.url(),
        filters,
        { only: ['brands', 'filters'] },
    );

    return (
        <>
            <Head title="Brands" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Brands"
                        description="Manage product brands"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Brand
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Brands</CardTitle>
                        <CardDescription>
                            {brands.total} brand
                            {brands.total === 1 ? '' : 's'} in total
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AdminFiltersBar showClear={hasActiveFilters} onClear={clearFilters}>
                            <AdminSearchField
                                value={values.search ?? ''}
                                onChange={(value) => setValue('search', value)}
                                placeholder="Search by name or slug..."
                                isLoading={isFiltering}
                            />
                        </AdminFiltersBar>

                        <AdminFilterableContent isFiltering={isFiltering}>
                        {brands.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? 'No brands match your search.'
                                    : 'No brands yet. Create your first brand.'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Slug
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Products
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {brands.data.map((brand) => (
                                            <tr
                                                key={brand.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {brand.name}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {brand.slug}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {brand.products_count ?? 0}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={brand.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={edit(
                                                                    brand.id,
                                                                )}
                                                            >
                                                                <Pencil className="size-3.5" />
                                                                Edit
                                                            </Link>
                                                        </Button>

                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                    Delete
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogTitle>
                                                                    Delete brand?
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    This will
                                                                    permanently
                                                                    delete{' '}
                                                                    <strong>
                                                                        {
                                                                            brand.name
                                                                        }
                                                                    </strong>
                                                                    . Brands with
                                                                    products
                                                                    cannot be
                                                                    deleted.
                                                                </DialogDescription>
                                                                <AdminDestroyForm
                                                                    action={adminDeleteUrl(
                                                                        '/admin/brands',
                                                                        brand.id,
                                                                    )}
                                                                >
                                                                    {({
                                                                        processing,
                                                                    }) => (
                                                                        <DialogFooter className="gap-2">
                                                                            <DialogClose
                                                                                asChild
                                                                            >
                                                                                <Button variant="secondary">
                                                                                    Cancel
                                                                                </Button>
                                                                            </DialogClose>
                                                                            <Button
                                                                                variant="destructive"
                                                                                disabled={
                                                                                    processing
                                                                                }
                                                                                type="submit"
                                                                            >
                                                                                Delete
                                                                            </Button>
                                                                        </DialogFooter>
                                                                    )}
                                                                </AdminDestroyForm>
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

                        <PaginationLinks paginator={brands} />
                        </AdminFilterableContent>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BrandsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Brands',
            href: index(),
        },
    ],
};
