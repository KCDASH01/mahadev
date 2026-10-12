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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { mediaUrl } from '@/lib/media-url';
import { useAdminFilters } from '@/hooks/use-admin-filters';
import type { Category, Paginated, Product } from '@/types/admin';

const indexUrl = '/admin/jewellery';

export default function JewelleryIndex({
    products,
    categories = [],
    filters = { search: '', category_id: '', status: '' },
}: {
    products: Paginated<Product>;
    categories?: Pick<Category, 'id' | 'name'>[];
    filters?: { search?: string; category_id?: string; status?: string };
}) {
    const { values, setValue, clearFilters, hasActiveFilters, isFiltering } = useAdminFilters(
        indexUrl,
        filters,
        { only: ['products', 'filters'] },
    );

    return (
        <>
            <Head title="Jewellery" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Jewellery"
                        description="Manage jewellery products using the existing catalog"
                    />
                    <Button asChild>
                        <Link href="/admin/jewellery/create">
                            <Plus className="size-4" />
                            Add Jewellery
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Jewellery</CardTitle>
                        <CardDescription>
                            {products.total} item{products.total === 1 ? '' : 's'} in total
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AdminFiltersBar showClear={hasActiveFilters} onClear={clearFilters}>
                            <AdminSearchField
                                value={values.search ?? ''}
                                onChange={(value) => setValue('search', value)}
                                placeholder="Search by name or SKU..."
                                isLoading={isFiltering}
                            />
                            <AdminSelectField
                                label="Category"
                                value={values.category_id ?? ''}
                                onChange={(value) => setValue('category_id', value, true)}
                                options={categories.map((category) => ({
                                    value: String(category.id),
                                    label: category.name,
                                }))}
                                placeholder="All categories"
                            />
                            <AdminSelectField
                                label="Status"
                                value={values.status ?? ''}
                                onChange={(value) => setValue('status', value, true)}
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                ]}
                                placeholder="All statuses"
                            />
                        </AdminFiltersBar>

                        <AdminFilterableContent isFiltering={isFiltering}>
                            {products.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {hasActiveFilters
                                        ? 'No jewellery matches your filters.'
                                        : 'No jewellery yet. Create your first piece.'}
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">Jewellery</th>
                                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                                <th className="px-4 py-3 text-left font-medium">SKU</th>
                                                <th className="px-4 py-3 text-left font-medium">Price</th>
                                                <th className="px-4 py-3 text-left font-medium">Stock</th>
                                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                                <th className="px-4 py-3 text-left font-medium">Created</th>
                                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.data.map((product) => (
                                                <tr key={product.id} className="border-b last:border-0">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {product.thumbnail ? (
                                                                <img
                                                                    src={mediaUrl(product.thumbnail) ?? ''}
                                                                    alt={product.name}
                                                                    className="size-10 rounded-md border object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex size-10 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                                                                    N/A
                                                                </div>
                                                            )}
                                                            <p className="font-medium">{product.name}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">{product.category?.name ?? '—'}</td>
                                                    <td className="px-4 py-3">{product.sku}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-muted-foreground line-through">
                                                            ₹{product.original_price}
                                                        </span>
                                                        <br />
                                                        <span className="font-medium">₹{product.sale_price}</span>
                                                    </td>
                                                    <td className="px-4 py-3">{product.stock}</td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={product.status} />
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {new Date(product.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-1">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="outline" size="icon" asChild>
                                                                        <Link href={`/admin/jewellery/${product.id}`}>
                                                                            <Eye className="size-3.5" />
                                                                            <span className="sr-only">View</span>
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>View</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="outline" size="icon" asChild>
                                                                        <Link href={`/admin/jewellery/${product.id}/edit`}>
                                                                            <Pencil className="size-3.5" />
                                                                            <span className="sr-only">Edit</span>
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Edit</TooltipContent>
                                                            </Tooltip>
                                                            <Dialog>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <DialogTrigger asChild>
                                                                            <Button variant="destructive" size="icon">
                                                                                <Trash2 className="size-3.5" />
                                                                                <span className="sr-only">Delete</span>
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Delete</TooltipContent>
                                                                </Tooltip>
                                                                <DialogContent>
                                                                    <DialogTitle>Delete jewellery?</DialogTitle>
                                                                    <DialogDescription>
                                                                        This will permanently delete{' '}
                                                                        <strong>{product.name}</strong> and its images.
                                                                    </DialogDescription>
                                                                    <AdminDestroyForm
                                                                        action={adminDeleteUrl('/admin/jewellery', product.id)}
                                                                    >
                                                                        {({ processing }) => (
                                                                            <DialogFooter className="gap-2">
                                                                                <DialogClose asChild>
                                                                                    <Button variant="secondary">Cancel</Button>
                                                                                </DialogClose>
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    disabled={processing}
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

                            <PaginationLinks paginator={products} />
                        </AdminFilterableContent>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

JewelleryIndex.layout = {
    breadcrumbs: [
        {
            title: 'Jewellery',
            href: indexUrl,
        },
    ],
};
