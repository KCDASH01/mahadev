import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import type { AuthLayoutProps } from '@/types';

export default function StorefrontAuthLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#FAFBFE] font-sans text-[#1A1A2E] antialiased">
            <HomeHeader showSignupPopup={false} />

            <main className="px-4 pb-16 pt-[calc(var(--home-fixed-header-height)+2.5rem)] sm:px-5 lg:px-6">
                <div className="mx-auto w-full max-w-[440px]">
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_18px_50px_-24px_rgba(139,30,49,0.28)] sm:p-10">
                        <div className="mb-8 space-y-3 text-center">
                            <p className="text-xs font-bold tracking-[0.22em] text-[#062A4D] uppercase">
                                Account
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A2E]">
                                {title}
                            </h1>
                            {description && (
                                <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        {children}
                    </div>
                </div>
            </main>

            <HomeFooter />
        </div>
    );
}
