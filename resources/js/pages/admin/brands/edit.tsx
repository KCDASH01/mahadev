import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
import BrandFormFields from '@/components/admin/brand-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index } from '@/routes/admin/brands';
import type { Brand } from '@/types/admin';

export default function BrandsEdit({ brand }: { brand: Brand }) {
    return (
        <>
            <Head title={`Edit ${brand.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Edit Brand"
                    description={`Update details for ${brand.name}`}
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Brand Details</CardTitle>
                        <CardDescription>
                            Update the brand information below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/brands', brand.id)}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <BrandFormFields
                                        brand={brand}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update Brand"
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

BrandsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Brands',
            href: index(),
        },
        {
            title: 'Edit',
            href: index(),
        },
    ],
};
