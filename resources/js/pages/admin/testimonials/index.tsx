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
import { create, edit, index } from '@/routes/admin/testimonials';
import type { Paginated, Testimonial } from '@/types/admin';

export default function TestimonialsIndex({
    testimonials,
}: {
    testimonials: Paginated<Testimonial>;
}) {
    return (
        <>
            <Head title="Testimonials" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Testimonials"
                        description="Manage customer testimonials on the homepage"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Testimonial
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Homepage testimonials</CardTitle>
                        <CardDescription>
                            {testimonials.total} testimonial{testimonials.total === 1 ? '' : 's'} in total.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {testimonials.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No testimonials yet.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Image</th>
                                            <th className="px-4 py-3 text-left font-medium">Customer</th>
                                            <th className="px-4 py-3 text-left font-medium">Headline</th>
                                            <th className="px-4 py-3 text-left font-medium">Rating</th>
                                            <th className="px-4 py-3 text-left font-medium">Status</th>
                                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {testimonials.data.map((testimonial) => (
                                            <tr key={testimonial.id} className="border-b last:border-b-0">
                                                <td className="px-4 py-3">
                                                    <img
                                                        src={mediaUrl(testimonial.scene_image) ?? testimonial.scene_image}
                                                        alt={testimonial.name}
                                                        className="h-12 w-20 rounded-md object-cover"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium">{testimonial.name}</td>
                                                <td className="px-4 py-3">{testimonial.headline}</td>
                                                <td className="px-4 py-3">{testimonial.rating}</td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={testimonial.status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="icon" asChild>
                                                            <Link href={edit(testimonial.id)}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="icon">
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogTitle>Delete testimonial</DialogTitle>
                                                                <DialogDescription>
                                                                    Delete the testimonial from {testimonial.name}?
                                                                </DialogDescription>
                                                                <DialogFooter>
                                                                    <DialogClose asChild>
                                                                        <Button variant="outline">Cancel</Button>
                                                                    </DialogClose>
                                                                    <AdminDestroyForm
                                                                        action={adminDeleteUrl(
                                                                            '/admin/testimonials',
                                                                            testimonial.id,
                                                                        )}
                                                                    >
                                                                        {({ processing }) => (
                                                                            <Button variant="destructive" disabled={processing}>
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

                        <PaginationLinks paginator={testimonials} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TestimonialsIndex.layout = {
    breadcrumbs: [{ title: 'Testimonials', href: index() }],
};
