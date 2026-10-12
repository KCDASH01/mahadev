import { Form, Head } from '@inertiajs/react';
import { adminSingletonUpdateUrl } from '@/components/admin/admin-destroy-form';
import HomepagePopupFormFields from '@/components/admin/homepage-popup-form';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { HomepagePopup } from '@/types/admin';

export default function HomepagePopupEdit({
    homepagePopup,
}: {
    homepagePopup: HomepagePopup;
}) {
    return (
        <>
            <Head title="Homepage Popup" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Homepage Popup"
                    description="Show a promotional image on the homepage a few seconds after it loads"
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Popup content</CardTitle>
                        <CardDescription>
                            Upload an image and an optional link. The popup appears on
                            the homepage after about 4.5 seconds — not immediately.
                            Visitors can close it; it will not return in the same
                            browser tab until they start a new visit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminSingletonUpdateUrl('/admin/homepage-popup')}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <HomepagePopupFormFields
                                    homepagePopup={homepagePopup}
                                    errors={errors}
                                    processing={processing}
                                    submitLabel="Save homepage popup"
                                />
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

HomepagePopupEdit.layout = {
    breadcrumbs: [
        {
            title: 'Homepage Popup',
            href: '/admin/homepage-popup',
        },
    ],
};
