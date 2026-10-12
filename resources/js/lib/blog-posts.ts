import { mediaUrl } from '@/lib/media-url';
import type { BlogPostRecord, StorefrontBlogPost } from '@/types/blog';
import type { HomepageBlogPost } from '@/types/homepage';

function formatPostDate(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function mapPostToCard(post: BlogPostRecord | HomepageBlogPost): StorefrontBlogPost {
    return {
        key: `blog-${post.id}`,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content ?? post.excerpt,
        date: formatPostDate(post.published_at),
        category: post.category,
        image: mediaUrl(post.image) ?? post.image,
    };
}

export function homepagePostsToCards(posts: HomepageBlogPost[]): StorefrontBlogPost[] {
    return posts.map(mapPostToCard);
}

export function resolveBlogPosts(posts: BlogPostRecord[] | HomepageBlogPost[]): StorefrontBlogPost[] {
    return posts.map(mapPostToCard);
}

export function formatBlogDate(value: string | null): string {
    return formatPostDate(value);
}
