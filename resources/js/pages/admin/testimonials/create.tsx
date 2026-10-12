import { Form, Head, Link } from '@inertiajs/react';
import TestimonialController from '@/actions/App/Http/Controllers/Admin/TestimonialController';
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
import { create, index } from '@/routes/admin/testimonials';

export default function TestimonialsCreate() {
    return (
        <>
            <Head title="Create Testimonial" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Create Testimonial" description="Add a customer testimonial for the homepage" />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Testimonial Details</CardTitle>
                        <CardDescription>Active testimonials appear in the homepage reviews section.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...TestimonialController.store.form()}
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <TestimonialFormFields
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create Testimonial"
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

TestimonialsCreate.layout = {
    breadcrumbs: [
        { title: 'Testimonials', href: index() },
        { title: 'Create', href: create() },
    ],
};
