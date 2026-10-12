import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    authInputClassName,
    authLabelClassName,
    authSubmitClassName,
} from '@/lib/auth-ui';

type Props = {
    status?: string;
};

export default function AdminLogin({ status }: Props) {
    return (
        <>
            <Head title="Admin Login" />

            {status && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <Form
                action="/admin/login"
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-8"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="login" className={authLabelClassName}>
                                Email / Mobile Number
                            </Label>
                            <Input
                                id="login"
                                type="text"
                                name="login"
                                required
                                autoFocus
                                autoComplete="username"
                                placeholder="Email or mobile number"
                                className={authInputClassName}
                            />
                            <InputError message={errors.login || errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className={authLabelClassName}>
                                Password
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                className={authInputClassName}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            type="submit"
                            className={authSubmitClassName}
                            disabled={processing}
                            data-test="admin-login-button"
                        >
                            {processing && <Spinner />}
                            Login
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

AdminLogin.layout = {
    title: 'Admin Login',
    description: 'Sign in with your admin email or mobile number and password.',
};
