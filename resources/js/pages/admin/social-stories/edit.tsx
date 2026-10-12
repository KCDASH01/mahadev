import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
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
import { index } from '@/routes/admin/social-stories';
import type { SocialStory } from '@/types/admin';

export default function SocialStoriesEdit({ socialStory }: { socialStory: SocialStory }) {
    return (
        <>
            <Head title={`Edit ${socialStory.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Edit Social Story" description={`Update ${socialStory.title}`} />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Story Details</CardTitle>
                        <CardDescription>Changes appear on the homepage when the story is active.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/social-stories', socialStory.id)}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <SocialStoryFormFields
                                        socialStory={socialStory}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update Story"
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

SocialStoriesEdit.layout = {
    breadcrumbs: [
        { title: 'Social Stories', href: index() },
        { title: 'Edit', href: index() },
    ],
};
