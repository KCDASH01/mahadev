export type CartSummaryItem = {
    key: string;
    product_id: number;
    variant_id: number | null;
    quantity: number;
};

export type CartSummary = {
    count: number;
    keys: string[];
    items: CartSummaryItem[];
};

export function makeCartItemKey(productId: number, variantId?: number | null): string {
    return variantId ? `${productId}:${variantId}` : String(productId);
}

export function getCartItemQuantity(cart: CartSummary, key: string): number {
    return cart.items?.find((item) => item.key === key)?.quantity ?? 0;
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE SIZE'];

export function normalizeVariantValue(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
}

export function sortVariantSizes(sizes: string[]): string[] {
    return [...sizes].sort((a, b) => {
        const ai = SIZE_ORDER.indexOf(a.toUpperCase());
        const bi = SIZE_ORDER.indexOf(b.toUpperCase());

        if (ai !== -1 && bi !== -1) {
            return ai - bi;
        }

        if (ai !== -1) {
            return -1;
        }

        if (bi !== -1) {
            return 1;
        }

        return a.localeCompare(b, undefined, { numeric: true });
    });
}

export function getAvailableSizesForColor(
    variantOptions: ProductVariantOption[] | undefined,
    color?: string | null,
): string[] {
    if (!variantOptions?.length) {
        return [];
    }

    const normalizedColor = normalizeVariantValue(color);

    const sizes = variantOptions
        .filter((option) => {
            if (!normalizedColor) {
                return true;
            }

            return normalizeVariantValue(option.color) === normalizedColor;
        })
        .map((option) => option.size)
        .filter((size): size is string => Boolean(size));

    return sortVariantSizes([...new Set(sizes)]);
}

export function getAvailableColorsForSize(
    variantOptions: ProductVariantOption[] | undefined,
    size?: string | null,
): string[] {
    if (!variantOptions?.length) {
        return [];
    }

    const normalizedSize = normalizeVariantValue(size);

    const colors = variantOptions
        .filter((option) => {
            if (!normalizedSize) {
                return true;
            }

            return normalizeVariantValue(option.size) === normalizedSize;
        })
        .map((option) => option.color)
        .filter((color): color is string => Boolean(color));

    return [...new Set(colors)];
}

export function findProductVariantOption(
    variantOptions: ProductVariantOption[] | undefined,
    color?: string | null,
    size?: string | null,
): ProductVariantOption | undefined {
    if (!variantOptions?.length) {
        return undefined;
    }

    const normalizedColor = normalizeVariantValue(color);
    const normalizedSize = normalizeVariantValue(size);

    return variantOptions.find((option) => {
        const optionColor = normalizeVariantValue(option.color);
        const optionSize = normalizeVariantValue(option.size);
        const colorMatch =
            !normalizedColor || (optionColor !== '' && optionColor === normalizedColor);
        const sizeMatch =
            !normalizedSize || (optionSize !== '' && optionSize === normalizedSize);

        return colorMatch && sizeMatch;
    });
}

export type ProductVariantOption = {
    id: number;
    color: string | null;
    size: string | null;
    stock: number;
    salePrice: number;
    originalPrice: number;
};

export type CartLineItem = {
    key: string;
    product: import('@/data/fashion-products').FashionProduct;
    size: string | null;
    color: string | null;
    quantity: number;
    stock: number;
    variantId?: number | null;
    savedItemId?: number;
};
