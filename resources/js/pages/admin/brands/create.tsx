import { Form, Head, Link } from '@inertiajs/react';
import BrandController from '@/actions/App/Http/Controllers/Admin/BrandController';
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
import { create, index } from '@/routes/admin/brands';

export default function BrandsCreate() {
    return (
        <>
            <Head title="Create Brand" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Create Brand"
                    description="Add a new product brand"
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Brand Details</CardTitle>
                        <CardDescription>
                            Slug is auto-generated from the name if left empty.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={BrandController.store.url()}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <BrandFormFields
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create Brand"
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

BrandsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Brands',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
