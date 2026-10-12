import { Form, Head } from '@inertiajs/react';
import { adminSingletonUpdateUrl } from '@/components/admin/admin-destroy-form';
import PromoStripFormFields from '@/components/admin/promo-strip-form';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { edit } from '@/routes/admin/promo-strip';
import type { PromoStrip } from '@/types/admin';

export default function PromoStripEdit({
    promoStrip,
}: {
    promoStrip: PromoStrip;
}) {
    return (
        <>
            <Head title="Promo Strip" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Promo Strip"
                    description="Manage the homepage sub-banner below the hero carousel"
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Promo banner</CardTitle>
                        <CardDescription>
                            Upload a desktop banner and an optional mobile banner
                            shown below the hero slider. Toggle visibility to show
                            or hide it on the homepage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminSingletonUpdateUrl('/admin/promo-strip')}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <PromoStripFormFields
                                    promoStrip={promoStrip}
                                    errors={errors}
                                    processing={processing}
                                    submitLabel="Save promo strip"
                                />
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PromoStripEdit.layout = {
    breadcrumbs: [
        {
            title: 'Promo Strip',
            href: edit(),
        },
    ],
};
