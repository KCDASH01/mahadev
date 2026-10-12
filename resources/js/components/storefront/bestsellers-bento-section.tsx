// resources/js/components/storefront/bestsellers-bento-section.tsx
import { useRef, useState } from 'react';
import { mediaUrl } from '@/lib/media-url';
import { themeColors } from '@/lib/theme-colors';
import type { HomepageProduct } from '@/types/homepage';

type ColumnSlot =
    | { type: 'product'; product: HomepageProduct; grow: number }
    | { type: 'promo'; title: string; subtitle: string; grow: number };

function formatPrice(value: string): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function buildColumns(products: HomepageProduct[]): ColumnSlot[][] {
    const p = products;
    if (p.length < 7) {
        return [];
    }

    return [
        [
            { type: 'product', product: p[0], grow: 1 },
            { type: 'product', product: p[4], grow: 1 },
        ],
        [
            { type: 'product', product: p[1], grow: 1.15 },
            {
                type: 'promo',
                title: 'OUR PRIORITY',
                subtitle: 'Quality-assured solutions for home care and beyond.',
                grow: 0.85,
            },
        ],
        [
            { type: 'product', product: p[2], grow: 1 },
            { type: 'product', product: p[5], grow: 1 },
        ],
        [{ type: 'product', product: p[3], grow: 1 }],
        [
            {
                type: 'promo',
                title: 'SHOP SMART',
                subtitle: 'Your one-stop destination for reliable healthcare essentials.',
                grow: 0.9,
            },
            { type: 'product', product: p[6], grow: 1.1 },
        ],
    ];
}

function ProductDetailCard({ product }: { product: HomepageProduct }) {
    const thumbnail = mediaUrl(product.thumbnail);
    const hasDiscount = Number(product.sale_price) < Number(product.original_price);
    const description =
        product.short_description ??
        'Reliable medical equipment for home and clinical use with manufacturer warranty.';

    return (
        <div className="w-52 rounded-xl border border-slate-100 bg-white p-3 shadow-2xl sm:w-56">
            <div className="flex h-24 items-center justify-center rounded-lg bg-slate-50 p-2">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <span className="text-xs text-slate-400">No image</span>
                )}
            </div>
            <h4 className="mt-2 text-center text-xs font-semibold leading-snug text-slate-900">
                {product.name}
            </h4>
            <div className="mt-1.5 flex items-center justify-center gap-2">
                {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through">
                        {formatPrice(product.original_price)}
                    </span>
                )}
                <span
                    className="text-sm font-bold"
                    style={{ color: themeColors.primary }}
                >
                    {formatPrice(product.sale_price)}
                </span>
            </div>
            <p className="mt-2 line-clamp-3 text-center text-[10px] leading-relaxed text-slate-500">
                {description}
            </p>
            <a
                href={`/products/${product.slug}`}
                className="mt-3 block w-full rounded-full py-2 text-center text-xs font-semibold text-white"
                style={{ backgroundColor: themeColors.primary }}
            >
                Read more
            </a>
        </div>
    );
}

function HotspotButton({
    label,
    expanded,
    onEnter,
    onLeave,
}: {
    label: string;
    expanded: boolean;
    onEnter: () => void;
    onLeave: () => void;
}) {
    return (
        <button
            type="button"
            className={`absolute left-1/2 top-1/2 z-30 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-300 sm:size-11 ${
                expanded
                    ? 'pointer-events-none scale-0 opacity-0'
                    : 'scale-100 opacity-100'
            }`}
            aria-label={label}
            aria-expanded={expanded}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            <span className="hotspot-glow absolute size-6 rounded-full bg-white/50 sm:size-7" />
            <span className="hotspot-pulse-ring absolute size-5 rounded-full bg-white/70 sm:size-6" />
            <span className="hotspot-pulse-ring-delayed absolute size-5 rounded-full bg-white/50 sm:size-6" />
            <span className="relative size-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] ring-2 ring-white/90 sm:size-3.5" />
        </button>
    );
}

function BentoProductTile({ product }: { product: HomepageProduct }) {
    const [imageError, setImageError] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const thumbnail = mediaUrl(product.thumbnail);

    const openDetails = () => {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        setShowDetails(true);
    };

    const scheduleClose = () => {
        hideTimer.current = setTimeout(() => setShowDetails(false), 180);
    };

    return (
        <div
            className={`relative h-full min-h-0 w-full overflow-visible ${showDetails ? 'z-50' : 'z-0'}`}
        >
            <div className="relative h-full overflow-hidden rounded-2xl bg-slate-100">
                {thumbnail && !imageError ? (
                    <img
                        src={thumbnail}
                        alt={product.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-center text-xs text-slate-400">
                        {product.name}
                    </div>
                )}
            </div>

            {showDetails && (
                <div
                    className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
                    onMouseEnter={openDetails}
                    onMouseLeave={scheduleClose}
                >
                    <ProductDetailCard product={product} />
                </div>
            )}

            <HotspotButton
                label={`View ${product.name} details`}
                expanded={showDetails}
                onEnter={openDetails}
                onLeave={scheduleClose}
            />
        </div>
    );
}

function PromoTile({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="flex h-full min-h-0 w-full flex-col items-center justify-center rounded-2xl border border-slate-200/40 bg-[#e3e6e6]/60 px-4 py-4 text-center backdrop-blur-sm">
            <h3 className="text-sm font-bold tracking-[0.15em] text-slate-800 sm:text-base">
                {title}
            </h3>
            <p className="mt-2 max-w-[180px] text-[10px] leading-relaxed text-slate-400 sm:text-xs">
                {subtitle}
            </p>
        </div>
    );
}

function BentoColumn({ slots }: { slots: ColumnSlot[] }) {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:gap-4">
            {slots.map((slot, index) => (
                <div
                    key={index}
                    className="min-h-0"
                    style={{ flex: `${slot.grow} 1 0%` }}
                >
                    {slot.type === 'product' ? (
                        <BentoProductTile product={slot.product} />
                    ) : (
                        <PromoTile title={slot.title} subtitle={slot.subtitle} />
                    )}
                </div>
            ))}
        </div>
    );
}

function MobileFallback({ products }: { products: HomepageProduct[] }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
            {products.slice(0, 6).map((product) => {
                const thumbnail = mediaUrl(product.thumbnail);

                return (
                    <a
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="aspect-square bg-slate-100">
                            {thumbnail ? (
                                <img
                                    src={thumbnail}
                                    alt={product.name}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-slate-400">
                                    {product.name}
                                </div>
                            )}
                        </div>
                        <div className="p-2.5">
                            <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900">
                                {product.name}
                            </p>
                            <p
                                className="mt-1 text-sm font-bold"
                                style={{ color: themeColors.primary }}
                            >
                                {formatPrice(product.sale_price)}
                            </p>
                        </div>
                    </a>
                );
            })}
        </div>
    );
}

export default function BestsellersBentoSection({
    products,
}: {
    products: HomepageProduct[];
}) {
    if (products.length === 0) {
        return null;
    }

    const columns = buildColumns(products.slice(0, 7));

    return (
        <section className="w-full overflow-hidden bg-[#f4f4f2] px-3 py-8 sm:overflow-visible sm:px-6 sm:py-10 md:px-8 md:py-14">
            <div className="mb-5 text-center sm:mb-6 md:mb-8">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                    Bestselling Product
                </h2>
                <p className="mt-1.5 text-xs font-medium tracking-wide text-slate-400">
                    Bestselling HealthCare products of the year
                </p>
            </div>

            <MobileFallback products={products} />

            {columns.length > 0 && (
                <div className="mx-auto hidden h-[520px] max-w-[1440px] overflow-visible lg:flex lg:gap-4 xl:h-[580px]">
                    {columns.map((slots, index) => (
                        <BentoColumn key={index} slots={slots} />
                    ))}
                </div>
            )}
        </section>
    );
}
