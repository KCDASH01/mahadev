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
import { useAdminFilters } from '@/hooks/use-admin-filters';
import { create, edit, index } from '@/routes/admin/colors';
import type { AdminColor, Paginated } from '@/types/admin';

export default function ColorsIndex({
    colors,
    filters = { search: '' },
}: {
    colors: Paginated<AdminColor>;
    filters?: { search?: string };
}) {
    const { values, setValue, clearFilters, hasActiveFilters, isFiltering } = useAdminFilters(
        index.url(),
        filters,
        { only: ['colors', 'filters'] },
    );

    return (
        <>
            <Head title="Colors" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Colors"
                        description="Manage colors available for product variants"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Color
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Colors</CardTitle>
                        <CardDescription>
                            {colors.total} color{colors.total === 1 ? '' : 's'} in total. New active
                            colors appear in the product variant dropdown.
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
                            {colors.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {hasActiveFilters
                                        ? 'No colors match your search.'
                                        : 'No colors yet. Create your first color.'}
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Color
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Slug
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Hex
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Used in variants
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
                                            {colors.data.map((color) => {
                                                const type = color.type ?? 'solid';
                                                return (
                                                    <tr
                                                        key={color.id}
                                                        className="border-b last:border-0"
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {type === 'solid' ? (
                                                                    <span
                                                                        className="inline-block size-6 rounded-full border shadow-xs shrink-0"
                                                                        style={{
                                                                            backgroundColor:
                                                                                color.hex || '#e5e7eb',
                                                                        }}
                                                                        title={color.hex || 'Solid color'}
                                                                    />
                                                                ) : type === 'multicolor' ? (
                                                                    <span
                                                                        className="inline-block size-6 rounded-full border shadow-xs shrink-0"
                                                                        style={{
                                                                            background:
                                                                                'linear-gradient(135deg, #FF007F 0%, #FFD700 33%, #00E5FF 66%, #7B2CBF 100%)',
                                                                        }}
                                                                        title="Multicolor"
                                                                    />
                                                                ) : (
                                                                    <span
                                                                        className="inline-block size-6 rounded-full border shadow-xs shrink-0"
                                                                        style={{
                                                                            background:
                                                                                'repeating-linear-gradient(-45deg, #475569, #475569 3px, #F1F5F9 3px, #F1F5F9 6px)',
                                                                        }}
                                                                        title="Pattern"
                                                                    />
                                                                )}
                                                                <span className="font-medium">
                                                                    {color.value}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 capitalize">
                                                                {type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {color.slug}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {color.hex || '—'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {color.variants_count ?? 0}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <StatusBadge status={color.status} />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link href={edit(color.id)}>
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
                                                                            Delete color?
                                                                        </DialogTitle>
                                                                        <DialogDescription>
                                                                            This will permanently delete{' '}
                                                                            <strong>{color.value}</strong>
                                                                            . Colors used by products or
                                                                            variants cannot be deleted.
                                                                        </DialogDescription>
                                                                        <AdminDestroyForm
                                                                            action={adminDeleteUrl(
                                                                                '/admin/colors',
                                                                                color.id,
                                                                            )}
                                                                        >
                                                                            {({ processing }) => (
                                                                                <DialogFooter className="gap-2">
                                                                                    <DialogClose asChild>
                                                                                        <Button variant="secondary">
                                                                                            Cancel
                                                                                        </Button>
                                                                                    </DialogClose>
                                                                                    <Button
                                                                                        type="submit"
                                                                                        variant="destructive"
                                                                                        disabled={processing}
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
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <PaginationLinks paginator={colors} />
                        </AdminFilterableContent>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ColorsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Colors',
            href: index(),
        },
    ],
};
