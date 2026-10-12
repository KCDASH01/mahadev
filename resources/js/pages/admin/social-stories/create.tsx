import { Form, Head, Link } from '@inertiajs/react';
import SocialStoryController from '@/actions/App/Http/Controllers/Admin/SocialStoryController';
import SocialStoryFormFields from '@/components/admin/social-story-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { create, index } from '@/routes/admin/social-stories';

export default function SocialStoriesCreate() {
    return (
        <>
            <Head title="Create Social Story" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Create Social Story" description="Add a new homepage social story" />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Story Details</CardTitle>
                        <CardDescription>Upload an image or video story for the homepage carousel.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...SocialStoryController.store.form()}
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <SocialStoryFormFields
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create Story"
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

SocialStoriesCreate.layout = {
    breadcrumbs: [
        { title: 'Social Stories', href: index() },
        { title: 'Create', href: create() },
    ],
};
