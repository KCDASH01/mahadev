// resources/js/components/storefront/product-card.tsx
import { Link } from '@inertiajs/react';
import { GitCompare, Heart, ImageOff, Search } from 'lucide-react';
import { useState } from 'react';
import { mediaUrl } from '@/lib/media-url';
import { themeColors } from '@/lib/theme-colors';
import type { HomepageProduct } from '@/types/homepage';

type ProductCardProps = {
    product: HomepageProduct;
    badge?: 'new' | 'bestseller' | null;
};

function formatPrice(value: string): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function discountPercent(original: string, sale: string): number | null {
    const originalValue = Number(original);
    const saleValue = Number(sale);
    if (originalValue <= saleValue || originalValue <= 0) return null;
    return Math.round(((originalValue - saleValue) / originalValue) * 100);
}

export default function ProductCard({ product, badge = null }: ProductCardProps) {
    const [imageError, setImageError] = useState(false);
    const thumbnail = mediaUrl(product.thumbnail);
    const hasDiscount = Number(product.sale_price) < Number(product.original_price);
    const discount = discountPercent(product.original_price, product.sale_price);
    const showBestseller = badge === 'bestseller' || product.is_featured;
    const showNew = badge === 'new';

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <Link
                href={`/products/${product.slug}`}
                className="relative block aspect-square overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100"
            >
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
                    {discount && (
                        <span className="rounded-md bg-[#DC2626] px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
                            -{discount}%
                        </span>
                    )}
                    {showNew && (
                        <span className="rounded-md bg-[#0D9488] px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
                            New
                        </span>
                    )}
                    {showBestseller && !showNew && (
                        <span className="rounded-md bg-[#7C3AED] px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
                            Bestseller
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={(event) => event.preventDefault()}
                    className="absolute top-2.5 right-2.5 z-10 flex size-9 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-sm transition hover:text-rose-500"
                    aria-label={`Add ${product.name} to wishlist`}
                >
                    <Heart className="size-4" />
                </button>

                <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-5">
                    {thumbnail && !imageError ? (
                        <img
                            src={thumbnail}
                            alt={product.name}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={() => setImageError(true)}
                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <ImageOff className="size-10 text-slate-300" />
                    )}
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
                <Link href={`/products/${product.slug}`}>
                    <h3
                        className="line-clamp-2 min-h-9 text-xs leading-snug font-medium transition hover:text-[#2563EB] sm:min-h-10 sm:text-sm md:min-h-11 md:text-[15px]"
                        style={{ color: themeColors.secondary }}
                    >
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className="text-sm font-bold text-[#DC2626] sm:text-base md:text-lg">
                        {formatPrice(product.sale_price)}
                    </p>
                    {hasDiscount && (
                        <p className="text-xs text-slate-400 line-through sm:text-sm">
                            {formatPrice(product.original_price)}
                        </p>
                    )}
                </div>

                <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out sm:grid-rows-[0fr] sm:group-hover:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5 pt-2.5 sm:gap-2 sm:pt-3">
                            <button
                                type="button"
                                className="inline-flex min-w-0 flex-1 items-center justify-center rounded-lg px-2 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-3 sm:py-2.5 sm:text-sm"
                                style={{ backgroundColor: themeColors.secondary }}
                                aria-label={`Add ${product.name} to cart`}
                            >
                                Add to cart
                            </button>
                            <button
                                type="button"
                                className="hidden size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-800 sm:inline-flex sm:size-10"
                                aria-label={`Compare ${product.name}`}
                            >
                                <GitCompare className="size-4" />
                            </button>
                            <button
                                type="button"
                                className="hidden size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-800 sm:inline-flex sm:size-10"
                                aria-label={`Quick view ${product.name}`}
                            >
                                <Search className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
