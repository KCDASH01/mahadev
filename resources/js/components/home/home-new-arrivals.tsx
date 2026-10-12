import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { HomeProductRow } from '@/components/home/home-product-row';
import { getNewArrivalCategories, type FashionProduct } from '@/data/fashion-products';

const NEW_ARRIVALS_LIMIT = 8;

export function HomeNewArrivals({ products }: { products: FashionProduct[] }) {
    const categories = useMemo(() => getNewArrivalCategories(products), [products]);
    const [activeCategory, setActiveCategory] = useState<'all' | string>('all');

    const filteredProducts = useMemo(() => {
        if (activeCategory === 'all') {
            return products;
        }

        return products.filter((product) => product.category === activeCategory);
    }, [activeCategory, products]);

    const visibleProducts = useMemo(
        () => filteredProducts.slice(0, NEW_ARRIVALS_LIMIT),
        [filteredProducts],
    );

    const chipClass = (active: boolean) =>
        `border px-4 py-2 text-[12px] font-medium tracking-[0.14em] uppercase transition sm:px-5 ${
            active
                ? 'border-[#062A4D] bg-[#062A4D] text-[#FCFAF5]'
                : 'border-[#E8DDC5] bg-transparent text-[#647487] hover:border-[#062A4D]/40 hover:text-[#062A4D]'
        }`;

    return (
        <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="text-center">
                    <p className="text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">Just In</p>
                    <h2 className="mt-3 font-helvetica text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl lg:text-[2.65rem]">
                        New Arrivals
                    </h2>
                    <HomeBrandMotif className="mt-4" />
                    <p className="mt-4 text-sm text-[#647487] sm:text-[15px]">
                        Get them before everyone else does
                    </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveCategory('all')}
                        className={chipClass(activeCategory === 'all')}
                    >
                        View All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setActiveCategory(category)}
                            className={chipClass(activeCategory === category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <HomeProductRow
                    key={activeCategory}
                    products={visibleProducts}
                    showNewArrivalBadge
                    className="mt-10"
                />

                {filteredProducts.length === 0 && (
                    <p className="mt-10 text-center text-sm text-[#647487]">
                        No new arrivals in this category yet. Check back soon.
                    </p>
                )}

                <div className="mt-10 text-center">
                    <Link
                        href="/new-arrivals"
                        className="inline-flex h-11 items-center bg-[#062A4D] px-7 text-[11px] font-medium tracking-[0.2em] text-[#FCFAF5] uppercase transition hover:bg-[#041F3A]"
                    >
                        Explore All New Arrivals
                    </Link>
                </div>
            </div>
        </section>
    );
}
