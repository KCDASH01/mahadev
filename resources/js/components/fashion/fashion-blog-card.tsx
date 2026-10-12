import { Calendar, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { StorefrontBlogPost } from '@/types/blog';

type FashionBlogCardProps = {
    post: StorefrontBlogPost;
    compact?: boolean;
};

export function FashionBlogCard({ post, compact = false }: FashionBlogCardProps) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#062A4D]/20 hover:shadow-lg hover:shadow-[#062A4D]/10">
            <Link href={`/blog/${post.slug}`} className="block">
                <div className={`overflow-hidden bg-slate-100 ${compact ? 'aspect-[16/10]' : 'aspect-[16/11]'}`}>
                    <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                </div>
            </Link>

            <div className={compact ? 'p-4' : 'p-5 sm:p-6'}>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-[#062A4D] px-2.5 py-0.5 font-semibold tracking-wide text-white uppercase">
                        {post.category}
                    </span>
                    {post.date ? (
                        <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3" />
                            {post.date}
                        </span>
                    ) : null}
                </div>

                <Link href={`/blog/${post.slug}`} className="block">
                    <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-[#09233D] transition group-hover:text-[#062A4D] sm:text-lg">
                        {post.title}
                    </h3>
                </Link>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>

                <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#062A4D] transition hover:gap-2"
                >
                    Read Article
                    <ChevronRight className="size-4" />
                </Link>
            </div>
        </article>
    );
}
