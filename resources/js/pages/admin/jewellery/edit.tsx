import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
import JewelleryFormFields from '@/components/admin/jewellery-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Product, SelectOption } from '@/types/admin';

export default function JewelleryEdit({
    product,
    categories,
    brands,
}: {
    product: Product;
    categories: SelectOption[];
    brands: SelectOption[];
}) {
    return (
        <>
            <Head title={`Edit ${product.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Edit Jewellery" description={`Update details for ${product.name}`} />

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Edit Jewellery</CardTitle>
                        <CardDescription>Update jewellery details and images.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/jewellery', product.id)}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <JewelleryFormFields
                                        product={product}
                                        categories={categories}
                                        brands={brands}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update Jewellery"
                                    />
                                    <Button variant="outline" asChild>
                                        <Link href="/admin/jewellery">Cancel</Link>
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

JewelleryEdit.layout = {
    breadcrumbs: [
        { title: 'Jewellery', href: '/admin/jewellery' },
        { title: 'Edit', href: '/admin/jewellery' },
    ],
};
