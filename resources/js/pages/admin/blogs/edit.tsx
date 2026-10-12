import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
import BlogFormFields from '@/components/admin/blog-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index } from '@/routes/admin/blogs';
import type { Blog } from '@/types/admin';

export default function BlogsEdit({ blog }: { blog: Blog }) {
    return (
        <>
            <Head title={`Edit ${blog.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Edit Blog Post"
                    description={`Update details for ${blog.title}`}
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Post Details</CardTitle>
                        <CardDescription>
                            Update the post content, image, and status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/blogs', blog.id)}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <BlogFormFields
                                        blog={blog}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update Post"
                                    />
                                    <Button variant="outline" asChild>
                                        <Link href={index()}>Cancel</Link>
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BlogsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Blogs',
            href: index(),
        },
        {
            title: 'Edit',
            href: index(),
        },
    ],
};
