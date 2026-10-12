import { Link } from '@inertiajs/react';
import { HomeSectionHeading } from '@/components/home/home-section-heading';
import { HomeProductRow } from '@/components/home/home-product-row';
import type { FashionProduct } from '@/data/fashion-products';

export function HomeTrending({ products }: { products: FashionProduct[] }) {
    return (
        <section id="products" className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <HomeSectionHeading
                        eyebrow="Trending Now"
                        title="Best Sellers This Week"
                        description="Handpicked styles with premium quality, honest pricing, and fast delivery across India."
                        align="left"
                    />
                    <Link
                        href="/trending"
                        className="inline-flex h-10 w-fit shrink-0 items-center self-start border border-[#062A4D] px-5 text-[11px] font-medium tracking-[0.2em] text-[#062A4D] uppercase transition hover:bg-[#062A4D] hover:text-[#FCFAF5] sm:h-11 sm:px-6"
                    >
                        View All
                    </Link>
                </div>

                <HomeProductRow products={products} className="mt-10" />
            </div>
        </section>
    );
}
