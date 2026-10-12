import { useMemo, useState } from 'react';
import type { ProductDetail, ProductVariantOption } from '@/types/product';

function discountPercent(original: string, sale: string): number | null {
    const originalValue = Number(original);
    const saleValue = Number(sale);
    if (originalValue <= saleValue || originalValue <= 0) return null;
    return Math.round(((originalValue - saleValue) / originalValue) * 100);
}

export function useProductSelection(product: ProductDetail) {
    const [quantity, setQuantity] = useState(1);
    const [selections, setSelections] = useState<Record<string, number>>({});

    const activeVariant = useMemo((): ProductVariantOption | null => {
        if (!product.has_variants) return null;

        const groups = product.variant_groups;
        if (groups.length === 0) return null;

        const allSelected = groups.every((group) => selections[group.name] !== undefined);
        if (!allSelected) return null;

        if (groups.length === 1) {
            const optionId = selections[groups[0].name];
            return groups[0].options.find((option) => option.id === optionId) ?? null;
        }

        const selectedValues = groups.map((group) => {
            const optionId = selections[group.name];
            return group.options.find((option) => option.id === optionId)?.value;
        });

        const combined = selectedValues.join(' / ');
        const flatOptions = groups.flatMap((group) => group.options);
        const combinedMatch = flatOptions.find((option) => option.value === combined);
        if (combinedMatch) return combinedMatch;

        const lastGroup = groups[groups.length - 1];
        const lastOptionId = selections[lastGroup.name];
        return lastGroup.options.find((option) => option.id === lastOptionId) ?? null;
    }, [product, selections]);

    const pricing = useMemo(() => {
        const original = activeVariant?.original_price ?? product.original_price;
        const sale = activeVariant?.sale_price ?? product.sale_price;
        const stock = activeVariant?.stock ?? product.stock;
        const sku = activeVariant?.sku ?? product.sku;

        return {
            original_price: original,
            sale_price: sale,
            stock,
            sku,
            discount: discountPercent(original, sale),
        };
    }, [activeVariant, product]);

    const variantsRequired = product.has_variants && product.variant_groups.length > 0;
    const allVariantsSelected =
        !variantsRequired ||
        product.variant_groups.every((group) => selections[group.name] !== undefined);

    const inStock = pricing.stock > 0 && allVariantsSelected;
    const needsVariantSelection = variantsRequired && !allVariantsSelected;

    const selectVariant = (groupName: string, optionId: number) => {
        setSelections((current) => ({ ...current, [groupName]: optionId }));
    };

    const increment = () => setQuantity((value) => Math.min(value + 1, pricing.stock || 1));
    const decrement = () => setQuantity((value) => Math.max(1, value - 1));

    return {
        quantity,
        selections,
        activeVariant,
        pricing,
        inStock,
        needsVariantSelection,
        allVariantsSelected,
        selectVariant,
        increment,
        decrement,
        setQuantity,
    };
}
