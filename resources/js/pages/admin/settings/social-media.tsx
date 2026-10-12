import { Form, Head } from '@inertiajs/react';
import { adminSingletonUpdateUrl } from '@/components/admin/admin-destroy-form';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/admin/settings/social-media';
import type { SocialMediaSetting } from '@/types/settings';

const fields = [
    { id: 'facebook_url', label: 'Facebook URL' },
    { id: 'instagram_url', label: 'Instagram URL' },
    { id: 'twitter_url', label: 'Twitter / X URL' },
    { id: 'linkedin_url', label: 'LinkedIn URL' },
    { id: 'youtube_url', label: 'YouTube URL' },
] as const;

export default function SocialMediaSettingsPage({
    settings,
}: {
    settings: SocialMediaSetting;
}) {
    return (
        <>
            <Head title="Social Media Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Social Media Settings"
                    description="Manage social profile links shown in the website footer."
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Social Links</CardTitle>
                        <CardDescription>
                            Leave a field empty to hide that network from the
                            footer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminSingletonUpdateUrl('/admin/settings/social-media')}
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-4">
                                        {fields.map((field) => (
                                            <div
                                                key={field.id}
                                                className="grid gap-2"
                                            >
                                                <Label htmlFor={field.id}>
                                                    {field.label}
                                                </Label>
                                                <Input
                                                    id={field.id}
                                                    name={field.id}
                                                    type="url"
                                                    defaultValue={
                                                        settings[field.id] ??
                                                        ''
                                                    }
                                                    placeholder="https://"
                                                />
                                                <InputError
                                                    message={errors[field.id]}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        Save Social Links
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

SocialMediaSettingsPage.layout = {
    breadcrumbs: [{ title: 'Social Media Settings', href: edit() }],
};
