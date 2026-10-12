import { Form, Head, Link } from '@inertiajs/react';
import BannerController from '@/actions/App/Http/Controllers/Admin/BannerController';
import BannerFormFields from '@/components/admin/banner-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { create, index } from '@/routes/admin/banners';

export default function BannersCreate() {
    return (
        <>
            <Head title="Create Banner" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Create Hero Slide"
                    description="Add a new slide to the homepage hero carousel"
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Slide details</CardTitle>
                        <CardDescription>
                            Upload a hero image or video and configure the
                            headline, promo text, and call-to-action button.
                            Optional mobile media is used on phones.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...BannerController.store.form()}
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <BannerFormFields
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create slide"
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

BannersCreate.layout = {
    breadcrumbs: [
        {
            title: 'Banners',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
