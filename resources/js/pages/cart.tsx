import { Head, Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    Heart,
    Minus,
    Plus,
    ShoppingBag,
    Star,
    Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { CartAddressSection, type UserAddress } from '@/components/cart/cart-address-section';
import { CartOffersSection, type CartOffer } from '@/components/cart/cart-offers-section';
import { FashionProductCard } from '@/components/fashion/fashion-product-card';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { homeBrand } from '@/data/home-brand';
import {
    getProductSku,
    getRecommendedCartProducts,
    getStockMessage,
    type CartLineItem,
} from '@/data/cart-demo';
import { formatPrice, getDiscountPercentage, type FashionProduct } from '@/data/fashion-products';
import {
    addToCartCtaClass,
    checkoutCtaClass,
    continueShoppingCtaClass,
} from '@/lib/commerce-cta';
import { mediaUrl } from '@/lib/media-url';
import { displaySizeLabel } from '@/lib/size-label';
import { collectionCategoryPath, collectionPath, productPath } from '@/lib/storefront-paths';
import type { Auth } from '@/types/auth';

type CartTotals = {
    subtotal: number;
    productDiscount: number;
    couponDiscount: number;
    shipping: number;
    shippingLabel: string;
    taxAmount: number;
    taxLabel: string;
    grandTotal: number;
    totalSavings: number;
    itemCount: number;
    totalQuantity: number;
};

type AppliedCoupon = {
    id: number;
    code: string;
    title: string;
} | null;

function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5 text-[#F5D020]">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${rating >= star - 0.25 ? 'fill-current' : 'fill-none text-slate-300'}`}
                />
            ))}
        </div>
    );
}

function EmptyCartState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-lg py-16 text-center sm:py-24"
        >
            <div className="relative mx-auto grid h-32 w-32 place-items-center rounded-full border border-[#E8DDC5] bg-[#F5F1E8]">
                <ShoppingBag className="h-12 w-12 text-[#062A4D]" strokeWidth={1.2} />
            </div>
            <p className="mt-8 text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">Your Bag</p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#09233D]">Your Cart is Empty</h2>
            <HomeBrandMotif className="mt-4" />
            <p className="mt-4 text-sm leading-6 text-[#647487]">Looks like you haven&apos;t added anything yet.</p>
            <Link
                href="/"
                className={`mt-8 h-11 px-8 text-[11px] ${checkoutCtaClass}`}
            >
                Start Shopping
            </Link>
        </motion.div>
    );
}

function cartVariantDetails(item: CartLineItem): string | null {
    if (item.product.productType === 'jewellery') {
        return null;
    }

    const parts: string[] = [];

    if (item.size) {
        parts.push(`Size: ${displaySizeLabel(item.size)}`);
    }

    if (item.color) {
        parts.push(`Color: ${item.color}`);
    }

    return parts.length > 0 ? parts.join('  ·  ') : null;
}

function CartItemCard({
    item,
    onQuantityChange,
    onRemove,
    onSaveForLater,
    onMoveToWishlist,
}: {
    item: CartLineItem;
    onQuantityChange: (quantity: number) => void;
    onRemove: () => void;
    onSaveForLater: () => void;
    onMoveToWishlist: () => void;
}) {
    const { product, quantity, stock } = item;
    const discount = getDiscountPercentage(product.originalPrice, product.price);
    const stockMessage = getStockMessage(stock);
    const isLowStock = stockMessage.startsWith('Only');
    const imageSrc = mediaUrl(product.image) ?? product.image;
    const variantDetails = cartVariantDetails(item);
    const isJewellery = product.productType === 'jewellery';

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
            className="overflow-hidden border border-[#E8DDC5] bg-white transition hover:border-[#062A4D]/35 hover:shadow-[0_16px_32px_-20px_rgba(74,18,28,0.4)]"
        >
            <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-6">
                <Link
                    href={productPath(product.slug)}
                    className="relative mx-auto aspect-[4/5] w-full max-w-[132px] shrink-0 overflow-hidden bg-[#F5F1E8] sm:mx-0"
                >
                    <img src={imageSrc} alt={product.name} className="h-full w-full object-cover" />
                    {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-[#062A4D] px-2 py-1 text-[10px] font-medium tracking-wide text-[#FCFAF5] uppercase">
                            {discount}% OFF
                        </span>
                    )}
                </Link>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-medium tracking-[0.18em] text-[#062A4D] uppercase">
                                {product.category} · {homeBrand.name}
                            </p>
                            <Link
                                href={productPath(product.slug)}
                                className="mt-1 block font-serif text-lg font-medium tracking-tight text-[#09233D] transition hover:text-[#062A4D] sm:text-xl"
                            >
                                {product.name}
                            </Link>
                            {variantDetails && (
                                <p className="mt-2 text-sm text-[#647487]">{variantDetails}</p>
                            )}
                            {!isJewellery && (
                                <p className="mt-1 text-xs text-[#647487]/80">SKU: {getProductSku(product, item.size)}</p>
                            )}
                        </div>

                        <div className="text-right">
                            <div className="flex flex-wrap items-end justify-end gap-2">
                                <span className="text-xl font-semibold text-[#062A4D]">{formatPrice(product.price)}</span>
                                {discount > 0 && (
                                    <span className="pb-0.5 text-sm text-[#647487] line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>
                            {discount > 0 && (
                                <span className="mt-1 inline-block text-[11px] font-medium tracking-wide text-emerald-700 uppercase">
                                    {discount}% OFF
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <RatingStars rating={product.rating} />
                        <span className="text-sm font-semibold text-[#09233D]">{product.rating}</span>
                        <span className="text-xs text-[#647487]">({product.reviews} reviews)</span>
                        <span
                            className={`px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase ${
                                isLowStock ? 'bg-[#F5F1E8] text-[#062A4D]' : 'bg-emerald-50 text-emerald-700'
                            }`}
                        >
                            {stockMessage}
                        </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex h-10 items-center border border-[#E8DDC5] bg-white">
                            <button
                                type="button"
                                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                                className="grid h-full w-10 place-items-center text-[#09233D] transition hover:bg-[#F5F1E8] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Decrease quantity"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="grid h-full min-w-10 place-items-center text-sm font-semibold">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => onQuantityChange(quantity + 1)}
                                disabled={quantity >= stock}
                                className="grid h-full w-10 place-items-center text-[#09233D] transition hover:bg-[#F5F1E8] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Increase quantity"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={onMoveToWishlist}
                                className="inline-flex h-9 items-center gap-1.5 border border-[#E8DDC5] px-3 text-[11px] font-medium tracking-wide text-[#647487] uppercase transition hover:border-[#062A4D] hover:text-[#062A4D]"
                            >
                                <Heart className="h-3.5 w-3.5" />
                                Wishlist
                            </button>
                            <button
                                type="button"
                                onClick={onSaveForLater}
                                className="inline-flex h-9 items-center gap-1.5 border border-[#E8DDC5] px-3 text-[11px] font-medium tracking-wide text-[#647487] uppercase transition hover:border-[#062A4D] hover:text-[#062A4D]"
                            >
                                <Bookmark className="h-3.5 w-3.5" />
                                Save for Later
                            </button>
                            <button
                                type="button"
                                onClick={onRemove}
                                className="inline-flex h-9 items-center gap-1.5 border border-rose-200 px-3 text-[11px] font-medium tracking-wide text-rose-700 uppercase transition hover:bg-rose-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

function OrderSummaryCard({
    totals,
    checkoutProcessing,
    onProceedToCheckout,
    showActions = true,
}: {
    totals: CartTotals;
    checkoutProcessing: boolean;
    onProceedToCheckout: () => void;
    showActions?: boolean;
}) {
    return (
        <aside className="border border-[#E8DDC5] bg-white p-6">
            <p className="text-[11px] font-medium tracking-[0.22em] text-[#062A4D] uppercase">Checkout</p>
            <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight text-[#09233D]">Order Summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                    <dt className="text-[#647487]">Subtotal</dt>
                    <dd className="font-semibold text-[#09233D]">{formatPrice(totals.subtotal)}</dd>
                </div>
                {totals.couponDiscount > 0 && (
                    <div className="flex justify-between gap-4 text-emerald-700">
                        <dt>Coupon Discount</dt>
                        <dd className="font-semibold">-{formatPrice(totals.couponDiscount)}</dd>
                    </div>
                )}
                <div className="flex justify-between gap-4">
                    <dt className="text-[#647487]">Shipping</dt>
                    <dd className="font-semibold text-[#09233D]">{totals.shippingLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                    <dt className="text-[#647487]">GST</dt>
                    <dd className="font-semibold text-[#09233D]">{totals.taxLabel}</dd>
                </div>
            </dl>

            <div className="mt-5 border-t border-[#E8DDC5] pt-5">
                <div className="flex justify-between gap-4">
                    <span className="text-lg font-medium text-[#09233D]">Total</span>
                    <span className="text-2xl font-semibold text-[#062A4D]">{formatPrice(totals.grandTotal)}</span>
                </div>
                {totals.totalSavings > 0 && (
                    <p className="mt-3 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                        You saved {formatPrice(totals.totalSavings)} today
                    </p>
                )}
            </div>

            {showActions && (
                <div className="mt-6 grid gap-2">
                    <button
                        type="button"
                        disabled={checkoutProcessing}
                        onClick={onProceedToCheckout}
                        className={`h-11 text-[11px] ${checkoutCtaClass}`}
                    >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Proceed to Checkout
                    </button>
                    <Link
                        href="/"
                        className={`h-11 text-[11px] ${continueShoppingCtaClass}`}
                    >
                        Continue Shopping
                    </Link>
                </div>
            )}
        </aside>
    );
}

function CartMobileCheckoutBar({
    grandTotal,
    checkoutProcessing,
    onProceedToCheckout,
}: {
    grandTotal: number;
    checkoutProcessing: boolean;
    onProceedToCheckout: () => void;
}) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8DDC5] bg-[#FCFAF5]/95 p-3 shadow-[0_-8px_24px_rgba(74,18,28,0.08)] backdrop-blur-md xl:hidden">
            <div className="mx-auto flex max-w-lg items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium tracking-[0.18em] text-[#647487] uppercase">Total</p>
                    <p className="text-xl font-semibold text-[#062A4D]">{formatPrice(grandTotal)}</p>
                </div>
                <button
                    type="button"
                    disabled={checkoutProcessing}
                    onClick={onProceedToCheckout}
                    className={`h-11 shrink-0 px-5 text-[11px] ${checkoutCtaClass}`}
                >
                    <ShoppingBag className="h-4 w-4" />
                    Checkout
                </button>
            </div>
        </div>
    );
}

function RecommendedSlider({
    catalogProducts,
    productIds,
}: {
    catalogProducts: FashionProduct[];
    productIds: number[];
}) {
    const products = getRecommendedCartProducts(catalogProducts, productIds);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    };

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="border-t border-[#E8DDC5] bg-[#FCFAF5] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">Recommended</p>
                        <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl">
                            People Also Bought
                        </h2>
                        <HomeBrandMotif className="mx-0 mt-4" />
                    </div>
                    <div className="hidden gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            className="grid h-10 w-10 place-items-center border border-[#E8DDC5] bg-white text-[#09233D] transition hover:border-[#062A4D] hover:text-[#062A4D]"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            className="grid h-10 w-10 place-items-center border border-[#E8DDC5] bg-white text-[#09233D] transition hover:border-[#062A4D] hover:text-[#062A4D]"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {products.map((product, index) => (
                        <div key={product.id} className="w-[240px] shrink-0 snap-start sm:w-[260px]">
                            <FashionProductCard product={product} index={index} animate={false} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Cart({
    cartItems = [],
    cartTotals,
    availableOffers = [],
    appliedCoupon = null,
    addresses = [],
    selectedAddressId = null,
    catalogProducts = [],
    savedForLaterItems = [],
    estimatedDeliveryDate = null,
}: {
    cartItems?: CartLineItem[];
    cartTotals?: CartTotals;
    availableOffers?: CartOffer[];
    appliedCoupon?: AppliedCoupon;
    addresses?: UserAddress[];
    selectedAddressId?: number | null;
    catalogProducts?: FashionProduct[];
    savedForLaterItems?: CartLineItem[];
    estimatedDeliveryDate?: string | null;
}) {
    const { auth } = usePage().props as { auth?: Auth };
    const [checkoutProcessing, setCheckoutProcessing] = useState(false);

    const requireAuth = (): boolean => {
        if (!auth?.user) {
            router.visit('/login');
            return false;
        }

        return true;
    };

    const totals = cartTotals ?? {
        subtotal: 0,
        productDiscount: 0,
        couponDiscount: 0,
        shipping: 0,
        shippingLabel: 'FREE',
        taxAmount: 0,
        taxLabel: 'Included',
        grandTotal: 0,
        totalSavings: 0,
        itemCount: 0,
        totalQuantity: 0,
    };

    const cartProductIds = cartItems.map((item) => item.product.id);

    const breadcrumbProduct = cartItems[0]?.product;
    const isJewelleryBreadcrumb = breadcrumbProduct?.productType === 'jewellery';
    const breadcrumbGender = isJewelleryBreadcrumb ? 'Accessories' : (breadcrumbProduct?.gender ?? 'Men');
    const breadcrumbCategory = breadcrumbProduct?.category ?? 'Fashion';
    const collectionSlug = isJewelleryBreadcrumb
        ? 'jewellery'
        : breadcrumbGender === 'Men'
          ? 'men'
          : breadcrumbGender === 'Women'
            ? 'women'
            : breadcrumbGender === 'Kids'
              ? 'kids'
              : null;
    const genderHref = collectionSlug ? collectionPath(collectionSlug) : '/trending';
    const categoryHref = collectionSlug
        ? collectionCategoryPath(collectionSlug, breadcrumbCategory)
        : genderHref;

    const updateQuantity = (key: string, quantity: number) => {
        router.post(
            '/cart/items/update',
            { key, quantity },
            {
                preserveScroll: true,
            },
        );
    };

    const removeItem = (key: string) => {
        if (!requireAuth()) {
            return;
        }

        router.post(
            '/cart/items/remove',
            { key },
            {
                preserveScroll: true,
            },
        );
    };

    const saveForLater = (item: CartLineItem) => {
        if (!requireAuth()) {
            return;
        }

        router.post(
            '/cart/items/save-for-later',
            { key: item.key },
            {
                preserveScroll: true,
            },
        );
    };

    const moveToWishlist = (item: CartLineItem) => {
        if (!requireAuth()) {
            return;
        }

        router.post(
            '/cart/items/move-to-wishlist',
            { key: item.key },
            {
                preserveScroll: true,
            },
        );
    };

    const moveSavedToCart = (savedItemId: number) => {
        if (!requireAuth()) {
            return;
        }

        router.post(`/cart/saved-for-later/${savedItemId}/move-to-cart`, {}, { preserveScroll: true });
    };

    const proceedToCheckout = () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        if (addresses.length === 0 || !selectedAddressId) {
            toast.error('Please add and select a delivery address before checkout.');
            return;
        }

        setCheckoutProcessing(true);
        router.visit('/checkout?source=cart', {
            onFinish: () => setCheckoutProcessing(false),
        });
    };

    const isEmpty = cartItems.length === 0;

    return (
        <>
            <Head title={`Shopping Cart - ${homeBrand.name}`} />

            <div className={`min-h-screen bg-[#FCFAF5] font-sans text-[#09233D] antialiased ${!isEmpty ? 'pb-20 xl:pb-0' : ''}`}>
                <HomeHeader />

                <main className="pt-home-header">
                    <nav className="border-b border-[#E8DDC5] bg-white">
                        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wide text-[#647487] uppercase">
                                <Link href="/" className="transition hover:text-[#062A4D]">
                                    Home
                                </Link>
                                <span>/</span>
                                <Link href={genderHref} className="transition hover:text-[#062A4D]">
                                    {breadcrumbGender}
                                </Link>
                                <span>/</span>
                                <Link href={categoryHref} className="transition hover:text-[#062A4D]">
                                    {breadcrumbCategory}
                                </Link>
                                <span>/</span>
                                <span className="text-[#09233D]">Cart</span>
                            </div>
                            <Link
                                href="/"
                                className="inline-flex h-9 items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-[#062A4D] uppercase transition hover:text-[#041F3A]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </div>
                    </nav>

                    {isEmpty ? (
                        <section className="bg-[#FCFAF5] px-4 sm:px-6 lg:px-8">
                            <EmptyCartState />
                        </section>
                    ) : (
                        <>
                            <section className="px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:py-10 xl:pb-10">
                                <div className="mx-auto max-w-7xl">
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.45 }}
                                        className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">
                                                Your Bag
                                            </p>
                                            <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl">
                                                Shopping Cart
                                            </h1>
                                            <HomeBrandMotif className="mx-0 mt-4" />
                                            <p className="mt-3 text-sm text-[#647487]">
                                                {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} in your cart · {totals.totalQuantity} total pieces
                                            </p>
                                        </div>
                                        <div className="border border-[#E8DDC5] bg-white px-4 py-3 text-sm">
                                            <p className="text-[11px] font-medium tracking-[0.16em] text-[#062A4D] uppercase">Estimated Delivery</p>
                                            {estimatedDeliveryDate && (
                                                <p className="mt-1 text-[#09233D]">Delivery by {estimatedDeliveryDate}</p>
                                            )}
                                        </div>
                                    </motion.div>

                                    <div className="mt-8 grid gap-6 lg:gap-8 xl:grid-cols-[1fr_360px]">
                                        <div className="order-1 space-y-6 xl:col-start-1 xl:row-start-1">
                                            <AnimatePresence mode="popLayout">
                                                {cartItems.map((item) => (
                                                    <CartItemCard
                                                        key={item.key}
                                                        item={item}
                                                        onQuantityChange={(quantity) => updateQuantity(item.key, quantity)}
                                                        onRemove={() => removeItem(item.key)}
                                                        onSaveForLater={() => saveForLater(item)}
                                                        onMoveToWishlist={() => moveToWishlist(item)}
                                                    />
                                                ))}
                                            </AnimatePresence>

                                            {savedForLaterItems.length > 0 && (
                                                <div className="border border-dashed border-[#E8DDC5] bg-white p-5">
                                                    <h3 className="font-serif text-xl font-medium text-[#09233D]">
                                                        Saved for Later ({savedForLaterItems.length})
                                                    </h3>
                                                    <div className="mt-4 space-y-3">
                                                        {savedForLaterItems.map((item) => (
                                                            <div
                                                                key={item.savedItemId ?? item.key}
                                                                className="flex flex-col gap-3 border border-[#E8DDC5] bg-[#FCFAF5] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={mediaUrl(item.product.image) ?? item.product.image}
                                                                        alt={item.product.name}
                                                                        className="h-16 w-14 object-cover"
                                                                    />
                                                                    <div>
                                                                        <p className="font-serif font-medium text-[#09233D]">{item.product.name}</p>
                                                                        {cartVariantDetails(item) && (
                                                                            <p className="text-sm text-[#647487]">
                                                                                {cartVariantDetails(item)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (item.savedItemId) {
                                                                            moveSavedToCart(item.savedItemId);
                                                                        }
                                                                    }}
                                                                    className={`h-9 px-4 text-[11px] ${addToCartCtaClass}`}
                                                                >
                                                                    Move to Cart
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="order-2 xl:sticky top-below-home-header xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:self-start">
                                            <div className="xl:hidden">
                                                <OrderSummaryCard
                                                    totals={totals}
                                                    checkoutProcessing={checkoutProcessing}
                                                    onProceedToCheckout={proceedToCheckout}
                                                    showActions={false}
                                                />
                                            </div>
                                            <div className="hidden xl:block">
                                                <OrderSummaryCard
                                                    totals={totals}
                                                    checkoutProcessing={checkoutProcessing}
                                                    onProceedToCheckout={proceedToCheckout}
                                                />
                                            </div>
                                        </div>

                                        <div className="order-3 space-y-6 xl:col-start-1 xl:row-start-2">
                                            <CartOffersSection offers={availableOffers} appliedCoupon={appliedCoupon} />

                                            <CartAddressSection addresses={addresses} selectedAddressId={selectedAddressId} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <RecommendedSlider catalogProducts={catalogProducts} productIds={cartProductIds} />

                            <CartMobileCheckoutBar
                                grandTotal={totals.grandTotal}
                                checkoutProcessing={checkoutProcessing}
                                onProceedToCheckout={proceedToCheckout}
                            />
                        </>
                    )}
                </main>

                <HomeFooter />
            </div>
        </>
    );
}
