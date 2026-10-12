export type HomepageBanner = {
    id: number;
    title: string;
    image: string;
    link: string | null;
};

export type HomepageCategory = {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    products_count?: number;
};

export type HomepageProduct = {
    id: number;
    name: string;
    slug: string;
    sku: string;
    original_price: string;
    sale_price: string;
    thumbnail: string | null;
    short_description?: string | null;
    is_featured: boolean;
    category?: { id: number; name: string; slug: string };
    brand?: { id: number; name: string; slug: string } | null;
};

export type HomepageBrand = {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    featured_image?: string | null;
    tagline?: string | null;
    products_count?: number;
};

export type WhyChooseUsItem = {
    title: string;
    description: string;
};

export type HomepageBlogPost = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string | null;
    category: string;
    image: string;
    published_at: string | null;
};

export type HomepageData = {
    banners: HomepageBanner[];
    navCategories: HomepageCategory[];
    shopCategories: HomepageCategory[];
    featuredProducts: HomepageProduct[];
    newArrivals: HomepageProduct[];
    bestSellers: HomepageProduct[];
    brands: HomepageBrand[];
    blogPosts: HomepageBlogPost[];
    whyChooseUs: WhyChooseUsItem[];
};
