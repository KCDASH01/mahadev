import type { HomepageCategory } from '@/types/homepage';

export type ProductVariantOption = {
    id: number;
    value: string;
    original_price: string;
    sale_price: string;
    stock: number;
    sku: string;
};

export type ProductVariantGroup = {
    name: string;
    options: ProductVariantOption[];
};

export type ProductSpecification = {
    label: string;
    value: string;
};

export type ProductDetail = {
    id: number;
    name: string;
    slug: string;
    sku: string;
    short_description: string | null;
    description: string | null;
    specifications: ProductSpecification[];
    original_price: string;
    sale_price: string;
    stock: number;
    weight: string | null;
    thumbnail: string | null;
    images: string[];
    is_featured: boolean;
    category: { id: number; name: string; slug: string } | null;
    brand: { id: number; name: string; slug: string } | null;
    variant_groups: ProductVariantGroup[];
    has_variants: boolean;
};

export type RelatedProduct = {
    id: number;
    name: string;
    slug: string;
    original_price: string;
    sale_price: string;
    thumbnail: string | null;
    rating: number;
    review_count: number;
};

export type ProductReview = {
    id: number;
    name: string;
    email?: string;
    rating: number;
    title?: string | null;
    comment: string;
    date: string;
};

export type RatingSummary = {
    average: number;
    total: number;
    breakdown: Record<number, number>;
};

export type ProductShowPageProps = {
    product: ProductDetail;
    relatedProducts: RelatedProduct[];
    navCategories: HomepageCategory[];
    reviews: ProductReview[];
    ratingSummary: RatingSummary;
};
