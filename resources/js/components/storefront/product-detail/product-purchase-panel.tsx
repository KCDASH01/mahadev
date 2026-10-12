import {
    Heart,
    Minus,
    Plus,
    Share2,
    ShieldCheck,
    ShoppingCart,
    Star,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
import { ProductShareSheet } from '@/components/storefront/product-detail/product-share-sheet';
import { addToCartCtaClass, buyNowCtaClass, selectedSizeClass } from '@/lib/commerce-cta';
import { displaySizeLabel } from '@/lib/size-label';
import { themeColors } from '@/lib/theme-colors';
import type { ProductDetail } from '@/types/product';
import type { useProductSelection } from '@/hooks/use-product-selection';

function formatPrice(value: string): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

type SelectionState = ReturnType<typeof useProductSelection>;

export default function ProductPurchasePanel({
    product,
    selection,
    ratingAverage,
    ratingTotal,
    onAddToCart,
    onBuyNow,
}: {
    product: ProductDetail;
    selection: SelectionState;
    ratingAverage: number;
    ratingTotal: number;
    onAddToCart: () => void;
    onBuyNow: () => void;
}) {
    const [shareOpen, setShareOpen] = useState(false);
    const {
        quantity,
        selections,
        pricing,
        inStock,
        needsVariantSelection,
        selectVariant,
        increment,
        decrement,
    } = selection;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h1
                className="text-xl font-bold leading-tight sm:text-2xl lg:text-3xl"
                style={{ color: themeColors.secondary }}
            >
                {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                {product.brand && (
                    <span>
                        Brand:{' '}
                        <a
                            href={`/brands/${product.brand.slug}`}
                            className="font-semibold text-[#2563EB] hover:underline"
                        >
                            {product.brand.name}
                        </a>
                    </span>
                )}
                <span>
                    SKU: <span className="font-medium text-slate-800">{pricing.sku}</span>
                </span>
                {product.category && (
                    <span>
                        Category:{' '}
                        <a
                            href={`/categories/${product.category.slug}`}
                            className="font-semibold text-[#2563EB] hover:underline"
                        >
                            {product.category.name}
                        </a>
                    </span>
                )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {inStock ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#10B981]">
                        <span className="size-2 rounded-full bg-[#10B981]" />
                        In Stock
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#EF4444]">
                        <span className="size-2 rounded-full bg-[#EF4444]" />
                        {needsVariantSelection ? 'Select options' : 'Out of Stock'}
                    </span>
                )}
            </div>

            <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                            key={index}
                            className={`size-4 ${
                                index < Math.round(ratingAverage)
                                    ? 'fill-amber-400'
                                    : 'text-slate-200'
                            }`}
                        />
                    ))}
                </div>
                <span className="text-sm font-semibold text-slate-800">
                    {ratingAverage.toFixed(1)}
                </span>
                <span className="text-sm text-slate-500">
                    ({ratingTotal} Reviews)
                </span>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3">
                <div>
                    <p className="text-xs text-slate-500">MRP</p>
                    <p className="text-sm text-slate-400 line-through">
                        {formatPrice(pricing.original_price)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Offer Price</p>
                    <p className="text-2xl font-bold text-[#EF4444] sm:text-3xl">
                        {formatPrice(pricing.sale_price)}
                    </p>
                </div>
                {pricing.discount && (
                    <span className="rounded-full bg-[#0F172A] px-3 py-1 text-xs font-bold text-white">
                        {pricing.discount}% OFF
                    </span>
                )}
            </div>

            {product.has_variants && product.variant_groups.length > 0 && (
                <div className="mt-6 space-y-4">
                    {product.variant_groups.map((group) => (
                        <div key={group.name}>
                            <p className="mb-2 text-sm font-semibold text-slate-800">
                                {group.name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {group.options.map((option) => {
                                    const isSelected =
                                        selections[group.name] === option.id;
                                    const outOfStock = option.stock <= 0;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            disabled={outOfStock}
                                            onClick={() =>
                                                selectVariant(group.name, option.id)
                                            }
                                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                                isSelected
                                                    ? selectedSizeClass
                                                    : 'border-slate-200 bg-white text-slate-700 hover:border-[#FF6A00]'
                                            } ${outOfStock ? 'cursor-not-allowed opacity-40' : ''}`}
                                        >
                                            {group.name.toLowerCase() === 'size'
                                                ? displaySizeLabel(option.value)
                                                : option.value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-slate-800">Quantity</p>
                <div className="inline-flex items-center rounded-xl border border-slate-200">
                    <button
                        type="button"
                        onClick={decrement}
                        className="flex size-10 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="size-4" />
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold">
                        {quantity}
                    </span>
                    <button
                        type="button"
                        onClick={increment}
                        disabled={quantity >= pricing.stock}
                        className="flex size-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                        aria-label="Increase quantity"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
            </div>

            <div className="mt-6 hidden flex-col gap-3 sm:flex sm:flex-row">
                <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={!inStock}
                    className={`flex-1 rounded-xl px-5 py-3 text-sm ${addToCartCtaClass}`}
                >
                    <ShoppingCart className="size-4" />
                    Add To Cart
                </button>
                <button
                    type="button"
                    onClick={onBuyNow}
                    disabled={!inStock}
                    className={`flex-1 rounded-xl px-5 py-3 text-sm ${buyNowCtaClass}`}
                >
                    Buy Now
                </button>
            </div>

            <div className="mt-4 hidden flex-wrap gap-4 sm:flex">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#2563EB]"
                >
                    <Heart className="size-4" />
                    Add To Wishlist
                </button>
                <button
                    type="button"
                    onClick={() => setShareOpen(true)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#2563EB]"
                >
                    <Share2 className="size-4" />
                    Share Product
                </button>
            </div>

            <ProductShareSheet
                product={{
                    name: product.name,
                    image: product.thumbnail ?? product.images[0] ?? '',
                    price: Number(pricing.sale_price ?? product.sale_price),
                    short_description: product.short_description,
                    category: product.category?.name,
                }}
                open={shareOpen}
                onOpenChange={setShareOpen}
            />

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { icon: ShieldCheck, label: '100% Genuine Product' },
                    { icon: ShieldCheck, label: 'Secure Payment' },
                    { icon: Truck, label: 'Fast Delivery' },
                    { icon: ShieldCheck, label: 'Warranty Support' },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-center"
                    >
                        <item.icon className="mx-auto size-5 text-[#2563EB]" />
                        <p className="mt-2 text-[11px] font-medium leading-snug text-slate-700">
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
