import { Link, router, useForm, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { homeBrand } from '@/data/home-brand';
import {
    authInputClassName,
    authLabelClassName,
    authLinkClassName,
    authSubmitClassName,
} from '@/lib/auth-ui';

export const OPEN_SIGNUP_POPUP_EVENT = 'mahadev:open-signup';

type Listener = () => void;

let popupOpen = false;
const listeners = new Set<Listener>();

function emit() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return popupOpen;
}

function getServerSnapshot() {
    return false;
}

function setPopupOpen(next: boolean) {
    if (popupOpen === next) {
        return;
    }

    popupOpen = next;
    emit();
}

function dismissPopup() {
    setPopupOpen(false);
}

function isAuthPath(path?: string | null) {
    if (!path) {
        return false;
    }

    return (
        path === '/login' ||
        path.startsWith('/login/') ||
        path === '/register' ||
        path.startsWith('/register/') ||
        path === '/admin/login' ||
        path.startsWith('/admin/login/')
    );
}

export function openSignupPopup() {
    if (typeof window === 'undefined') {
        return;
    }

    if (isAuthPath(window.location.pathname)) {
        router.visit('/login');
        return;
    }

    setPopupOpen(true);
    window.dispatchEvent(new CustomEvent(OPEN_SIGNUP_POPUP_EVENT));
}

export function SignupPopup() {
    const page = usePage();
    const { auth } = page.props as { auth?: { user?: unknown } };
    const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const onAuthPage = isAuthPath(page.url.split('?')[0]);
    const phoneRef = useRef<HTMLInputElement>(null);

    const form = useForm({ phone: '' });

    const dismiss = useCallback(() => {
        dismissPopup();
    }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/login/otp/send', {
            onError: () => {
                phoneRef.current?.focus();
            },
        });
    }

    useEffect(() => {
        if (auth?.user || onAuthPage) {
            dismissPopup();
            return;
        }

        const onOpen = () => {
            if (!isAuthPath(window.location.pathname)) {
                setPopupOpen(true);
            }
        };
        window.addEventListener(OPEN_SIGNUP_POPUP_EVENT, onOpen);

        return () => {
            window.removeEventListener(OPEN_SIGNUP_POPUP_EVENT, onOpen);
        };
    }, [auth?.user, onAuthPage]);

    useEffect(() => {
        const removeNavigateListener = router.on('navigate', (event) => {
            const url = new URL(event.detail.page.url, window.location.origin);
            if (isAuthPath(url.pathname)) {
                dismissPopup();
            }
        });

        return removeNavigateListener;
    }, []);

    useEffect(() => {
        if (!open || auth?.user || onAuthPage) {
            return;
        }

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [open, auth?.user, onAuthPage]);

    if (auth?.user || onAuthPage || !open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
                aria-label="Close signup popup"
                onClick={dismiss}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="signup-popup-title"
                className="relative z-10 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_60px_-20px_rgba(74,18,28,0.45)] sm:max-h-[90vh] sm:rounded-2xl"
            >
                <div className="flex items-start justify-between gap-3 border-b border-[#E7DFC9] px-5 py-4 sm:px-6">
                    <div>
                        <p className="font-helvetica text-[11px] font-medium tracking-[0.22em] text-[#D6A62D] uppercase">
                            Join {homeBrand.name}
                        </p>
                        <h2
                            id="signup-popup-title"
                            className="mt-1 font-helvetica text-2xl font-medium tracking-tight text-[#09233D]"
                        >
                            Login or Create Account
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-[#647487]">
                            Enter your mobile number to continue.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={dismiss}
                        className="grid size-9 shrink-0 place-items-center rounded-full text-[#647487] transition hover:bg-[#F5F1E8] hover:text-[#09233D]"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-5"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="signup-popup-phone" className={authLabelClassName}>
                                Mobile Number
                            </Label>
                            <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-[#062A4D] focus-within:ring-2 focus-within:ring-[#062A4D]/15">
                                <span className="flex items-center border-r border-slate-200 px-4 text-sm font-semibold text-[#1A1A2E]">
                                    +91
                                </span>
                                <Input
                                    ref={phoneRef}
                                    id="signup-popup-phone"
                                    type="tel"
                                    inputMode="numeric"
                                    required
                                    maxLength={10}
                                    autoComplete="tel"
                                    placeholder="Enter mobile number"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    disabled={form.processing}
                                    className="h-12 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                                />
                            </div>
                            <InputError message={form.errors.phone} />
                        </div>

                        <Button
                            type="submit"
                            className={authSubmitClassName}
                            disabled={form.processing}
                        >
                            {form.processing && <Spinner />}
                            {form.processing ? 'Sending OTP...' : 'Continue'}
                        </Button>

                        <p className="text-center text-xs leading-5 text-slate-500">
                            By continuing, you agree to our{' '}
                            <Link
                                href="/terms-and-conditions"
                                className={authLinkClassName}
                                onClick={dismiss}
                            >
                                Terms & Conditions
                            </Link>{' '}
                            and{' '}
                            <Link
                                href="/privacy-policy"
                                className={authLinkClassName}
                                onClick={dismiss}
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>

                        <p className="border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
                            Prefer the full page?{' '}
                            <Link href="/login" className={authLinkClassName} onClick={dismiss}>
                                Continue here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
