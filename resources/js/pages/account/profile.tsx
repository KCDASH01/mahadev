import { Form, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StorefrontAccountLayout } from '@/layouts/storefront-account-layout';
import { send } from '@/routes/verification';
import type { Auth } from '@/types/auth';

type AccountProfileProps = {
    mustVerifyEmail: boolean;
    status?: string;
};

export default function AccountProfile({ mustVerifyEmail, status }: AccountProfileProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    if (!user) {
        return null;
    }

    return (
        <StorefrontAccountLayout
            title="Profile"
            description="Update your name and email address."
        >
            <Form
                {...ProfileController.update.form()}
                options={{
                    preserveScroll: true,
                }}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                defaultValue={user.name}
                                name="name"
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                defaultValue={user.email ?? ''}
                                name="email"
                                autoComplete="username"
                                placeholder="Email address (optional)"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div>
                                <p className="text-sm text-slate-600">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="font-semibold text-[#062A4D] underline underline-offset-4"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <p className="mt-2 text-sm font-medium text-emerald-600">
                                        A new verification link has been sent to your email address.
                                    </p>
                                )}
                            </div>
                        )}

                        <Button disabled={processing} className="bg-[#062A4D] hover:bg-[#041F3A]">
                            Save changes
                        </Button>
                    </>
                )}
            </Form>
        </StorefrontAccountLayout>
    );
}
