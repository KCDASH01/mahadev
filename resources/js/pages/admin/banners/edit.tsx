import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
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
import { index } from '@/routes/admin/banners';
import type { Banner } from '@/types/admin';

export default function BannersEdit({ banner }: { banner: Banner }) {
    return (
        <>
            <Head title={`Edit ${banner.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Edit Hero Slide"
                    description={`Update slide: ${banner.title}`}
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Slide details</CardTitle>
                        <CardDescription>
                            Update the hero image or video, optional mobile
                            media, headline, promo text, and visibility.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/banners', banner.id)}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <BannerFormFields
                                        banner={banner}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update slide"
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

BannersEdit.layout = {
    breadcrumbs: [
        {
            title: 'Banners',
            href: index(),
        },
        {
            title: 'Edit',
            href: index(),
        },
    ],
};
