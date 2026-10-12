import { Form, Head } from '@inertiajs/react';
import { adminSingletonUpdateUrl } from '@/components/admin/admin-destroy-form';
import LookbookSectionFormFields from '@/components/admin/lookbook-section-form';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { edit } from '@/routes/admin/lookbook-section';
import type { LookbookSection } from '@/types/admin';

export default function LookbookSectionEdit({
    lookbookSection,
}: {
    lookbookSection: LookbookSection;
}) {
    return (
        <>
            <Head title="Lookbook Section" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Lookbook Section"
                    description="Manage the homepage video / lookbook banner"
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Lookbook content</CardTitle>
                        <CardDescription>
                            Update the heading, background video or poster image, and button. Hide
                            the entire section when not needed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminSingletonUpdateUrl('/admin/lookbook-section')}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <LookbookSectionFormFields
                                    lookbookSection={lookbookSection}
                                    errors={errors}
                                    processing={processing}
                                    submitLabel="Save lookbook section"
                                />
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LookbookSectionEdit.layout = {
    breadcrumbs: [
        {
            title: 'Lookbook Section',
            href: edit(),
        },
    ],
};
