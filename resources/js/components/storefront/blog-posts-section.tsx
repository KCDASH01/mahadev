import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { FashionBlogCard } from '@/components/fashion/fashion-blog-card';
import { homepagePostsToCards } from '@/lib/blog-posts';
import { index as blogIndex } from '@/routes/blog';
import type { HomepageBlogPost } from '@/types/homepage';

type BlogPostsSectionProps = {
    posts?: HomepageBlogPost[];
};

export default function BlogPostsSection({ posts = [] }: BlogPostsSectionProps) {
    const displayPosts = homepagePostsToCards(posts);

    if (displayPosts.length === 0) {
        return null;
    }

    return (
        <section className="w-full px-3 py-4 sm:px-4 md:py-6">
            <div className="mx-auto max-w-[1800px]">
                <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between md:mb-6">
                    <div>
                        <p className="text-xs font-bold tracking-[0.22em] text-[#FF6A00] uppercase">
                            Mahadev Journal
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-[#313C8D] sm:text-3xl">
                            Latest from our blog
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                            Style stories, fit guides, and fashion inspiration from the admin blog.
                        </p>
                    </div>
                    <Link
                        href={blogIndex()}
                        className="group inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#313C8D] shadow-sm transition hover:border-[#313C8D]/20 hover:shadow-md"
                    >
                        View All Posts
                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                    {displayPosts.map((post) => (
                        <FashionBlogCard key={post.key} post={post} compact />
                    ))}
                </div>
            </div>
        </section>
    );
}
