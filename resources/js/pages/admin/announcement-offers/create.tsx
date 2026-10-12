import { Head, Link, router } from '@inertiajs/react';
import AnnouncementOfferFormFields from '@/components/admin/announcement-offer-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FormEvent, useState } from 'react';

export default function AnnouncementOffersCreate() {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        setProcessing(true);
        router.post('/admin/announcement-offers', Object.fromEntries(formData), {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Create Announcement Offer" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Create Announcement Offer"
                    description="Add a new offer to the homepage announcement bar"
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Offer details</CardTitle>
                        <CardDescription>
                            Enter the offer text and optionally highlight a
                            portion of it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <AnnouncementOfferFormFields
                                errors={errors}
                                processing={processing}
                                submitLabel="Create offer"
                            />
                            <Button variant="outline" asChild>
                                <Link href="/admin/announcement-offers">
                                    Cancel
                                </Link>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AnnouncementOffersCreate.layout = {
    breadcrumbs: [
        {
            title: 'Announcement Offers',
            href: '/admin/announcement-offers',
        },
        {
            title: 'Create',
            href: '/admin/announcement-offers/create',
        },
    ],
};
