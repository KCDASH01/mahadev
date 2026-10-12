import { Form, Head, Link } from '@inertiajs/react';
import BlogController from '@/actions/App/Http/Controllers/Admin/BlogController';
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
import { create, index } from '@/routes/admin/blogs';

export default function BlogsCreate() {
    return (
        <>
            <Head title="Create Blog Post" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Create Blog Post"
                    description="Publish a new article to the storefront blog page"
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Post Details</CardTitle>
                        <CardDescription>
                            Active posts appear on /blog and link to their own detail page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...BlogController.store.form()}
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <BlogFormFields
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create Post"
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

BlogsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Blogs',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
