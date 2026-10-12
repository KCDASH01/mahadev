import { Form, Head, Link } from '@inertiajs/react';
import ColorController from '@/actions/App/Http/Controllers/Admin/ColorController';
import ColorFormFields from '@/components/admin/color-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { create, index } from '@/routes/admin/colors';

export default function ColorsCreate() {
    return (
        <>
            <Head title="Create Color" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Create Color"
                    description="Add a new color for product variants"
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Color Details</CardTitle>
                        <CardDescription>
                            After saving, this color will appear in the variant Color dropdown on
                            product create/edit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={ColorController.store.url()}
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <ColorFormFields
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create Color"
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

ColorsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Colors',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
