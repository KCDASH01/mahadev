import { Form, Head, Link } from '@inertiajs/react';
import CategoryController from '@/actions/App/Http/Controllers/Admin/CategoryController';
import CategoryFormFields from '@/components/admin/category-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { create, index } from '@/routes/admin/categories';
import type { CategoryOption } from '@/types/admin';

export default function CategoriesCreate({
    parentCategories,
}: {
    parentCategories: CategoryOption[];
}) {
    return (
        <>
            <Head title="Create Category" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Create Category"
                    description="Add a new product category"
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>
                            Slug is auto-generated from the name if left empty.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={CategoryController.store.url()}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <CategoryFormFields
                                        parentCategories={parentCategories}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create Category"
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

CategoriesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
