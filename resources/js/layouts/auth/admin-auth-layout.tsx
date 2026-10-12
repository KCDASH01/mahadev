import { Link } from '@inertiajs/react';
import type { AuthLayoutProps } from '@/types';

export default function AdminAuthLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-[#FCFAF5] px-4 py-10">
            <div className="w-full max-w-[420px]">
                <div className="mb-8 text-center">
                    <Link href="/" className="font-serif text-3xl font-medium tracking-tight text-[#062A4D]">
                        Mahadev
                    </Link>
                </div>

                <div className="rounded-3xl border border-[#E8DDC5] bg-white p-8 shadow-[0_18px_50px_-24px_rgba(139,30,49,0.28)] sm:p-10">
                    <div className="mb-8 space-y-2 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm leading-6 text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
