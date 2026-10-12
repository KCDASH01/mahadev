import { Head } from '@inertiajs/react';
import MobileStickyBar from '@/components/storefront/product-detail/mobile-sticky-bar';
import ProductImageGallery from '@/components/storefront/product-detail/product-image-gallery';
import ProductPurchasePanel from '@/components/storefront/product-detail/product-purchase-panel';
import ProductTabs from '@/components/storefront/product-detail/product-tabs';
import RelatedProductsSection from '@/components/storefront/product-detail/related-products-section';
import StorefrontLayout from '@/components/storefront/storefront-layout';
import { useProductSelection } from '@/hooks/use-product-selection';
import type { ProductShowPageProps } from '@/types/product';

export default function ProductShow({
    product,
    relatedProducts,
    navCategories,
    reviews,
    ratingSummary,
}: ProductShowPageProps) {
    const selection = useProductSelection(product);

    const handleAddToCart = () => {
        if (!selection.inStock) return;
        // Cart API integration will be added later.
    };

    const handleBuyNow = () => {
        if (!selection.inStock) return;
        // Checkout flow will be added later.
    };

    return (
        <>
            <Head title={product.name} />

            <StorefrontLayout categories={navCategories}>
                <main className="mx-auto w-full max-w-[1440px] px-3 py-4 pb-24 sm:px-4 sm:py-6 sm:pb-8 md:py-8">
                    <nav className="mb-4 text-xs text-slate-500 sm:text-sm">
                        <a href="/" className="hover:text-[#2563EB]">
                            Home
                        </a>
                        {product.category && (
                            <>
                                <span className="mx-2">/</span>
                                <a
                                    href={`/categories/${product.category.slug}`}
                                    className="hover:text-[#2563EB]"
                                >
                                    {product.category.name}
                                </a>
                            </>
                        )}
                        <span className="mx-2">/</span>
                        <span className="text-slate-700">{product.name}</span>
                    </nav>

                    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
                        <ProductImageGallery
                            images={product.images}
                            productName={product.name}
                        />
                        <ProductPurchasePanel
                            product={product}
                            selection={selection}
                            ratingAverage={ratingSummary.average}
                            ratingTotal={ratingSummary.total}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                        />
                    </div>

                    <div className="mt-8 sm:mt-10">
                        <ProductTabs
                            product={product}
                            reviews={reviews}
                            ratingSummary={ratingSummary}
                        />
                    </div>

                    <RelatedProductsSection products={relatedProducts} />
                </main>

                <MobileStickyBar
                    inStock={selection.inStock}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                />
            </StorefrontLayout>
        </>
    );
}
