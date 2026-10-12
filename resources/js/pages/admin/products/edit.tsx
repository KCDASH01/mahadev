import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
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
import { index } from '@/routes/admin/products';
import type { AttributeValueOption, CategoryFilterAttributesMap, Product, SelectOption } from '@/types/admin';

export default function ProductsEdit({
    product,
    categories,
    brands,
    attributeValues,
    categoryFilterAttributes,
}: {
    product: Product;
    categories: SelectOption[];
    brands: SelectOption[];
    attributeValues: AttributeValueOption[];
    categoryFilterAttributes: CategoryFilterAttributesMap;
}) {
    return (
        <>
            <Head title={`Edit ${product.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Edit Product"
                    description={`Update details for ${product.name}`}
                />

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Edit Product</CardTitle>
                        <CardDescription>
                            Use the tabs to update details, gallery images, and
                            variants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/products', product.id)}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <ProductFormFields
                                        product={product}
                                        categories={categories}
                                        brands={brands}
                                        attributeValues={attributeValues}
                                        categoryFilterAttributes={categoryFilterAttributes}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update Product"
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

ProductsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: index(),
        },
        {
            title: 'Edit',
            href: index(),
        },
    ],
};
