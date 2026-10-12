import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
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
import { index } from '@/routes/admin/categories';
import type { Category, CategoryOption } from '@/types/admin';

export default function CategoriesEdit({
    category,
    parentCategories,
}: {
    category: Category;
    parentCategories: CategoryOption[];
}) {
    return (
        <>
            <Head title={`Edit ${category.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Edit Category"
                    description={`Update details for ${category.name}`}
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>
                            Update the category information below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/categories', category.id)}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <CategoryFormFields
                                        category={category}
                                        parentCategories={parentCategories}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update Category"
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

CategoriesEdit.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: index(),
        },
        {
            title: 'Edit',
            href: index(),
        },
    ],
};
