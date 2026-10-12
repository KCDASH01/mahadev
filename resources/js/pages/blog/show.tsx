import { Head, Link } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { FashionBlogCard } from '@/components/fashion/fashion-blog-card';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { formatBlogDate, resolveBlogPosts } from '@/lib/blog-posts';
import { mediaUrl } from '@/lib/media-url';
import type { BlogShowPageProps } from '@/types/blog';

export default function BlogShow({ post, relatedPosts }: BlogShowPageProps) {
    const image = mediaUrl(post.image) ?? post.image;
    const formattedDate = formatBlogDate(post.published_at);
    const relatedCards = resolveBlogPosts(
        relatedPosts.map((item) => ({
            ...item,
            content: null,
        })),
    );

    return (
        <>
            <Head title={post.title} />

            <div className="min-h-screen bg-white text-[#1A1A2E]">
                <HomeHeader />

                <main className="pt-home-header">
                    <section className="border-b border-slate-200 bg-gradient-to-br from-[#F5F7FC] via-white to-[#FFF7F0]">
                        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                            <nav className="text-sm text-slate-500">
                                <Link href="/" className="transition hover:text-[#062A4D]">
                                    Home
                                </Link>
                                <span className="mx-2">/</span>
                                <Link href="/blog" className="transition hover:text-[#062A4D]">
                                    Blog
                                </Link>
                                <span className="mx-2">/</span>
                                <span className="font-medium text-[#09233D]">{post.title}</span>
                            </nav>

                            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span className="rounded-full bg-[#062A4D] px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                                    {post.category}
                                </span>
                                {formattedDate ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar className="size-4" />
                                        {formattedDate}
                                    </span>
                                ) : null}
                            </div>

                            <h1 className="mt-5 font-serif text-3xl font-medium tracking-tight text-[#062A4D] sm:text-4xl lg:text-5xl">
                                {post.title}
                            </h1>
                            <p className="mt-4 text-lg leading-8 text-slate-600">{post.excerpt}</p>
                        </div>
                    </section>

                    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
                            <img
                                src={image}
                                alt={post.title}
                                className="aspect-[16/9] w-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>

                        <div className="prose prose-slate mt-10 max-w-none">
                            {(post.content ?? post.excerpt).split('\n\n').map((paragraph) => (
                                <p key={paragraph} className="mb-5 text-base leading-8 text-slate-600 last:mb-0">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </article>

                    {relatedCards.length > 0 ? (
                        <section className="border-t border-slate-200 bg-[#F5F7FC]/60">
                            <div className="mx-auto w-full max-w-[1800px] px-4 py-12 sm:px-5 sm:py-14 lg:px-6">
                                <h2 className="font-serif text-2xl font-medium text-[#062A4D]">Related Articles</h2>
                                <p className="mt-2 text-slate-600">More style inspiration from the {post.category} desk.</p>

                                <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                                    {relatedCards.map((item) => (
                                        <FashionBlogCard key={item.key} post={item} compact />
                                    ))}
                                </div>
                            </div>
                        </section>
                    ) : null}
                </main>

                <HomeFooter />
            </div>
        </>
    );
}
