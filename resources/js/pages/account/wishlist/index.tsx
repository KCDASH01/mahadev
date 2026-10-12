import { Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { FashionProductCard } from '@/components/fashion/fashion-product-card';
import type { FashionProduct } from '@/data/fashion-products';
import { useIsMobile } from '@/hooks/use-mobile';
import { StorefrontAccountLayout } from '@/layouts/storefront-account-layout';
import { home } from '@/routes';

type WishlistIndexProps = {
    products: FashionProduct[];
};

export default function WishlistIndex({ products }: WishlistIndexProps) {
    const itemCount = products.length;
    const isMobile = useIsMobile();

    return (
        <StorefrontAccountLayout
            title="Wishlist"
            description={`${itemCount} item${itemCount === 1 ? '' : 's'} saved for later`}
        >
            {itemCount === 0 ? (
                <div className="py-8 text-center">
                    <Heart className="mx-auto h-12 w-12 text-slate-300" />
                    <h2 className="mt-4 font-serif text-xl font-medium text-[#09233D]">Your wishlist is empty</h2>
                    <p className="mt-2 text-[#647487]">
                        Tap the heart on any product to save it here.
                    </p>
                    <Link
                        href={home()}
                        className="mt-6 inline-flex h-11 items-center bg-[#062A4D] px-7 text-[11px] font-medium tracking-[0.2em] text-[#FCFAF5] uppercase transition hover:bg-[#041F3A]"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                    {products.map((product, index) => (
                        <FashionProductCard
                            key={`${product.id}-${product.color}-${product.sizes?.[0] ?? ''}`}
                            product={product}
                            index={index}
                            animate={false}
                            compact={isMobile}
                        />
                    ))}
                </div>
            )}
        </StorefrontAccountLayout>
    );
}
