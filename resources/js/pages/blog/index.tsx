import { Head, Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { FashionBlogCard } from '@/components/fashion/fashion-blog-card';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { homeBrand } from '@/data/home-brand';
import { resolveBlogPosts } from '@/lib/blog-posts';
import type { BlogIndexPageProps } from '@/types/blog';

export default function BlogIndex({ posts }: BlogIndexPageProps) {
    const displayPosts = resolveBlogPosts(posts);

    return (
        <>
            <Head title="Blog" />

            <div className="min-h-screen bg-white text-[#1A1A2E]">
                <HomeHeader />

                <main className="pt-home-header">
                    <section className="border-b border-slate-200 bg-gradient-to-br from-[#F5F7FC] via-white to-[#FFF7F0]">
                        <div className="mx-auto w-full max-w-[1800px] px-4 py-12 sm:px-5 sm:py-16 lg:px-6 lg:py-20">
                            <nav className="text-sm text-slate-500">
                                <Link href="/" className="transition hover:text-[#062A4D]">
                                    Home
                                </Link>
                                <span className="mx-2">/</span>
                                <span className="font-medium text-[#09233D]">Blog</span>
                            </nav>

                            <p className="mt-6 text-xs font-bold tracking-[0.22em] text-[#062A4D] uppercase">
                                {homeBrand.name} Journal
                            </p>
                            <h1 className="mt-3 max-w-3xl font-serif text-3xl font-medium tracking-tight text-[#062A4D] sm:text-4xl lg:text-5xl">
                                Style stories, fit guides, and fashion inspiration
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                                Discover styling tips, seasonal trends, and practical advice for Men, Women, and Kids
                                collections.
                            </p>
                        </div>
                    </section>

                    <section className="mx-auto w-full max-w-[1800px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6 lg:py-16">
                        {displayPosts.length === 0 ? (
                            <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-[#F5F7FC]/60 px-8 py-16 text-center">
                                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#062A4D]/10 text-[#062A4D]">
                                    <BookOpen className="h-7 w-7" />
                                </span>
                                <h2 className="mt-5 font-serif text-xl font-medium text-[#062A4D]">No articles yet</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    New style guides and fashion stories will appear here once published from the admin
                                    panel.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                                {displayPosts.map((post) => (
                                    <FashionBlogCard key={post.key} post={post} />
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                <HomeFooter />
            </div>
        </>
    );
}
