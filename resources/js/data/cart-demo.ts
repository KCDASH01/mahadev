import { formatPrice, getDiscountPercentage, type FashionProduct } from '@/data/fashion-products';
import type { CartLineItem } from '@/types/cart';

export type { CartLineItem };

export type CartOffer = {
    id: string;
    icon: string;
    title: string;
    highlight?: string;
    code?: string;
};

export const cartOffers: CartOffer[] = [
    {
        id: 'welcome',
        icon: '🎉',
        title: 'Flat 10% OFF on First Order',
        highlight: 'WELCOME10',
        code: 'WELCOME10',
    },
    {
        id: 'mens-sale',
        icon: '🔥',
        title: "Flat 40% OFF on Men's Collection",
    },
    {
        id: 'shipping',
        icon: '🚚',
        title: 'Free Shipping Above ₹999',
    },
    {
        id: 'b2g1',
        icon: '✨',
        title: 'Buy 2 Get 1 Free on T-Shirts',
    },
];

export const defaultDeliveryAddress = {
    name: 'Demo Customer',
    line1: '123 Sample Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '9876543210',
};

export function getProductSku(product: FashionProduct, size?: string | null) {
    const base = `HS-${String(product.id).padStart(4, '0')}`;

    return size ? `${base}-${size}` : base;
}

export function getStockMessage(stock: number) {
    if (stock <= 0) {
        return 'Out of Stock';
    }

    if (stock <= 5) {
        return `Only ${stock} Left`;
    }

    return 'In Stock';
}

export function createDemoCartItems(catalogProducts: FashionProduct[]): CartLineItem[] {
    const picks = catalogProducts.slice(0, 3);

    return picks.map((product) => ({
        key: String(product.id),
        product,
        size: product.sizes[0] ?? null,
        color: product.color ?? null,
        quantity: 1,
        stock: product.stock ?? 99,
        variantId: null,
    }));
}

export function getRecommendedCartProducts(
    catalogProducts: FashionProduct[],
    cartProductIds: number[],
    limit = 8,
) {
    return catalogProducts.filter((product) => !cartProductIds.includes(product.id)).slice(0, limit);
}

export function getEstimatedDeliveryDate(fromDate = new Date()) {
    const delivery = new Date(fromDate);
    delivery.setDate(delivery.getDate() + 4);

    return delivery.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
}

export function calculateCartTotals(items: CartLineItem[], appliedCoupon = '') {
    const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const mrpTotal = items.reduce(
        (total, item) => total + item.product.originalPrice * item.quantity,
        0,
    );
    const productDiscount = mrpTotal - subtotal;
    let couponDiscount = 0;

    if (appliedCoupon === 'WELCOME10') {
        couponDiscount = Math.round(subtotal * 0.1);
    } else if (appliedCoupon === 'HOME5') {
        couponDiscount = Math.round(subtotal * 0.05);
    } else if (appliedCoupon === 'FLAT200') {
        couponDiscount = subtotal >= 1499 ? 200 : 0;
    }

    const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
    const grandTotal = Math.max(subtotal - couponDiscount + shipping, 0);
    const totalQuantity = items.reduce((count, item) => count + item.quantity, 0);
    const totalSavings = productDiscount + couponDiscount;

    return {
        subtotal,
        mrpTotal,
        productDiscount,
        couponDiscount,
        shipping,
        total: grandTotal,
        grandTotal,
        savings: totalSavings,
        totalSavings,
        itemCount: items.length,
        totalQuantity,
        formattedSubtotal: formatPrice(subtotal),
        formattedTotal: formatPrice(grandTotal),
        formattedSavings: formatPrice(totalSavings),
        formattedShipping: shipping === 0 ? 'FREE' : formatPrice(shipping),
        shippingLabel: shipping === 0 ? 'FREE' : formatPrice(shipping),
        discountPercent: getDiscountPercentage(mrpTotal, subtotal),
    };
}
