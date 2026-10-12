export type BuyNowPending = {
    product_id: number;
    variant_id?: number | null;
    color?: string | null;
    size?: string | null;
    quantity: number;
};

const STORAGE_KEY = 'storefront.buy_now.pending';

export function saveBuyNowPending(payload: BuyNowPending): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
        // Ignore storage errors (private browsing, quota, etc.)
    }
}

export function readBuyNowPending(): BuyNowPending | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as BuyNowPending;

        if (!parsed?.product_id) {
            return null;
        }

        return {
            product_id: parsed.product_id,
            variant_id: parsed.variant_id ?? null,
            color: parsed.color ?? null,
            size: parsed.size ?? null,
            quantity: parsed.quantity ?? 1,
        };
    } catch {
        return null;
    }
}

export function clearBuyNowPending(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Ignore storage errors
    }
}
