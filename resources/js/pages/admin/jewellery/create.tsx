import { Form, Head, Link } from '@inertiajs/react';
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
import type { SelectOption } from '@/types/admin';

export default function JewelleryCreate({
    categories,
    brands,
}: {
    categories: SelectOption[];
    brands: SelectOption[];
}) {
    return (
        <>
            <Head title="Add Jewellery" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Add Jewellery" description="Create a jewellery product in the existing catalog" />

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>New Jewellery</CardTitle>
                        <CardDescription>
                            Simple jewellery is sold with price, stock, and images — no clothing sizes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action="/admin/jewellery" method="post" encType="multipart/form-data" className="space-y-6">
                            {({ processing, errors }) => (
                                <>
                                    <JewelleryFormFields
                                        categories={categories}
                                        brands={brands}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create Jewellery"
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

JewelleryCreate.layout = {
    breadcrumbs: [
        { title: 'Jewellery', href: '/admin/jewellery' },
        { title: 'Create', href: '/admin/jewellery/create' },
    ],
};
