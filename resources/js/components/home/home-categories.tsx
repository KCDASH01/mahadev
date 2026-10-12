import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeSectionHeading } from '@/components/home/home-section-heading';
import { mostWantedCategories as fallbackCategories } from '@/data/home-content';
import { mediaUrl } from '@/lib/media-url';
import type { FeaturedCategory } from '@/types/storefront';

function resolveFeaturedCategories(categories?: FeaturedCategory[]) {
    if (categories && categories.length > 0) {
        return categories;
    }

    return fallbackCategories.map((category) => ({
        ...category,
        gender: category.href.includes('/women') ? 'women' : 'men',
    }));
}

function formatCategorySubtitle(count: string): string {
    const normalized = count.trim();

    if (/^new$/i.test(normalized)) {
        return 'NEW PRODUCTS';
    }

    if (/products?$/i.test(normalized)) {
        return normalized.toUpperCase();
    }

    return `${normalized} PRODUCTS`;
}

function CategoryCard({ category }: { category: FeaturedCategory }) {
    const imageSrc = mediaUrl(category.image) ?? category.image;

    return (
        <Link
            href={category.href}
            className="group relative block aspect-square overflow-hidden bg-[#F5F1E8]"
        >
            <img
                src={imageSrc}
                alt={category.title}
                className="h-full w-full object-cover object-top transition duration-700 ease-out group-hover:scale-[1.05]"
                style={{
                    objectPosition: category.imagePosition ?? 'center top',
                }}
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end bg-linear-to-t from-black/80 via-black/35 to-transparent px-2 pt-14 pb-4 text-center sm:px-3 sm:pt-20 sm:pb-5 lg:pb-6">
                <p className="font-helvetica text-sm font-semibold tracking-[0.12em] text-white uppercase sm:text-base lg:text-xl">
                    {category.title}
                </p>
                <p className="mt-1 text-[9px] font-medium tracking-[0.18em] text-white/90 uppercase sm:mt-1.5 sm:text-[11px]">
                    {formatCategorySubtitle(category.count)}
                </p>
            </div>
        </Link>
    );
}

function CategoryCarousel({ categories }: { categories: FeaturedCategory[] }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const track = trackRef.current;
        if (!track) {
            return;
        }

        setCanScrollLeft(track.scrollLeft > 4);
        setCanScrollRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
    }, []);

    useEffect(() => {
        updateScrollState();

        const track = trackRef.current;
        if (!track) {
            return;
        }

        const observer = new ResizeObserver(updateScrollState);
        observer.observe(track);
        window.addEventListener('resize', updateScrollState);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateScrollState);
        };
    }, [updateScrollState, categories]);

    const scroll = (direction: 'left' | 'right') => {
        const track = trackRef.current;
        if (!track) {
            return;
        }

        track.scrollBy({
            left: direction === 'left' ? -track.clientWidth : track.clientWidth,
            behavior: 'smooth',
        });
    };

    const showArrows = canScrollLeft || canScrollRight;

    return (
        <div className="mt-10 sm:mt-12">
            <div className="flex items-center gap-2 sm:gap-4">
                {showArrows && (
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        aria-label="Previous categories"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#E8DDC5] bg-white text-[#09233D] shadow-sm transition hover:border-[#062A4D] hover:text-[#062A4D] disabled:pointer-events-none disabled:opacity-30 sm:size-10"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                )}

                <div
                    ref={trackRef}
                    onScroll={updateScrollState}
                    className="flex min-w-0 flex-1 gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none lg:gap-5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {categories.map((category) => (
                        <div
                            key={`${category.gender}-${category.title}`}
                            className="w-[calc((100%-3.75rem)/4)] min-w-[calc((100%-3.75rem)/4)] shrink-0 snap-start"
                        >
                            <CategoryCard category={category} />
                        </div>
                    ))}
                </div>

                {showArrows && (
                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        aria-label="Next categories"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#E8DDC5] bg-white text-[#09233D] shadow-sm transition hover:border-[#062A4D] hover:text-[#062A4D] disabled:pointer-events-none disabled:opacity-30 sm:size-10"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function HomeCategories() {
    const { featuredCategories } = usePage().props;
    const categories = resolveFeaturedCategories(featuredCategories);

    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
                <HomeSectionHeading
                    eyebrow="Everything in One Place"
                    title="Popular Categories"
                    description="Browse everyday garments and practical furniture, thoughtfully organized for easy shopping."
                />

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45 }}
                >
                    <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:hidden">
                        {categories.map((category, index) => (
                            <motion.div
                                key={`${category.gender}-${category.title}-grid`}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.35, delay: index * 0.04 }}
                            >
                                <CategoryCard category={category} />
                            </motion.div>
                        ))}
                    </div>

                    <div className="hidden lg:block">
                        <CategoryCarousel categories={categories} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
