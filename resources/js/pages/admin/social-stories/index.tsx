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
import { create, edit, index } from '@/routes/admin/social-stories';
import type { Paginated, SocialStory } from '@/types/admin';

export default function SocialStoriesIndex({
    socialStories,
}: {
    socialStories: Paginated<SocialStory>;
}) {
    return (
        <>
            <Head title="Social Stories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Social Stories"
                        description="Manage homepage social story cards and videos"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Story
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Homepage stories</CardTitle>
                        <CardDescription>
                            {socialStories.total} stor{socialStories.total === 1 ? 'y' : 'ies'} in total.
                            Only active stories appear on the homepage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {socialStories.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No social stories yet.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Preview</th>
                                            <th className="px-4 py-3 text-left font-medium">Story</th>
                                            <th className="px-4 py-3 text-left font-medium">Type</th>
                                            <th className="px-4 py-3 text-left font-medium">Order</th>
                                            <th className="px-4 py-3 text-left font-medium">Status</th>
                                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {socialStories.data.map((story) => (
                                            <tr key={story.id} className="border-b last:border-b-0">
                                                <td className="px-4 py-3">
                                                    <img
                                                        src={mediaUrl(story.image) ?? story.image}
                                                        alt={story.title}
                                                        className="h-16 w-12 rounded-md object-cover"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium">{story.title}</td>
                                                <td className="px-4 py-3 capitalize">{story.type}</td>
                                                <td className="px-4 py-3">{story.sort_order}</td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={story.status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="icon" asChild>
                                                            <Link href={edit(story.id)}>
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
                                                                <DialogTitle>Delete story</DialogTitle>
                                                                <DialogDescription>
                                                                    Delete &ldquo;{story.title}&rdquo;? This cannot be undone.
                                                                </DialogDescription>
                                                                <DialogFooter>
                                                                    <DialogClose asChild>
                                                                        <Button variant="outline">Cancel</Button>
                                                                    </DialogClose>
                                                                    <AdminDestroyForm
                                                                        action={adminDeleteUrl(
                                                                            '/admin/social-stories',
                                                                            story.id,
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

                        <PaginationLinks paginator={socialStories} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SocialStoriesIndex.layout = {
    breadcrumbs: [{ title: 'Social Stories', href: index() }],
};
