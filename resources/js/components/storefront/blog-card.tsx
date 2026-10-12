import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { themeColors } from '@/lib/theme-colors';
import type { StorefrontBlogPost } from '@/types/blog';

type BlogCardProps = {
    post: StorefrontBlogPost;
    expanded: boolean;
    onToggle: () => void;
};

export default function BlogCard({ post, expanded, onToggle }: BlogCardProps) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span
                        className="rounded-full px-2 py-0.5 font-medium text-white"
                        style={{ backgroundColor: themeColors.primary }}
                    >
                        {post.category}
                    </span>
                    {post.date ? (
                        <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3" />
                            {post.date}
                        </span>
                    ) : null}
                </div>
                <h3
                    className="mt-3 line-clamp-2 text-base font-semibold leading-snug group-hover:text-[var(--theme-primary,#2563EB)]"
                    style={{ color: themeColors.secondary }}
                >
                    {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {post.excerpt}
                </p>

                {expanded ? (
                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                            {post.content}
                        </p>
                    </div>
                ) : null}

                <button
                    type="button"
                    onClick={onToggle}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: themeColors.primary }}
                    aria-expanded={expanded}
                >
                    {expanded ? (
                        <>
                            Read Less
                            <ChevronDown className="size-4" />
                        </>
                    ) : (
                        <>
                            Read More
                            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                    )}
                </button>
            </div>
        </article>
    );
}
