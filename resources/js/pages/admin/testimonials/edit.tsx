import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
import TestimonialFormFields from '@/components/admin/testimonial-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index } from '@/routes/admin/testimonials';
import type { Testimonial } from '@/types/admin';

export default function TestimonialsEdit({ testimonial }: { testimonial: Testimonial }) {
    return (
        <>
            <Head title={`Edit ${testimonial.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Edit Testimonial" description={`Update testimonial from ${testimonial.name}`} />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Testimonial Details</CardTitle>
                        <CardDescription>Changes appear on the homepage when status is active.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/testimonials', testimonial.id)}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <TestimonialFormFields
                                        testimonial={testimonial}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update Testimonial"
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

TestimonialsEdit.layout = {
    breadcrumbs: [
        { title: 'Testimonials', href: index() },
        { title: 'Edit', href: index() },
    ],
};
