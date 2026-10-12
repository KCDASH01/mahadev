import { Head, Link, router } from '@inertiajs/react';
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
import type { AnnouncementOffer, Paginated } from '@/types/admin';

export default function AnnouncementOffersIndex({
    offers,
}: {
    offers: Paginated<AnnouncementOffer>;
}) {
    return (
        <>
            <Head title="Announcement Offers" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Announcement Offers"
                        description="Manage the scrolling announcement bar offers on the homepage"
                    />
                    <Button asChild>
                        <Link href="/admin/announcement-offers/create">
                            <Plus className="size-4" />
                            Add Offer
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Announcement bar offers</CardTitle>
                        <CardDescription>
                            {offers.total} offer
                            {offers.total === 1 ? '' : 's'} in total. Only
                            active offers appear on the homepage announcement
                            bar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {offers.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No announcement offers yet. Create your first
                                offer.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Text
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Highlight
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Order
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
                                        {offers.data.map((offer) => (
                                            <tr
                                                key={offer.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="max-w-[300px] truncate px-4 py-3 font-medium">
                                                    {offer.text}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {offer.highlight ? (
                                                        <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                                                            {offer.highlight}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {offer.sort_order}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={offer.status}
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
                                                                href={`/admin/announcement-offers/${offer.id}/edit`}
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
                                                                    Delete offer?
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    This will
                                                                    permanently
                                                                    delete the
                                                                    offer{' '}
                                                                    <strong>
                                                                        &ldquo;
                                                                        {
                                                                            offer.text
                                                                        }
                                                                        &rdquo;
                                                                    </strong>
                                                                    .
                                                                </DialogDescription>
                                                                <AdminDestroyForm
                                                                    action={adminDeleteUrl(
                                                                        '/admin/announcement-offers',
                                                                        offer.id,
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

                        <PaginationLinks paginator={offers} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AnnouncementOffersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Announcement Offers',
            href: '/admin/announcement-offers',
        },
    ],
};
