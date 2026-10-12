// resources/js/components/storefront/product-section.tsx
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/storefront/product-card';
import SectionHeading from '@/components/storefront/section-heading';
import { themeColors } from '@/lib/theme-colors';
import type { HomepageProduct } from '@/types/homepage';

type ProductSectionProps = {
    title: string;
    description: string;
    products: HomepageProduct[];
    viewAllLink?: string;
    badge?: 'new' | 'bestseller' | null;
};

export default function ProductSection({
    title,
    description,
    products,
    viewAllLink = '/products',
    badge = null,
}: ProductSectionProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="w-full px-3 py-6 sm:px-4 sm:py-8 md:py-10">
            <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between md:mb-6">
                <SectionHeading
                    title={title}
                    description={description}
                    className="mb-0"
                />
                <a
                    href={viewAllLink}
                    className="group inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:text-sm"
                    style={{ color: themeColors.secondary }}
                >
                    View All
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5 sm:size-4" />
                </a>
            </div>

            <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {products.slice(0, 10).map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        badge={badge}
                    />
                ))}
            </div>
        </section>
    );
}
