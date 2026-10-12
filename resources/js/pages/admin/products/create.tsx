import { Form, Head, Link } from '@inertiajs/react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import ProductFormFields from '@/components/admin/product-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { create, index } from '@/routes/admin/products';
import type { AttributeValueOption, CategoryFilterAttributesMap, SelectOption } from '@/types/admin';

export default function ProductsCreate({
    categories,
    brands,
    attributeValues,
    categoryFilterAttributes,
}: {
    categories: SelectOption[];
    brands: SelectOption[];
    attributeValues: AttributeValueOption[];
    categoryFilterAttributes: CategoryFilterAttributesMap;
}) {
    return (
        <>
            <Head title="Create Product" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Create Product"
                    description="Add a new fashion product"
                />

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>New Product</CardTitle>
                        <CardDescription>
                            Use the tabs to add details, gallery images, and
                            variants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={ProductController.store.url()}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <ProductFormFields
                                        categories={categories}
                                        brands={brands}
                                        attributeValues={attributeValues}
                                        categoryFilterAttributes={categoryFilterAttributes}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create Product"
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

ProductsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
