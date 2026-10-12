import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminDestroyForm, adminDeleteUrl } from '@/components/admin/admin-destroy-form';
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
import { mediaUrl } from '@/lib/media-url';
import { create, edit, index } from '@/routes/admin/banners';
import type { Banner, Paginated } from '@/types/admin';

export default function BannersIndex({
    banners,
}: {
    banners: Paginated<Banner>;
}) {
    return (
        <>
            <Head title="Banners" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Hero Slides"
                        description="Manage homepage hero carousel slides"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Slide
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Hero carousel slides</CardTitle>
                        <CardDescription>
                            {banners.total} slide
                            {banners.total === 1 ? '' : 's'} in total. Only
                            visible slides appear on the homepage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {banners.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hero slides yet. Create your first slide.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Image
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Slide
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Order
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Link
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
                                        {banners.data.map((banner) => (
                                            <tr
                                                key={banner.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3">
                                                    {banner.image ? (
                                                        <img
                                                            src={
                                                                mediaUrl(
                                                                    banner.image,
                                                                ) ?? ''
                                                            }
                                                            alt={banner.title}
                                                            className="h-12 w-24 rounded-md border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-24 items-center justify-center rounded-md border bg-muted text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                            {banner.media_type === 'video'
                                                                ? 'Video'
                                                                : '—'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    <p>{banner.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {banner.accent_line}{' '}
                                                        {banner.main_line}
                                                    </p>
                                                    {banner.media_type === 'video' && (
                                                        <p className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                            Video slide
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {banner.sort_order ?? 0}
                                                </td>
                                                <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                                                    {banner.link ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={banner.status}
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
                                                                    banner.id,
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
                                                                    Delete banner?
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    This will
                                                                    permanently
                                                                    delete{' '}
                                                                    <strong>
                                                                        {
                                                                            banner.title
                                                                        }
                                                                    </strong>
                                                                    .
                                                                </DialogDescription>
                                                                <AdminDestroyForm
                                                                    action={adminDeleteUrl(
                                                                        '/admin/banners',
                                                                        banner.id,
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

                        <PaginationLinks paginator={banners} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BannersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Banners',
            href: index(),
        },
    ],
};
