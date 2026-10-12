import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
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
import { index } from '@/routes/admin/colors';
import type { AdminColor } from '@/types/admin';

export default function ColorsEdit({ color }: { color: AdminColor }) {
    return (
        <>
            <Head title={`Edit ${color.value}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Edit Color"
                    description={`Update details for ${color.value}`}
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Color Details</CardTitle>
                        <CardDescription>
                            Changes apply to the product variant Color dropdown immediately.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/colors', color.id)}
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <ColorFormFields
                                        color={color}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update Color"
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

ColorsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Colors',
            href: index(),
        },
        {
            title: 'Edit',
            href: index(),
        },
    ],
};
