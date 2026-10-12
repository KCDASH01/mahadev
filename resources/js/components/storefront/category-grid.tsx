// resources/js/components/storefront/category-grid.tsx
import { useState } from 'react';
import SectionHeading from '@/components/storefront/section-heading';
import { mediaUrl } from '@/lib/media-url';
import type { HomepageCategory } from '@/types/homepage';

const categoryGradients = [
    'from-[#fce7e8] to-[#d9f3f0]',
    'from-[#fde8d8] to-[#d8f0f5]',
    'from-[#fce4ec] to-[#e0f2f1]',
    'from-[#fff0e6] to-[#e3f4f8]',
    'from-[#f8e8f0] to-[#dff5f0]',
    'from-[#fdeee8] to-[#daf1f4]',
];

function CategoryTile({
    category,
    gradient,
    badge,
}: {
    category: HomepageCategory;
    gradient: string;
    badge: 'hot' | 'top' | null;
}) {
    const [imageError, setImageError] = useState(false);
    const image = mediaUrl(category.image);

    return (
        <a
            href={`/categories/${category.slug}`}
            className="group flex min-w-0 flex-col bg-white px-1 py-2 sm:px-3 sm:py-4"
        >
            {/* The hover classes are moved here to isolate the animation to just the square image container */}
            <div
                className={`flex aspect-square items-center justify-center bg-gradient-to-b p-2 sm:p-3 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md ${gradient}`}
            >
                {image && !imageError ? (
                    <img
                        src={image}
                        alt={category.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                        className="max-h-[85%] max-w-[90%] object-contain"
                    />
                ) : (
                    <span className="text-2xl font-semibold text-slate-300">
                        {category.name.charAt(0)}
                    </span>
                )}
            </div>

            <p className="mt-2 line-clamp-2 text-center text-[10px] leading-snug font-bold text-slate-900 sm:mt-2.5 sm:text-xs md:text-sm">
                {category.name}
            </p>

            {badge && (
                <div className="mt-1.5 flex justify-center">
                    {badge === 'hot' ? (
                        <span className="rounded-sm bg-[#f5a623] px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                            Hot
                        </span>
                    ) : (
                        <span className="rounded-sm bg-[#e53935] px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                            Top Selling
                        </span>
                    )}
                </div>
            )}
        </a>
    );
}

function categoryBadge(
    category: HomepageCategory,
    index: number,
    topCategoryId: number | null,
): 'hot' | 'top' | null {
    if (topCategoryId !== null && category.id === topCategoryId) {
        return 'top';
    }

    if (index < 3 && (category.products_count ?? 0) > 0) {
        return 'hot';
    }

    return null;
}

export default function CategoryGrid({
    categories,
}: {
    categories: HomepageCategory[];
}) {
    if (categories.length === 0) {
        return null;
    }

    const topCategoryId = categories.reduce<HomepageCategory | null>(
        (top, category) => {
            const count = category.products_count ?? 0;
            const topCount = top?.products_count ?? 0;
            return count > topCount ? category : top;
        },
        null,
    )?.id ?? null;

    return (
        <section
            id="shop-categories"
            className="w-full scroll-mt-24 px-3 py-4 sm:scroll-mt-28 sm:px-4 sm:py-6 md:py-8"
        >
            <SectionHeading
                title="Shop by Category"
                description="Browse medical equipment by category"
            />

            {/* Added standard padding and removed internal grids */}
            <div className="w-full border border-[#e5e5e5] bg-white p-2 sm:p-4">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 md:gap-4 lg:grid-cols-9">
                    {categories.map((category, index) => (
                        <CategoryTile
                            key={category.id}
                            category={category}
                            gradient={
                                categoryGradients[index % categoryGradients.length]
                            }
                            badge={categoryBadge(category, index, topCategoryId)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
