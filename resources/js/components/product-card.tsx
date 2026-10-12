import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import {
    formatPrice,
    getDiscountPercentage,
    getProductHoverImage,
    type FashionProduct,
} from '@/data/fashion-products';
import { useWishlist } from '@/hooks/use-wishlist';
import { mediaUrl } from '@/lib/media-url';
import { productPath } from '@/lib/storefront-paths';

export function ProductCard({
    product,
    index = 0,
    showNewArrivalBadge = false,
    animate = true,
    compact = false,
}: {
    product: FashionProduct;
    index?: number;
    showNewArrivalBadge?: boolean;
    animate?: boolean;
    compact?: boolean;
}) {
    const { isWishlisted, toggleWishlist } = useWishlist();
    const wishlisted = isWishlisted(product.id);
    const discount = getDiscountPercentage(product.originalPrice, product.price);
    const productUrl = productPath(product.slug);
    const imageSrc = mediaUrl(product.image) ?? product.image;
    const hoverImage = getProductHoverImage(product);
    const hoverImageSrc = mediaUrl(hoverImage) ?? hoverImage;
    const hasHoverImage = hoverImageSrc !== imageSrc;

    const card = (
        <article className="group flex h-full w-full flex-col overflow-hidden bg-white">
            <div className="relative aspect-3/4 overflow-hidden bg-[#F5F1E8]">
                <Link href={productUrl} className="block h-full w-full">
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03] ${
                            hasHoverImage ? 'opacity-100 group-hover:opacity-0' : ''
                        }`}
                    />
                    {hasHoverImage && (
                        <img
                            src={hoverImageSrc}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
                        />
                    )}
                </Link>

                {showNewArrivalBadge ? (
                    <span
                        className={`absolute left-0 bg-[#062A4D] font-medium tracking-[0.14em] text-[#FCFAF5] uppercase ${
                            compact
                                ? 'top-2 px-2 py-0.5 text-[8px]'
                                : 'top-3 px-2.5 py-1 text-[10px]'
                        }`}
                    >
                        New Arrival
                    </span>
                ) : (
                    discount > 0 && (
                        <span
                            className={`absolute left-0 bg-[#062A4D] font-medium tracking-[0.14em] text-[#FCFAF5] uppercase ${
                                compact
                                    ? 'top-2 px-2 py-0.5 text-[8px]'
                                    : 'top-3 px-2.5 py-1 text-[10px]'
                            }`}
                        >
                            {discount}% OFF
                        </span>
                    )
                )}

                <button
                    type="button"
                    onClick={(event) => toggleWishlist(product.id, event)}
                    className={`absolute right-2.5 grid place-items-center bg-white/90 text-[#09233D] transition hover:text-[#062A4D] ${
                        compact ? 'top-2 h-7 w-7' : 'top-3 right-3 h-9 w-9'
                    } ${wishlisted ? 'text-[#062A4D]' : ''}`}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${wishlisted ? 'fill-current' : ''}`} strokeWidth={1.6} />
                </button>

                {(product.rating || product.reviews) && (
                    <div
                        className={`pointer-events-none absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-white/90 text-[#09233D] ${
                            compact ? 'px-1.5 py-0.5 text-[10px]' : 'bottom-3 left-3 px-2 py-1 text-xs'
                        }`}
                    >
                        <Star
                            className={`fill-[#062A4D] text-[#062A4D] ${
                                compact ? 'h-3 w-3' : 'h-3.5 w-3.5'
                            }`}
                        />
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-[#647487]">({product.reviews})</span>
                    </div>
                )}
            </div>

            <div className={`flex flex-col ${compact ? 'px-0.5 pt-2 pb-1' : 'px-0.5 pt-2.5 pb-1'}`}>
                <p
                    className={`font-medium tracking-[0.18em] text-[#647487] uppercase ${
                        compact ? 'text-[8px]' : 'text-[10px]'
                    }`}
                >
                    {product.category}
                </p>
                <Link
                    href={productUrl}
                    className={`mt-1 line-clamp-2 font-medium text-[#09233D] transition hover:text-[#062A4D] ${
                        compact ? 'text-xs leading-tight' : 'text-[15px] leading-tight'
                    }`}
                >
                    {product.name}
                </Link>
                <div className={`flex flex-wrap items-baseline gap-2 ${compact ? 'mt-0.5' : 'mt-1'}`}>
                    <span className={`font-medium text-[#09233D] ${compact ? 'text-sm' : 'text-base'}`}>
                        {formatPrice(product.price)}
                    </span>
                    {discount > 0 && (
                        <span className={`text-[#647487] line-through ${compact ? 'text-[10px]' : 'text-sm'}`}>
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );

    if (!animate) {
        return card;
    }

    return (
        <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
        >
            {card}
        </motion.div>
    );
}

export { ProductCard as HomeProductCard, ProductCard as FashionProductCard };
