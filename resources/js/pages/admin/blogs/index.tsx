import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { create, edit, index } from '@/routes/admin/blogs';
import type { Blog, Paginated } from '@/types/admin';

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function BlogsIndex({ blogs }: { blogs: Paginated<Blog> }) {
    return (
        <>
            <Head title="Blogs" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Blogs"
                        description="Manage blog posts shown on the storefront blog page"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Blog Post
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Blog Posts</CardTitle>
                        <CardDescription>
                            {blogs.total} post{blogs.total === 1 ? '' : 's'} in
                            total. Active posts appear on the homepage; if none
                            exist, static demo cards are shown.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {blogs.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No blog posts yet. Create your first post.
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
                                                Title
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Category
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Published
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
                                        {blogs.data.map((blog) => (
                                            <tr
                                                key={blog.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3">
                                                    <img
                                                        src={
                                                            mediaUrl(
                                                                blog.image,
                                                            ) ?? ''
                                                        }
                                                        alt={blog.title}
                                                        className="h-12 w-20 rounded-md border object-cover"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {blog.title}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {blog.category}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDate(
                                                        blog.published_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={blog.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        {blog.status === 'active' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={`/blog/${blog.slug}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <ExternalLink className="size-3.5" />
                                                                    View
                                                                </a>
                                                            </Button>
                                                        ) : null}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={edit(
                                                                    blog.id,
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
                                                                    Delete blog
                                                                    post?
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    This will
                                                                    permanently
                                                                    delete{' '}
                                                                    <strong>
                                                                        {
                                                                            blog.title
                                                                        }
                                                                    </strong>
                                                                    .
                                                                </DialogDescription>
                                                                <AdminDestroyForm
                                                                    action={adminDeleteUrl(
                                                                        '/admin/blogs',
                                                                        blog.id,
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

                        <PaginationLinks paginator={blogs} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BlogsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Blogs',
            href: index(),
        },
    ],
};
