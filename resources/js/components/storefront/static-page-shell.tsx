import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { homeBrand } from '@/data/home-brand';

type StaticPageShellProps = {
    title: string;
    subtitle: string;
    breadcrumbs?: { label: string; href?: string }[];
    children: ReactNode;
};

export function StaticPageShell({
    title,
    subtitle,
    breadcrumbs = [],
    children,
}: StaticPageShellProps) {
    return (
        <>
            <Head title={title} />

            <div className="min-h-screen bg-white text-[#1A1A2E]">
                <HomeHeader />

                <main className="pt-home-header">
                    <section className="border-b border-slate-200 bg-gradient-to-br from-[#F5F7FC] via-white to-[#FFF7F0]">
                        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                            <nav className="text-sm text-slate-500">
                                <Link href="/" className="transition hover:text-[#062A4D]">
                                    Home
                                </Link>
                                {breadcrumbs.map((crumb) => (
                                    <span key={crumb.label}>
                                        <span className="mx-2">/</span>
                                        {crumb.href ? (
                                            <Link href={crumb.href} className="transition hover:text-[#062A4D]">
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span className="font-medium text-[#09233D]">{crumb.label}</span>
                                        )}
                                    </span>
                                ))}
                            </nav>

                            <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight text-[#062A4D] sm:text-4xl lg:text-5xl">
                                {title}
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{subtitle}</p>
                        </div>
                    </section>

                    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                        {children}
                    </section>
                </main>

                <HomeFooter />
            </div>
        </>
    );
}

export function StaticPageContentBlock({
    heading,
    paragraphs = [],
    bullets,
}: {
    heading?: string;
    paragraphs?: string[];
    bullets?: string[];
}) {
    return (
        <article className="border-b border-slate-100 py-8 last:border-b-0">
            {heading && <h2 className="font-serif text-xl font-medium text-[#062A4D]">{heading}</h2>}
            <div className={`space-y-4 ${heading ? 'mt-4' : ''}`}>
                {paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-7 text-slate-600">
                        {paragraph}
                    </p>
                ))}
                {bullets && bullets.length > 0 && (
                    <ul className="grid gap-2 pl-5 text-base leading-7 text-slate-600 marker:text-[#062A4D]">
                        {bullets.map((item) => (
                            <li key={item} className="list-disc">
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </article>
    );
}

export function staticPageBreadcrumb(label: string) {
    return [{ label }];
}
