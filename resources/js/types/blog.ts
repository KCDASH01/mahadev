export type StorefrontBlogPost = {
    key: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    category: string;
    image: string;
};

export type BlogPostRecord = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string | null;
    category: string;
    image: string;
    published_at: string | null;
};

export type BlogIndexPageProps = {
    posts: BlogPostRecord[];
};

export type BlogShowPageProps = {
    post: BlogPostRecord;
    relatedPosts: Pick<BlogPostRecord, 'id' | 'title' | 'slug' | 'excerpt' | 'category' | 'image' | 'published_at'>[];
};
