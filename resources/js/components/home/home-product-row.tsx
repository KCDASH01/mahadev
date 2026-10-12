import { HomeProductCard } from '@/components/product-card';
import type { FashionProduct } from '@/data/fashion-products';

type HomeProductRowProps = {
    products: FashionProduct[];
    showNewArrivalBadge?: boolean;
    className?: string;
};

export function HomeProductRow({
    products,
    showNewArrivalBadge = false,
    className = '',
}: HomeProductRowProps) {
    return (
        <>
            <div
                className={`grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:hidden ${className}`}
            >
                {products.map((product, index) => (
                    <HomeProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        showNewArrivalBadge={showNewArrivalBadge}
                        compact
                    />
                ))}
            </div>

            <div
                className={`hidden items-stretch gap-5 lg:grid lg:grid-cols-4 ${className}`}
            >
                {products.map((product, index) => (
                    <HomeProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        showNewArrivalBadge={showNewArrivalBadge}
                    />
                ))}
            </div>
        </>
    );
}
