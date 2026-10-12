import { HomeSectionHeading } from '@/components/home/home-section-heading';
import { HomeProductRow } from '@/components/home/home-product-row';
import type { FashionProduct } from '@/data/fashion-products';

export function HomeFeatured({ products }: { products: FashionProduct[] }) {
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="bg-[#FCFAF5] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
                <HomeSectionHeading
                    eyebrow="Featured"
                    title="Featured Picks"
                    description="Featured garments and furniture selected by Mahadev for quality, utility and value."
                />

                <HomeProductRow products={products} className="mt-10" />
            </div>
        </section>
    );
}
