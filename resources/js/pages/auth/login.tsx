import { Form, Head, Link, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    authInputClassName,
    authLabelClassName,
    authLinkClassName,
    authSubmitClassName,
} from '@/lib/auth-ui';

type Props = {
    step?: 'mobile' | 'otp' | 'register';
    masked_phone?: string | null;
    resend_available_in?: number;
    redirect?: string | null;
    status?: string;
};

export default function Login({
    step = 'mobile',
    masked_phone = null,
    resend_available_in = 0,
    status,
}: Props) {
    const [otp, setOtp] = useState('');
    const [cooldown, setCooldown] = useState(resend_available_in);

    useEffect(() => {
        setCooldown(resend_available_in);
    }, [resend_available_in]);

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setCooldown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [cooldown]);

    if (step === 'otp') {
        setLayoutProps({
            title: 'Verify your mobile number',
            description: masked_phone
                ? `We've sent a 6-digit OTP to ${masked_phone}`
                : 'Enter the 6-digit OTP sent to your mobile number.',
        });
    } else if (step === 'register') {
        setLayoutProps({
            title: 'Create your account',
            description: 'Complete your profile to start shopping with Mahadev.',
        });
    } else {
        setLayoutProps({
            title: 'Login or Create Account',
            description: 'Enter your mobile number to continue.',
        });
    }

    return (
        <>
            <Head
                title={
                    step === 'otp'
                        ? 'Verify OTP'
                        : step === 'register'
                          ? 'Create account'
                          : 'Login or Create Account'
                }
            />

            {status && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            {step === 'mobile' && <MobileStep />}
            {step === 'otp' && (
                <OtpStep
                    otp={otp}
                    setOtp={setOtp}
                    cooldown={cooldown}
                    maskedPhone={masked_phone}
                />
            )}
            {step === 'register' && <RegisterStep maskedPhone={masked_phone} />}
        </>
    );
}

function MobileStep() {
    return (
        <Form action="/login/otp/send" method="post" className="flex flex-col gap-8">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="phone" className={authLabelClassName}>
                                Mobile Number
                            </Label>
                            <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-[#062A4D] focus-within:ring-2 focus-within:ring-[#062A4D]/15">
                                <span className="flex items-center border-r border-slate-200 px-4 text-sm font-semibold text-[#1A1A2E]">
                                    +91
                                </span>
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    inputMode="numeric"
                                    autoFocus
                                    required
                                    maxLength={10}
                                    autoComplete="tel"
                                    placeholder="Enter mobile number"
                                    className="h-12 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                                />
                            </div>
                            <InputError message={errors.phone} />
                        </div>

                        <Button
                            type="submit"
                            className={authSubmitClassName}
                            disabled={processing}
                            data-test="customer-continue-button"
                        >
                            {processing && <Spinner />}
                            {processing ? 'Sending OTP...' : 'Continue'}
                        </Button>
                    </div>

                    <p className="text-center text-xs leading-5 text-slate-500">
                        By continuing, you agree to our{' '}
                        <Link href="/terms-and-conditions" className={authLinkClassName}>
                            Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy-policy" className={authLinkClassName}>
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </>
            )}
        </Form>
    );
}

function OtpStep({
    otp,
    setOtp,
    cooldown,
    maskedPhone,
}: {
    otp: string;
    setOtp: (value: string) => void;
    cooldown: number;
    maskedPhone: string | null;
}) {
    return (
        <div className="flex flex-col gap-8">
            <Form
                action="/login/otp/verify"
                method="post"
                resetOnSuccess={['otp']}
            >
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="otp" value={otp} />

                        <div className="grid gap-5">
                            <div className="grid justify-items-center gap-3">
                                <div className="flex w-full items-center justify-center">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={setOtp}
                                        disabled={processing}
                                        pattern={REGEXP_ONLY_DIGITS}
                                        autoFocus
                                        containerClassName="justify-center"
                                    >
                                        <InputOTPGroup className="gap-2">
                                            {Array.from({ length: 6 }, (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="size-11 rounded-xl border-slate-200 text-lg"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <InputError message={errors.otp} />
                            </div>

                            <Button
                                type="submit"
                                className={authSubmitClassName}
                                disabled={processing || otp.length !== 6}
                                data-test="customer-verify-otp-button"
                            >
                                {processing && <Spinner />}
                                {processing ? 'Verifying OTP...' : 'Verify OTP'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <div className="space-y-3 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
                <p>Didn&apos;t receive the OTP?</p>
                <Form action="/login/otp/resend" method="post">
                    {({ processing: resending }) => (
                        <button
                            type="submit"
                            disabled={resending || cooldown > 0}
                            className={`${authLinkClassName} disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline`}
                        >
                            {resending
                                ? 'Sending OTP...'
                                : cooldown > 0
                                  ? `Resend OTP in ${cooldown}s`
                                  : 'Resend OTP'}
                        </button>
                    )}
                </Form>
                <Link href="/login?restart=1" className="block text-xs text-slate-500 hover:text-[#062A4D]">
                    {maskedPhone ? 'Change number' : 'Use a different number'}
                </Link>
            </div>
        </div>
    );
}

function RegisterStep({ maskedPhone }: { maskedPhone: string | null }) {
    return (
        <Form action="/login/register" method="post" className="flex flex-col gap-8">
            {({ processing, errors }) => (
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className={authLabelClassName}>
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder="Your full name"
                            className={authInputClassName}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="verified-phone" className={authLabelClassName}>
                            Mobile Number
                        </Label>
                        <Input
                            id="verified-phone"
                            type="text"
                            value={maskedPhone ?? 'Verified'}
                            readOnly
                            disabled
                            className={`${authInputClassName} bg-slate-50 text-slate-500`}
                        />
                    </div>

                    <Button
                        type="submit"
                        className={authSubmitClassName}
                        disabled={processing}
                        data-test="customer-create-account-button"
                    >
                        {processing && <Spinner />}
                        {processing ? 'Creating account...' : 'Create Account'}
                    </Button>
                </div>
            )}
        </Form>
    );
}

Login.layout = {
    title: 'Login or Create Account',
    description: 'Enter your mobile number to continue.',
};
