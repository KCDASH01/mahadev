import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { create, edit, index } from '@/routes/admin/categories';
import { useAdminFilters } from '@/hooks/use-admin-filters';
import type { Category, Paginated } from '@/types/admin';

type CollectionOption = {
    id: number;
    name: string;
};

export default function CategoriesIndex({
    categories,
    collections = [],
    filters = { search: '', collection: '' },
}: {
    categories: Paginated<Category>;
    collections?: CollectionOption[];
    filters?: { search?: string; collection?: string };
}) {
    const { values, setValue, clearFilters, hasActiveFilters, isFiltering } = useAdminFilters(
        index.url(),
        {
            search: filters.search ?? '',
            collection: filters.collection ?? '',
        },
        { only: ['categories', 'filters'] },
    );

    return (
        <>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Categories"
                        description="Manage product categories"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Categories</CardTitle>
                        <CardDescription>
                            {categories.total} categor
                            {categories.total === 1 ? 'y' : 'ies'} in total
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AdminFiltersBar showClear={hasActiveFilters} onClear={clearFilters}>
                            <AdminSearchField
                                value={values.search ?? ''}
                                onChange={(value) => setValue('search', value)}
                                placeholder="Search by name, slug, or group..."
                                isLoading={isFiltering}
                            />
                            <AdminSelectField
                                label="Collection"
                                value={values.collection ?? ''}
                                onChange={(value) => setValue('collection', value, true)}
                                options={[
                                    { value: 'top', label: 'Top level' },
                                    ...collections.map((collection) => ({
                                        value: String(collection.id),
                                        label: collection.name,
                                    })),
                                ]}
                                placeholder="All collections"
                            />
                        </AdminFiltersBar>

                        <AdminFilterableContent isFiltering={isFiltering}>
                        {categories.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? 'No categories match your filters.'
                                    : 'No categories yet. Create your first category.'}
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
                                                Collection
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Nav group
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Slug
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Products
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Featured
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
                                        {categories.data.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {category.name}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {category.parent?.name ?? 'Top level'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {category.nav_group ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {category.slug}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {category.products_count ?? 0}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {category.parent_id && category.is_featured ? (
                                                        <span className="rounded-full bg-[#F5D020]/30 px-2 py-0.5 text-xs font-semibold text-[#1A1A2E]">
                                                            Featured
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={category.status}
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
                                                                    category.id,
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
                                                                    Delete category?
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    This will
                                                                    permanently
                                                                    delete{' '}
                                                                    <strong>
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </strong>
                                                                    . Categories
                                                                    with products
                                                                    cannot be
                                                                    deleted.
                                                                </DialogDescription>
                                                                <AdminDestroyForm
                                                                    action={adminDeleteUrl(
                                                                        '/admin/categories',
                                                                        category.id,
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

                        <PaginationLinks paginator={categories} />
                        </AdminFilterableContent>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: index(),
        },
    ],
};
