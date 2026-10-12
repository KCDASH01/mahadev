import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Copy,
    Heart,
    IndianRupee,
    Minus,
    Plus,
    ShoppingBag,
    Star,
    Tag,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { HomeFooter } from '@/components/home/home-footer';
import { FashionProductReviews } from '@/components/home/fashion-product-reviews';
import { HomeHeader } from '@/components/home/home-header';
import { FashionProductCard } from '@/components/fashion/fashion-product-card';
import { ProductImageGallery } from '@/components/storefront/product-detail/product-image-gallery';
import { ProductShareButton } from '@/components/storefront/product-detail/product-share-sheet';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { homeBrand } from '@/data/home-brand';
import { mediaUrl } from '@/lib/media-url';
import { displaySizeLabel } from '@/lib/size-label';
import { absoluteAssetUrl } from '@/lib/share-url';
import { collectionCategoryPath, collectionPath, productPath } from '@/lib/storefront-paths';
import {
    clearBuyNowPending,
    saveBuyNowPending,
} from '@/lib/buy-now-pending';
import {
    clearCartPending,
    saveCartPending,
} from '@/lib/cart-pending';
import {
    addToCartCtaClass,
    buyNowCtaClass,
    selectedColorSwatchClass,
    selectedSizeClass,
    viewCartCtaClass,
} from '@/lib/commerce-cta';
import { useWishlist } from '@/hooks/use-wishlist';
import {
    formatPrice,
    getColorVariantGallery,
    getDiscountPercentage,
    getProductColorVariants,
    resolveColorHex,
    resolveColorStyle,
    type FashionProduct,
    type ProductOffer,
} from '@/data/fashion-products';
import type { Auth } from '@/types/auth';
import type { ProductReview, RatingSummary } from '@/types/product';
import {
    findProductVariantOption,
    getAvailableColorsForSize,
    getAvailableSizesForColor,
    getCartItemQuantity,
    makeCartItemKey,
    normalizeVariantValue,
    type CartSummary,
} from '@/types/cart';

type ProductDetailsProps = {
    product: FashionProduct;
    relatedProducts: FashionProduct[];
    reviews?: ProductReview[];
    ratingSummary?: RatingSummary;
    userReview?: ProductReview | null;
};

function OfferCard({ deal }: { deal: ProductOffer }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Tag className="h-4 w-4 text-[#062A4D]" />
                {deal.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">{deal.detail}</p>
            <p className="mt-2 text-[11px] text-slate-500">Apply coupon at checkout</p>
            <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs font-bold tracking-wide text-[#062A4D] uppercase">
                    Code: {deal.code}
                </span>
                {deal.code && (
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 transition hover:text-[#062A4D]"
                        onClick={() => navigator.clipboard?.writeText(deal.code)}
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ProductDetails({
    product,
    relatedProducts,
    reviews = [],
    ratingSummary = { average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    userReview = null,
}: ProductDetailsProps) {
    const { cart, auth, appUrl } = usePage().props as {
        cart: CartSummary;
        auth?: Auth;
        appUrl?: string;
    };
    const offers = product.offers ?? [];
    const colorVariants = useMemo(() => {
        if (product.productType === 'jewellery') {
            return [];
        }

        const colors = getProductColorVariants(product);

        if (!product.variantOptions?.length) {
            return colors;
        }

        const variantColors = new Set(
            product.variantOptions
                .map((option) => normalizeVariantValue(option.color))
                .filter(Boolean),
        );

        const matched = colors.filter((color) =>
            variantColors.has(normalizeVariantValue(color.name)),
        );

        return matched.length > 0 ? matched : colors;
    }, [product]);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');
    const { isWishlisted, toggleWishlist } = useWishlist();
    const wishlisted = isWishlisted(product.id);
    const [showAllOffers, setShowAllOffers] = useState(false);
    const [showProductDetails, setShowProductDetails] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);
    const [updatingQuantity, setUpdatingQuantity] = useState(false);

    const selectedColor = colorVariants[selectedColorIndex] ?? colorVariants[0];
    const availableSizes = useMemo(() => {
        const sizesForColor = getAvailableSizesForColor(
            product.variantOptions,
            selectedColor?.name,
        );

        return sizesForColor.length > 0 ? sizesForColor : product.sizes;
    }, [product.variantOptions, product.sizes, selectedColor?.name]);
    const availableColorsForSelectedSize = useMemo(() => {
        return getAvailableColorsForSize(product.variantOptions, selectedSize);
    }, [product.variantOptions, selectedSize]);

    const selectedVariant = useMemo(
        () =>
            findProductVariantOption(
                product.variantOptions,
                selectedColor?.name,
                selectedSize,
            ),
        [product.variantOptions, selectedColor?.name, selectedSize],
    );
    const displayPrice = selectedVariant?.salePrice ?? product.price;
    const displayOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
    const discount = getDiscountPercentage(displayOriginalPrice, displayPrice);
    const hasVariantOptions = (product.variantOptions?.length ?? 0) > 0;
    const isJewellery = product.productType === 'jewellery';
    const showSizeSelector = !isJewellery && hasVariantOptions && product.sizes.length > 0;
    const showColorSelector = !isJewellery && hasVariantOptions && colorVariants.length > 0;
    const canPurchase = hasVariantOptions
        ? Boolean(selectedVariant && selectedVariant.stock > 0)
        : isJewellery
          ? (product.stock ?? 0) > 0
          : true;
    const currentCartKey = useMemo(
        () => makeCartItemKey(product.id, selectedVariant?.id),
        [product.id, selectedVariant?.id],
    );
    const cartQuantity = getCartItemQuantity(cart, currentCartKey);
    const inCart = cartQuantity > 0;
    const maxStock = selectedVariant?.stock ?? product.stock ?? 99;
    const galleryImages = useMemo(() => {
        if (!hasVariantOptions || !selectedColor) {
            return product.gallery?.length ? product.gallery : [product.image];
        }

        return getColorVariantGallery(product, selectedColor);
    }, [product, selectedColor, hasVariantOptions]);

    const canonicalUrl = appUrl
        ? `${appUrl.replace(/\/$/, '')}${productPath(product.slug)}`
        : null;
    const ogImage = absoluteAssetUrl(mediaUrl(product.image) ?? product.image, appUrl);

    useEffect(() => {
        setSelectedColorIndex(0);

        const firstColor = getProductColorVariants(product)[0]?.name;
        const sizesForColor = getAvailableSizesForColor(product.variantOptions, firstColor);

        setSelectedSize(sizesForColor[0] ?? product.sizes[0] ?? '');
        setShowAllOffers(false);
        setShowProductDetails(false);
    }, [product]);

    const collectionSlug = isJewellery
        ? 'jewellery'
        : product.gender === 'Men'
          ? 'men'
          : product.gender === 'Women'
            ? 'women'
            : product.gender === 'Kids'
              ? 'kids'
              : null;
    const genderPath = collectionSlug ? collectionPath(collectionSlug) : '/trending';
    const categoryHref = collectionSlug
        ? collectionCategoryPath(collectionSlug, product.category)
        : genderPath;

    const selectColor = (index: number) => {
        setSelectedColorIndex(index);

        const color = colorVariants[index]?.name;
        const sizesForColor = getAvailableSizesForColor(product.variantOptions, color);

        if (sizesForColor.length > 0) {
            const currentSizeIsAvailable = sizesForColor.some(
                (size) => normalizeVariantValue(size) === normalizeVariantValue(selectedSize),
            );

            if (!currentSizeIsAvailable) {
                setSelectedSize(sizesForColor[0]);
            }
        }
    };

    const selectSize = (size: string) => {
        setSelectedSize(size);

        if (!hasVariantOptions) {
            return;
        }

        const sizesForCurrentColor = getAvailableSizesForColor(
            product.variantOptions,
            selectedColor?.name,
        );

        const currentColorHasSize = sizesForCurrentColor.some(
            (s) => normalizeVariantValue(s) === normalizeVariantValue(size),
        );

        if (!currentColorHasSize) {
            const colorsForNewSize = getAvailableColorsForSize(
                product.variantOptions,
                size,
            );

            if (colorsForNewSize.length > 0) {
                const newColorName = colorsForNewSize[0];
                const newColorIndex = colorVariants.findIndex(
                    (c) => normalizeVariantValue(c.name) === normalizeVariantValue(newColorName),
                );

                if (newColorIndex !== -1) {
                    setSelectedColorIndex(newColorIndex);
                }
            }
        }
    };

    const redirectToLogin = () => {
        router.visit('/login');
    };

    const handleAddToCart = () => {
        const payload = {
            product_id: product.id,
            variant_id: selectedVariant?.id ?? null,
            color: showColorSelector ? selectedColor?.name ?? null : null,
            size: showSizeSelector ? selectedSize : null,
            quantity: 1,
        };

        saveCartPending(payload);
        setAddingToCart(true);

        router.post('/cart/intent', payload, {
            preserveScroll: true,
            onSuccess: () => clearCartPending(),
            onFinish: () => setAddingToCart(false),
            onError: () => setAddingToCart(false),
        });
    };

    const handleBuyNow = () => {
        const payload = {
            product_id: product.id,
            variant_id: selectedVariant?.id ?? null,
            color: showColorSelector ? selectedColor?.name ?? null : null,
            size: showSizeSelector ? selectedSize : null,
            quantity: 1,
        };

        saveBuyNowPending(payload);
        setBuyingNow(true);

        router.post('/buy-now', payload, {
            preserveScroll: true,
            onSuccess: () => clearBuyNowPending(),
            onFinish: () => setBuyingNow(false),
            onError: () => setBuyingNow(false),
        });
    };

    const updateCartQuantity = (quantity: number) => {
        if (!auth?.user) {
            redirectToLogin();

            return;
        }

        setUpdatingQuantity(true);

        router.post(
            '/cart/items/update',
            {
                key: currentCartKey,
                quantity,
            },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingQuantity(false),
            },
        );
    };

    return (
        <>
            <Head title={`${product.name} - ${homeBrand.name}`}>
                <meta
                    head-key="description"
                    name="description"
                    content={product.short_description || `Shop ${product.name} at ${homeBrand.name}`}
                />
                <meta head-key="og:type" property="og:type" content="product" />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content={`${product.name} | ${homeBrand.name}`}
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={product.short_description || `Shop ${product.name} at ${homeBrand.name}`}
                />
                {canonicalUrl && (
                    <meta head-key="og:url" property="og:url" content={canonicalUrl} />
                )}
                {ogImage && (
                    <meta head-key="og:image" property="og:image" content={ogImage} />
                )}
                <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content={`${product.name} | ${homeBrand.name}`}
                />
            </Head>

            <div className="min-h-screen bg-white font-sans text-[#1A1A2E] antialiased">
                <HomeHeader />

                <main className="pt-home-header">
                    <nav className="border-b border-slate-100 bg-white">
                        <div className="mx-auto flex max-w-[1720px] flex-wrap items-center gap-2 px-6 py-3 text-[11px] font-medium tracking-wide text-slate-500 uppercase sm:px-10 lg:px-14 xl:px-16">
                            <Link href="/" className="transition hover:text-[#062A4D]">
                                Home
                            </Link>
                            <span>/</span>
                            <Link href={genderPath} className="transition hover:text-[#062A4D]">
                                {isJewellery ? 'Accessories' : `${product.gender}'s Clothing`}
                            </Link>
                            <span>/</span>
                            <Link href={categoryHref} className="transition hover:text-[#062A4D]">
                                {product.category}
                            </Link>
                            <span>/</span>
                            <span className="text-slate-800">{product.name}</span>
                        </div>
                    </nav>

                    <section className="mx-auto max-w-[1720px] px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,420px)] lg:items-start lg:gap-10 xl:gap-14">
                            <ProductImageGallery
                                key={`${product.id}-${selectedColor?.name ?? 'default'}`}
                                images={galleryImages}
                                productName={product.name}
                            />

                            <div className="lg:sticky top-below-home-header lg:self-start">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Star className="h-4 w-4 fill-[#F5D020] text-[#F5D020]" />
                                            <span className="font-semibold">
                                                {ratingSummary.total > 0
                                                    ? ratingSummary.average.toFixed(1)
                                                    : product.rating.toFixed(1)}
                                            </span>
                                            <a
                                                href="#reviews"
                                                className="text-slate-400 transition hover:text-[#062A4D]"
                                            >
                                                {ratingSummary.total > 0
                                                    ? ratingSummary.total
                                                    : product.reviews}{' '}
                                                review
                                                {(ratingSummary.total > 0
                                                    ? ratingSummary.total
                                                    : product.reviews) === 1
                                                    ? ''
                                                    : 's'}
                                            </a>
                                        </div>

                                        <h1 className="mt-3 text-2xl leading-tight font-semibold text-neutral-900 sm:text-[1.75rem]">
                                            {product.name}
                                        </h1>
                                        {product.short_description && (
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {product.short_description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <ProductShareButton product={product} />
                                        <button
                                            type="button"
                                            onClick={() => toggleWishlist(product.id)}
                                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-white shadow-sm transition ${
                                                wishlisted
                                                    ? 'border-[#062A4D] text-[#062A4D]'
                                                    : 'border-slate-200 text-neutral-800 hover:border-neutral-400'
                                            }`}
                                            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                        >
                                            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <span className="inline-flex items-center text-3xl font-bold text-neutral-900">
                                        <IndianRupee className="h-6 w-6" strokeWidth={2.5} />
                                        {displayPrice.toLocaleString('en-IN', {
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                    {displayOriginalPrice > displayPrice && (
                                        <span className="text-lg text-slate-400 line-through">
                                            {formatPrice(displayOriginalPrice)}
                                        </span>
                                    )}
                                    {discount > 0 && (
                                        <span className="text-sm font-bold text-emerald-600">{discount}% off</span>
                                    )}
                                </div>
                                <p className={`mt-2 text-sm font-medium ${canPurchase ? 'text-emerald-700' : 'text-red-600'}`}>
                                    {canPurchase ? 'In stock' : 'Out of stock'}
                                </p>

                                {offers.length > 0 && (
                                    <div className="mt-5 grid gap-3">
                                        <OfferCard deal={offers[0]} />
                                        {showAllOffers &&
                                            offers.slice(1).map((deal) => (
                                                <OfferCard key={`${deal.code}-${deal.title}`} deal={deal} />
                                            ))}
                                        {offers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAllOffers((current) => !current)}
                                                className="text-sm font-semibold text-[#062A4D] underline-offset-2 transition hover:underline"
                                            >
                                                {showAllOffers ? 'Show less' : 'See all'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {showColorSelector && selectedColor && (
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-bold text-neutral-900">
                                                Color:{' '}
                                                <span className="font-semibold text-[#062A4D]">
                                                    {selectedColor.name}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2.5">
                                            {colorVariants.map((variant, index) => {
                                                const hex = resolveColorHex(variant.name, variant.hex);
                                                const isLightSwatch = ['#FFFFFF', '#FFFDD0', '#F5D020', '#D4C4A8', '#C3B091'].includes(hex);
                                                const isAvailableForSelectedSize =
                                                    !hasVariantOptions ||
                                                    availableColorsForSelectedSize.some(
                                                        (c) => normalizeVariantValue(c) === normalizeVariantValue(variant.name),
                                                    );
                                                const swatchStyle = resolveColorStyle(variant.name, variant.hex, variant.type);

                                                return (
                                                    <button
                                                        key={`${variant.name}-${index}`}
                                                        type="button"
                                                        onClick={() => selectColor(index)}
                                                        className={`relative h-10 w-10 shrink-0 rounded-full border-2 transition ${
                                                            selectedColorIndex === index
                                                                ? selectedColorSwatchClass
                                                                : isLightSwatch
                                                                  ? 'border-slate-300 hover:border-[#062A4D]/60'
                                                                  : 'border-white shadow-sm hover:border-[#062A4D]/40'
                                                        } ${!isAvailableForSelectedSize && selectedColorIndex !== index ? 'opacity-40' : ''}`}
                                                        style={swatchStyle}
                                                        aria-label={`Select ${variant.name}`}
                                                        aria-pressed={selectedColorIndex === index}
                                                        title={
                                                            isAvailableForSelectedSize
                                                                ? variant.name
                                                                : `${variant.name} (click to view size options)`
                                                        }
                                                    >
                                                        {!isAvailableForSelectedSize && selectedColorIndex !== index && (
                                                            <span className="absolute inset-0 flex items-center justify-center">
                                                                <span className="h-0.5 w-6 rotate-45 bg-slate-400/80" />
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {showSizeSelector && (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-bold text-neutral-900 uppercase">
                                            Select Size:{' '}
                                            <span className="font-semibold text-[#062A4D]">{displaySizeLabel(selectedSize)}</span>
                                        </p>
                                        <button type="button" className="text-xs font-semibold text-[#062A4D] underline">
                                            Size Chart
                                        </button>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {product.sizes.map((size) => {
                                            const isAvailableForCurrentColor =
                                                !hasVariantOptions ||
                                                availableSizes.some(
                                                    (availableSize) =>
                                                        normalizeVariantValue(availableSize) === normalizeVariantValue(size),
                                                );

                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => selectSize(size)}
                                                    className={`grid h-11 min-w-11 place-items-center rounded-sm border px-3 text-sm font-semibold transition ${
                                                        selectedSize === size
                                                            ? selectedSizeClass
                                                            : isAvailableForCurrentColor
                                                              ? 'border-slate-300 bg-white text-neutral-900 hover:border-[#062A4D]'
                                                              : 'border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:border-[#062A4D]'
                                                    }`}
                                                    title={
                                                        isAvailableForCurrentColor
                                                            ? `Select size ${displaySizeLabel(size)}`
                                                            : `Size ${displaySizeLabel(size)} (click to select)`
                                                    }
                                                >
                                                    {displaySizeLabel(size)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                )}

                                {inCart && (
                                    <div className="mt-6">
                                        <p className="mb-3 text-sm font-bold text-neutral-900 uppercase">Quantity</p>
                                        <div className="inline-flex h-10 items-center rounded-sm border border-slate-200 bg-white">
                                            <button
                                                type="button"
                                                onClick={() => updateCartQuantity(cartQuantity - 1)}
                                                disabled={updatingQuantity || cartQuantity <= 1}
                                                className="grid h-full w-10 place-items-center transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="grid h-full min-w-10 place-items-center text-sm font-bold">
                                                {cartQuantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateCartQuantity(cartQuantity + 1)}
                                                disabled={updatingQuantity || cartQuantity >= maxStock}
                                                className="grid h-full w-10 place-items-center transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className={`flex gap-2 ${inCart ? 'mt-4' : 'mt-6'}`}>
                                    {inCart ? (
                                        <button
                                            type="button"
                                            onClick={() => router.visit('/cart')}
                                            className={`h-10 flex-1 text-xs ${viewCartCtaClass}`}
                                        >
                                            <ShoppingBag className="h-3.5 w-3.5" />
                                            View Cart
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            disabled={addingToCart || !canPurchase}
                                            className={`h-10 flex-1 text-xs ${addToCartCtaClass} disabled:opacity-70`}
                                        >
                                            <ShoppingBag className="h-3.5 w-3.5" />
                                            {addingToCart ? 'Adding...' : 'Add to Cart'}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleBuyNow}
                                        disabled={buyingNow || !canPurchase}
                                        className={`h-10 flex-1 text-xs ${buyNowCtaClass} disabled:opacity-70`}
                                    >
                                        {buyingNow ? 'Please wait...' : 'Buy Now'}
                                    </button>
                                </div>

                                <Collapsible
                                    open={showProductDetails}
                                    onOpenChange={setShowProductDetails}
                                    className="mt-8 border-t border-slate-100 pt-6"
                                >
                                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 text-left">
                                        <span className="text-sm font-bold text-neutral-900 uppercase">
                                            Product Details
                                        </span>
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 text-neutral-700 transition-transform duration-300 ease-in-out ${
                                                showProductDetails ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent
                                        forceMount
                                        className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100"
                                    >
                                        <div className="min-h-0">
                                            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
                                                {product.fit && !isJewellery && (
                                                    <li>
                                                        <span className="font-semibold text-neutral-800">Fit:</span>{' '}
                                                        {product.fit}
                                                    </li>
                                                )}
                                                {selectedColor && !isJewellery && (
                                                    <li>
                                                        <span className="font-semibold text-neutral-800">Color:</span>{' '}
                                                        {selectedColor.name}
                                                    </li>
                                                )}
                                                {product.details.map((detail) => (
                                                    <li key={detail}>{detail}</li>
                                                ))}
                                                {product.careInstructions && (
                                                    <li>
                                                        <span className="font-semibold text-neutral-800">Care:</span>{' '}
                                                        {product.careInstructions}
                                                    </li>
                                                )}
                                            </ul>
                                            {product.description && (
                                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                                    {product.description}
                                                </p>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        </div>
                    </section>

                    <FashionProductReviews
                        productSlug={product.slug}
                        reviews={reviews}
                        ratingSummary={ratingSummary}
                        userReview={userReview}
                        displayRating={product.rating}
                        displayReviewCount={product.reviews}
                    />

                    {relatedProducts.length > 0 && (
                        <section className="border-t border-slate-100 bg-white px-6 py-12 sm:px-10 lg:px-14 xl:px-16 lg:py-16">
                            <div className="mx-auto max-w-[1720px]">
                                <h2 className="text-center text-lg font-bold tracking-[0.12em] text-neutral-900 uppercase sm:text-xl">
                                    Similar Products
                                </h2>
                                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
                                    {relatedProducts.map((item, index) => (
                                        <FashionProductCard key={item.id} product={item} index={index} animate={false} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <HomeFooter />
            </div>
        </>
    );
}
