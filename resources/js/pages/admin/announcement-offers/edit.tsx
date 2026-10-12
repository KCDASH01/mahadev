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
import type { AnnouncementOffer } from '@/types/admin';
import { FormEvent, useState } from 'react';

export default function AnnouncementOffersEdit({
    offer,
}: {
    offer: AnnouncementOffer;
}) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        setProcessing(true);
        router.post(
            `/admin/announcement-offers/${offer.id}/update`,
            Object.fromEntries(formData),
            {
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Edit Announcement Offer" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Edit Announcement Offer"
                    description="Update the announcement bar offer"
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Offer details</CardTitle>
                        <CardDescription>
                            Modify the offer text, highlight, and status.
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
                                submitLabel="Update offer"
                                defaults={offer}
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

AnnouncementOffersEdit.layout = {
    breadcrumbs: [
        {
            title: 'Announcement Offers',
            href: '/admin/announcement-offers',
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
