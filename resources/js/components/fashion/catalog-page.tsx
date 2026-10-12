import { Link, router } from '@inertiajs/react';
import { ArrowDownWideNarrow, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CatalogFiltersPanel } from '@/components/fashion/catalog-filters-panel';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { HomeProductCard } from '@/components/product-card';
import type { CatalogCategory, CatalogCollection, CatalogFilters, FashionProduct } from '@/data/fashion-products';
import { mediaUrl } from '@/lib/media-url';
import { collectionCategoryPath, collectionPath } from '@/lib/storefront-paths';

function defaultSelectedAttributes(filters: CatalogFilters): Record<string, string[]> {
    return Object.fromEntries(filters.attributes.map((attribute) => [attribute.slug, []]));
}

function productMatchesAttributes(
    product: FashionProduct,
    selectedAttributes: Record<string, string[]>,
): boolean {
    for (const [slug, selectedValues] of Object.entries(selectedAttributes)) {
        if (selectedValues.length === 0) {
            continue;
        }

        const productValues = product.attributes?.[slug] ?? (slug === 'color' ? [product.color] : []);

        if (!selectedValues.some((value) => productValues.includes(value))) {
            return false;
        }
    }

    return true;
}

function CategoryCarousel({
    categories,
    activeCategory,
    onSelect,
}: {
    categories: CatalogCategory[];
    activeCategory: string;
    onSelect: (label: string) => void;
}) {
    const circleSizeClass =
        'w-full max-w-[168px] sm:max-w-[188px] md:max-w-[208px] lg:max-w-[228px] max-sm:max-w-[148px]';

    return (
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-10 sm:mt-10 sm:gap-x-8 sm:gap-y-12 lg:gap-x-12 lg:gap-y-14 max-sm:mt-6 max-sm:grid max-sm:grid-cols-2 max-sm:justify-items-center max-sm:gap-x-3 max-sm:gap-y-6">
            {categories.map((item) => {
                const isActive = activeCategory === item.label;

                const circleClassName = `relative block aspect-square ${circleSizeClass} overflow-hidden rounded-full border bg-[#F7F4F1] shadow-[0_10px_28px_-14px_rgba(74,18,28,0.45)] transition duration-500 ${
                    isActive
                        ? 'border-[#062A4D] ring-2 ring-[#062A4D]/30'
                        : 'border-[#062A4D]/35 ring-1 ring-[#062A4D]/10 hover:border-[#062A4D] hover:ring-[#062A4D]/25'
                }`;

                const image = (
                    <img
                        src={mediaUrl(item.image) ?? item.image}
                        alt={item.label}
                        className="h-full w-full object-cover object-top transition duration-700 ease-out group-hover:scale-[1.06]"
                    />
                );

                const label = (
                    <span
                        className={`mt-3 text-center font-helvetica text-base font-medium tracking-wide transition sm:mt-4 sm:text-lg lg:mt-5 lg:text-xl max-sm:mt-2 max-sm:text-sm ${
                            isActive ? 'text-[#062A4D]' : 'text-[#09233D] group-hover:text-[#062A4D]'
                        }`}
                    >
                        {item.label}
                    </span>
                );

                const content = (
                    <div className={`group flex ${circleSizeClass} flex-col items-center`}>
                        <span className={circleClassName}>{image}</span>
                        {label}
                    </div>
                );

                if (item.href) {
                    const filtersInPage = item.filter === 'category';

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex justify-center max-sm:w-full"
                            aria-current={isActive ? 'page' : undefined}
                            onClick={(event) => {
                                if (!filtersInPage || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
                                    return;
                                }

                                event.preventDefault();
                                onSelect(item.label);
                            }}
                        >
                            {content}
                        </Link>
                    );
                }

                return (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => onSelect(item.label)}
                        className="flex justify-center max-sm:w-full"
                        aria-pressed={isActive}
                    >
                        {content}
                    </button>
                );
            })}
        </div>
    );
}

type CatalogPageProps = {
    products: FashionProduct[];
    categories: CatalogCategory[];
    collection: CatalogCollection;
    filters: CatalogFilters;
    selectedCategory?: string;
};

export function CatalogPage({
    products,
    categories,
    collection,
    filters,
    selectedCategory = 'All',
}: CatalogPageProps) {
    const { title, slug, heroImage, heroImagePosition = 'center center' } = collection;
    const pageKey = slug;
    const categoryOptions = ['All', ...categories.map((item) => item.label)];

    const category = selectedCategory;
    const [search, setSearch] = useState('');
    const [maxPrice, setMaxPrice] = useState(filters.price.max);
    const [minRating, setMinRating] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState(() => defaultSelectedAttributes(filters));
    const [sort, setSort] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);
    const productsSectionRef = useRef<HTMLDivElement>(null);
    const scrollAfterCategoryChange = useRef(false);

    useEffect(() => {
        if (!scrollAfterCategoryChange.current) {
            return;
        }

        scrollAfterCategoryChange.current = false;

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }, [category, pageKey]);

    const filteredProducts = useMemo(() => {
        const visible = products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
            const activeCategoryMeta = categories.find((item) => item.label === category);
            const matchesCategory =
                category === 'All' ||
                (activeCategoryMeta?.filter === 'gender'
                    ? product.gender === category
                    : product.category === category);
            const matchesPrice = product.price <= maxPrice;
            const matchesRating = product.rating >= minRating;
            const matchesAttributes = productMatchesAttributes(product, selectedAttributes);

            return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesAttributes;
        });

        return visible.sort((a, b) => {
            if (sort === 'price-low') {
                return a.price - b.price;
            }

            if (sort === 'price-high') {
                return b.price - a.price;
            }

            if (sort === 'rating') {
                return b.rating - a.rating;
            }

            return b.reviews - a.reviews;
        });
    }, [categories, category, maxPrice, minRating, products, search, selectedAttributes, sort]);

    const activeFilterCount = useMemo(() => {
        let count = 0;

        if (search.trim()) {
            count += 1;
        }

        if (category !== 'All') {
            count += 1;
        }

        if (maxPrice < filters.price.max) {
            count += 1;
        }

        if (minRating > 0) {
            count += 1;
        }

        for (const values of Object.values(selectedAttributes)) {
            count += values.length;
        }

        return count;
    }, [category, filters.price.max, maxPrice, minRating, search, selectedAttributes]);

    const toggleAttributeValue = (slug: string, value: string) => {
        setSelectedAttributes((current) => {
            const selected = current[slug] ?? [];
            const nextValues = selected.includes(value)
                ? selected.filter((item) => item !== value)
                : [...selected, value];

            return {
                ...current,
                [slug]: nextValues,
            };
        });
    };

    const resetFilters = () => {
        setSearch('');
        setMaxPrice(filters.price.max);
        setMinRating(0);
        setSelectedAttributes(defaultSelectedAttributes(filters));
        setSort('featured');

        if (category !== 'All') {
            router.get(collectionPath(slug));
        }
    };

    const scrollToProducts = () => {
        window.requestAnimationFrame(() => {
            productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const selectCategory = (label: string) => {
        setShowFilters(false);

        if (label === category) {
            scrollToProducts();

            return;
        }

        const href = label === 'All' ? collectionPath(slug) : collectionCategoryPath(slug, label);

        scrollAfterCategoryChange.current = true;

        router.get(
            href,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    scrollAfterCategoryChange.current = false;
                },
            },
        );
    };

    const isCategoryView = category !== 'All';
    const categoryHeading = isCategoryView ? `All ${category}` : title;

    return (
        <div className="min-h-screen bg-white text-[#1A1A2E]">
            <HomeHeader />

            <main className="pt-home-header">
                {!isCategoryView && (
                    <section className="relative h-[320px] overflow-hidden sm:h-[380px] lg:h-[460px]">
                        <img
                            src={mediaUrl(heroImage) ?? heroImage}
                            alt={`${title} collection`}
                            className="h-full w-full object-cover"
                            style={{ objectPosition: heroImagePosition }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
                        <div className="absolute inset-0 flex items-end">
                            <div className="mx-auto w-full max-w-[1800px] px-4 pb-8 sm:px-5 lg:px-6">
                                <h1 className="font-serif text-5xl font-bold text-white sm:text-6xl lg:text-7xl">{title}</h1>
                            </div>
                        </div>
                    </section>
                )}

                <div className="mx-auto w-full max-w-[1720px] px-6 pt-5 sm:px-10 lg:px-14 xl:px-16">
                    <nav className={`text-sm text-slate-500 ${isCategoryView ? 'mt-6 sm:mt-8' : ''}`}>
                        <Link href="/" className="transition hover:text-[#062A4D]">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                        {isCategoryView ? (
                            <span className="font-medium text-[#1A1A2E]">{categoryHeading}</span>
                        ) : (
                            <span className="font-medium text-[#1A1A2E]">{title}</span>
                        )}
                    </nav>

                    {categories.length > 0 && (
                        <CategoryCarousel
                            categories={categories}
                            activeCategory={category === 'All' ? '' : category}
                            onSelect={selectCategory}
                        />
                    )}

                    {isCategoryView && (
                        <h1 className="mt-8 text-4xl font-bold tracking-tight text-[#1A1A2E] sm:text-5xl lg:mt-10 lg:text-6xl max-sm:mt-6 max-sm:text-2xl">
                            {categoryHeading}
                        </h1>
                    )}

                    <div
                        ref={productsSectionRef}
                        className={`scroll-mt-[calc(var(--home-fixed-header-height)+0.75rem)] flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between ${isCategoryView ? 'mt-6 sm:mt-8' : 'mt-10'}`}
                    >
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setShowFilters(true)}
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#1A1A2E] shadow-sm transition hover:border-[#062A4D]/30"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#062A4D] px-1.5 text-xs font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                            <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#1A1A2E] shadow-sm">
                                <ArrowDownWideNarrow className="h-4 w-4" />
                                Sort by
                                <select
                                    value={sort}
                                    onChange={(event) => setSort(event.target.value)}
                                    className="bg-transparent text-sm font-semibold outline-none"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </label>
                        </div>
                        <p className="text-sm font-medium text-[#1A1A2E]">{filteredProducts.length} Products</p>
                    </div>

                    <section className="py-8 lg:py-10">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-7">
                                {filteredProducts.map((product, index) => (
                                    <HomeProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                <div>
                                    <p className="text-2xl font-semibold">No products found</p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Try another category or adjust your filters.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="mt-6 inline-flex h-11 items-center rounded-full bg-[#062A4D] px-6 text-sm font-bold text-white transition hover:bg-[#041F3A]"
                                    >
                                        Reset filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <HomeFooter />

            {showFilters && (
                <CatalogFiltersPanel
                    pageKey={pageKey}
                    title={title}
                    categoryOptions={categoryOptions}
                    filters={filters}
                    search={search}
                    category={category}
                    maxPrice={maxPrice}
                    minRating={minRating}
                    selectedAttributes={selectedAttributes}
                    activeFilterCount={activeFilterCount}
                    onSearchChange={setSearch}
                    onCategoryChange={selectCategory}
                    onMaxPriceChange={setMaxPrice}
                    onMinRatingChange={setMinRating}
                    onToggleAttributeValue={toggleAttributeValue}
                    onReset={resetFilters}
                    onClose={() => setShowFilters(false)}
                />
            )}
        </div>
    );
}
