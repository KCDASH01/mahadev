import { Form, Head } from '@inertiajs/react';
import { adminSingletonUpdateUrl } from '@/components/admin/admin-destroy-form';
import MediaInput from '@/components/admin/media-input';
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
import { edit } from '@/routes/admin/settings/general';
import type { GeneralSetting } from '@/types/settings';

export default function GeneralSettingsPage({
    settings,
}: {
    settings: GeneralSetting;
}) {
    return (
        <>
            <Head title="General Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="General Settings"
                    description="Manage site identity, contact details, and branding."
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Site Configuration</CardTitle>
                        <CardDescription>
                            Only one settings record is used across the
                            application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminSingletonUpdateUrl('/admin/settings/general')}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="site_name">
                                                Site name
                                            </Label>
                                            <Input
                                                id="site_name"
                                                name="site_name"
                                                defaultValue={settings.site_name}
                                                required
                                            />
                                            <InputError
                                                message={errors.site_name}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="site_email">
                                                Site email
                                            </Label>
                                            <Input
                                                id="site_email"
                                                name="site_email"
                                                type="email"
                                                defaultValue={settings.site_email}
                                                required
                                            />
                                            <InputError
                                                message={errors.site_email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="site_phone">
                                                Site phone
                                            </Label>
                                            <Input
                                                id="site_phone"
                                                name="site_phone"
                                                defaultValue={settings.site_phone}
                                                required
                                            />
                                            <InputError
                                                message={errors.site_phone}
                                            />
                                        </div>

                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="site_address">
                                                Site address
                                            </Label>
                                            <textarea
                                                id="site_address"
                                                name="site_address"
                                                defaultValue={
                                                    settings.site_address ?? ''
                                                }
                                                rows={3}
                                                className="border-input dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                            />
                                            <InputError
                                                message={errors.site_address}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="whatsapp_number">
                                                WhatsApp number
                                            </Label>
                                            <Input
                                                id="whatsapp_number"
                                                name="whatsapp_number"
                                                defaultValue={
                                                    settings.whatsapp_number ??
                                                    ''
                                                }
                                            />
                                            <InputError
                                                message={errors.whatsapp_number}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="support_email">
                                                Support email
                                            </Label>
                                            <Input
                                                id="support_email"
                                                name="support_email"
                                                type="email"
                                                defaultValue={
                                                    settings.support_email ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.support_email}
                                            />
                                        </div>

                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="support_phone">
                                                Support phone
                                            </Label>
                                            <Input
                                                id="support_phone"
                                                name="support_phone"
                                                defaultValue={
                                                    settings.support_phone ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.support_phone}
                                            />
                                        </div>
                                    </div>

                                    <MediaInput
                                        label="Logo"
                                        urlFieldName="logo"
                                        fileFieldName="logo_file"
                                        currentValue={settings.logo}
                                        errors={errors}
                                    />

                                    <MediaInput
                                        label="Favicon"
                                        urlFieldName="favicon"
                                        fileFieldName="favicon_file"
                                        currentValue={settings.favicon}
                                        errors={errors}
                                        urlPlaceholder="https://example.com/favicon.ico"
                                    />

                                    <Button type="submit" disabled={processing}>
                                        Save Settings
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

GeneralSettingsPage.layout = {
    breadcrumbs: [
        { title: 'General Settings', href: edit() },
    ],
};
