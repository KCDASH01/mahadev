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
import { Badge } from '@/components/ui/badge';
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
import { create, edit, index, show } from '@/routes/admin/products';
import { useAdminFilters } from '@/hooks/use-admin-filters';
import type { Category, Paginated, Product } from '@/types/admin';

export default function ProductsIndex({
    products,
    categories = [],
    filters = { search: '', category_id: '' },
}: {
    products: Paginated<Product>;
    categories?: Pick<Category, 'id' | 'name'>[];
    filters?: { search?: string; category_id?: string };
}) {
    const { values, setValue, clearFilters, hasActiveFilters, isFiltering } = useAdminFilters(
        index.url(),
        filters,
        { only: ['products', 'filters'] },
    );

    return (
        <>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Products"
                        description="Manage garments and furniture products"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Product
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Products</CardTitle>
                        <CardDescription>
                            {products.total} product
                            {products.total === 1 ? '' : 's'} in total
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AdminFiltersBar showClear={hasActiveFilters} onClear={clearFilters}>
                            <AdminSearchField
                                value={values.search ?? ''}
                                onChange={(value) => setValue('search', value)}
                                placeholder="Search by name, SKU, or slug..."
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
                        </AdminFiltersBar>

                        <AdminFilterableContent isFiltering={isFiltering}>
                        {products.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? 'No products match your filters.'
                                    : 'No products yet. Create your first product.'}
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
                                                Category
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Stock
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
                                        {products.data.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {product.thumbnail ? (
                                                            <img
                                                                src={
                                                                    mediaUrl(
                                                                        product.thumbnail,
                                                                    ) ?? ''
                                                                }
                                                                alt={product.name}
                                                                className="size-10 rounded-md border object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex size-10 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                                                                N/A
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {product.sku}
                                                            </p>
                                                            <div className="mt-1 flex gap-1">
                                                                {product.is_featured && (
                                                                    <Badge variant="secondary">
                                                                        Featured
                                                                    </Badge>
                                                                )}
                                                                {(product.variants_count ??
                                                                    0) > 0 && (
                                                                    <Badge variant="outline">
                                                                        {product.variants_count}{' '}
                                                                        variants
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {product.category?.name ??
                                                        '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-muted-foreground line-through">
                                                        ₹{product.original_price}
                                                    </span>
                                                    <br />
                                                    <span className="font-medium">
                                                        ₹{product.sale_price}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {(product.variants_count ??
                                                        0) > 0 ? (
                                                        <div>
                                                            <span className="font-medium">
                                                                {product.variants_sum_stock ??
                                                                    0}
                                                            </span>
                                                            <span className="block text-xs text-muted-foreground">
                                                                variant stock
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        product.stock
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={product.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={show(
                                                                            product.id,
                                                                        )}
                                                                    >
                                                                        <Eye className="size-3.5" />
                                                                        <span className="sr-only">
                                                                            View
                                                                        </span>
                                                                    </Link>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                View
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={edit(
                                                                            product.id,
                                                                        )}
                                                                    >
                                                                        <Pencil className="size-3.5" />
                                                                        <span className="sr-only">
                                                                            Edit
                                                                        </span>
                                                                    </Link>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Edit
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Dialog>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="icon"
                                                                        >
                                                                            <Trash2 className="size-3.5" />
                                                                            <span className="sr-only">
                                                                                Delete
                                                                            </span>
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Delete
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <DialogContent>
                                                                <DialogTitle>
                                                                    Delete product?
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    This will
                                                                    permanently
                                                                    delete{' '}
                                                                    <strong>
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </strong>
                                                                    , its gallery
                                                                    images, and
                                                                    variants.
                                                                </DialogDescription>
                                                                <AdminDestroyForm
                                                                    action={adminDeleteUrl(
                                                                        '/admin/products',
                                                                        product.id,
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

                        <PaginationLinks paginator={products} />
                        </AdminFilterableContent>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: index(),
        },
    ],
};
