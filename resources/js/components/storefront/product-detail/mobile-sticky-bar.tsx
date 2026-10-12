import { ShoppingCart } from 'lucide-react';
import { addToCartCtaClass, buyNowCtaClass } from '@/lib/commerce-cta';

export default function MobileStickyBar({
    inStock,
    onAddToCart,
    onBuyNow,
}: {
    inStock: boolean;
    onAddToCart: () => void;
    onBuyNow: () => void;
}) {
    return (
        <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md sm:hidden">
            <div className="mx-auto flex max-w-lg gap-2">
                <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={!inStock}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm ${addToCartCtaClass} disabled:opacity-50`}
                >
                    <ShoppingCart className="size-4" />
                    Add To Cart
                </button>
                <button
                    type="button"
                    onClick={onBuyNow}
                    disabled={!inStock}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm ${buyNowCtaClass} disabled:opacity-50`}
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
}
