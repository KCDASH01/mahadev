import { Heart, ShoppingCart, Star } from 'lucide-react';
import { mediaUrl } from '@/lib/media-url';
import { themeColors } from '@/lib/theme-colors';
import type { RelatedProduct } from '@/types/product';

function formatPrice(value: string): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

export default function RelatedProductsSection({
    products,
}: {
    products: RelatedProduct[];
}) {
    if (products.length === 0) return null;

    return (
        <section className="mt-10 sm:mt-12">
            <h2
                className="text-xl font-bold sm:text-2xl"
                style={{ color: themeColors.secondary }}
            >
                Related Products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                You may also like these items from the same category
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {products.map((product) => {
                    const thumbnail = mediaUrl(product.thumbnail);

                    return (
                        <article
                            key={product.id}
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <a href={`/products/${product.slug}`} className="block">
                                <div className="relative aspect-square bg-gradient-to-br from-rose-50 to-pink-50 p-3">
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"
                                        aria-label="Add to wishlist"
                                        onClick={(event) => event.preventDefault()}
                                    >
                                        <Heart className="size-4" />
                                    </button>
                                    {thumbnail ? (
                                        <img
                                            src={thumbnail}
                                            alt={product.name}
                                            referrerPolicy="no-referrer"
                                            className="h-full w-full object-contain transition group-hover:scale-105"
                                        />
                                    ) : null}
                                </div>
                                <div className="p-3">
                                    <h3 className="line-clamp-2 min-h-10 text-xs font-semibold leading-snug text-slate-900 sm:text-sm">
                                        {product.name}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-1 text-amber-400">
                                        <Star className="size-3.5 fill-amber-400" />
                                        <span className="text-xs font-medium text-slate-700">
                                            {product.rating}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            ({product.review_count})
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-baseline gap-2">
                                        <span className="text-sm font-bold text-[#EF4444]">
                                            {formatPrice(product.sale_price)}
                                        </span>
                                        <span className="text-xs text-slate-400 line-through">
                                            {formatPrice(product.original_price)}
                                        </span>
                                    </div>
                                </div>
                            </a>
                            <div className="px-3 pb-3">
                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-white sm:text-sm"
                                    style={{ backgroundColor: themeColors.secondary }}
                                >
                                    <ShoppingCart className="size-4" />
                                    Add To Cart
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
