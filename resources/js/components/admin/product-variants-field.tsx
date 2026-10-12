import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import ProductVariantImagesField from '@/components/admin/product-variant-images-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AttributeValueOption, ProductImage, ProductVariant } from '@/types/admin';

type VariantRow = {
    key: string;
    id?: number;
    colorValueId: string;
    sizeValueId: string;
    original_price: string;
    sale_price: string;
    stock: number;
    sku: string;
    status: 'active' | 'inactive';
};

type ProductVariantsFieldProps = {
    initialVariants?: ProductVariant[];
    initialImages?: ProductImage[];
    attributeValues?: AttributeValueOption[];
    errors?: Record<string, string>;
    onRowCountChange?: (count: number) => void;
};

function optionIdForAttribute(
    optionValues: AttributeValueOption[] | undefined,
    attributeSlug: string,
): string {
    const match = optionValues?.find(
        (option) => option.attribute?.slug === attributeSlug,
    );

    return match ? String(match.id) : '';
}

function createRow(
    variant?: ProductVariant,
    attributeValues: AttributeValueOption[] = [],
): VariantRow {
    const optionValues = variant?.option_values;

    return {
        key: variant ? `existing-${variant.id}` : `new-${crypto.randomUUID()}`,
        id: variant?.id,
        colorValueId:
            optionIdForAttribute(optionValues, 'color') ||
            String(
                attributeValues.find((option) => option.attribute?.slug === 'color')
                    ?.id ?? '',
            ),
        sizeValueId:
            optionIdForAttribute(optionValues, 'size') ||
            String(
                attributeValues.find((option) => option.attribute?.slug === 'size')
                    ?.id ?? '',
            ),
        original_price: variant?.original_price ?? '',
        sale_price: variant?.sale_price ?? '',
        stock: variant?.stock ?? 0,
        sku: variant?.sku ?? '',
        status: variant?.status ?? 'active',
    };
}

export default function ProductVariantsField({
    initialVariants = [],
    initialImages = [],
    attributeValues = [],
    errors = {},
    onRowCountChange,
}: ProductVariantsFieldProps) {
    const variants = initialVariants ?? [];
    const images = initialImages ?? [];
    const [rows, setRows] = useState<VariantRow[]>(
        variants.length > 0
            ? variants.map((variant) => createRow(variant, attributeValues))
            : [],
    );

    const colorOptions = useMemo(
        () =>
            attributeValues.filter((option) => option.attribute?.slug === 'color'),
        [attributeValues],
    );

    const sizeOptions = useMemo(
        () =>
            attributeValues.filter((option) => option.attribute?.slug === 'size'),
        [attributeValues],
    );

    useEffect(() => {
        onRowCountChange?.(rows.length);
    }, [rows.length, onRowCountChange]);

    const addRow = () => {
        setRows((current) => [...current, createRow(undefined, attributeValues)]);
    };

    const removeRow = (key: string) => {
        setRows((current) => current.filter((row) => row.key !== key));
    };

    const updateRow = (key: string, patch: Partial<VariantRow>) => {
        setRows((current) =>
            current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label>Product Variants</Label>
                    <p className="text-xs text-muted-foreground">
                        Optional. Combine color and size for variant-specific
                        pricing and stock.
                    </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <Plus className="size-3.5" />
                    Add Variant
                </Button>
            </div>

            {rows.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No variants. Base product price and stock will be used.
                </p>
            )}

            {rows.map((row, index) => (
                <div
                    key={row.key}
                    className="space-y-4 rounded-lg border p-4"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Variant {index + 1}</p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(row.key)}
                        >
                            <Trash2 className="size-3.5" />
                            Remove
                        </Button>
                    </div>

                    {row.id && (
                        <input
                            type="hidden"
                            name={`variants[${index}][id]`}
                            value={row.id}
                        />
                    )}

                    {row.colorValueId && (
                        <input
                            type="hidden"
                            name={`variants[${index}][option_value_ids][]`}
                            value={row.colorValueId}
                        />
                    )}

                    {row.sizeValueId && (
                        <input
                            type="hidden"
                            name={`variants[${index}][option_value_ids][]`}
                            value={row.sizeValueId}
                        />
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`variant-color-${index}`}>Color</Label>
                            <select
                                id={`variant-color-${index}`}
                                value={row.colorValueId}
                                onChange={(event) =>
                                    updateRow(row.key, {
                                        colorValueId: event.target.value,
                                    })
                                }
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">Select color</option>
                                {colorOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`variant-size-${index}`}>Size</Label>
                            <select
                                id={`variant-size-${index}`}
                                value={row.sizeValueId}
                                onChange={(event) =>
                                    updateRow(row.key, {
                                        sizeValueId: event.target.value,
                                    })
                                }
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">Select size</option>
                                {sizeOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`variant-sku-${index}`}>SKU</Label>
                            <Input
                                id={`variant-sku-${index}`}
                                name={`variants[${index}][sku]`}
                                defaultValue={row.sku}
                                placeholder="SKU-001-L"
                            />
                            <InputError message={errors[`variants.${index}.sku`]} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`variant-stock-${index}`}>Stock</Label>
                            <Input
                                id={`variant-stock-${index}`}
                                name={`variants[${index}][stock]`}
                                type="number"
                                min={0}
                                defaultValue={row.stock}
                            />
                            <InputError
                                message={errors[`variants.${index}.stock`]}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`variant-original-${index}`}>
                                Original price
                            </Label>
                            <Input
                                id={`variant-original-${index}`}
                                name={`variants[${index}][original_price]`}
                                type="number"
                                min={0}
                                step="0.01"
                                defaultValue={row.original_price}
                            />
                            <InputError
                                message={
                                    errors[`variants.${index}.original_price`]
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`variant-sale-${index}`}>
                                Sale price
                            </Label>
                            <Input
                                id={`variant-sale-${index}`}
                                name={`variants[${index}][sale_price]`}
                                type="number"
                                min={0}
                                step="0.01"
                                defaultValue={row.sale_price}
                            />
                            <InputError
                                message={errors[`variants.${index}.sale_price`]}
                            />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor={`variant-status-${index}`}>Status</Label>
                            <select
                                id={`variant-status-${index}`}
                                name={`variants[${index}][status]`}
                                defaultValue={row.status}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <InputError
                                message={errors[`variants.${index}.status`]}
                            />
                        </div>
                    </div>

                    <ProductVariantImagesField
                        variantIndex={index}
                        colorValueId={row.colorValueId}
                        initialImages={images.filter(
                            (image) =>
                                image.color_value_id &&
                                String(image.color_value_id) === row.colorValueId,
                        )}
                        errors={errors}
                    />
                </div>
            ))}
        </div>
    );
}
