import { ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ProductVariantImagesField from '@/components/admin/product-variant-images-field';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AttributeValueOption, ProductImage, ProductVariant } from '@/types/admin';

type ColorVariantRow = {
    key: string;
    id?: number;
    colorValueId: string;
    original_price: string;
    sale_price: string;
    stock: number;
    sku: string;
    status: 'active' | 'inactive';
};

type SizeGroup = {
    key: string;
    sizeValueId: string;
    colors: ColorVariantRow[];
    openColorKey?: string;
};

type FlattenedVariant = {
    groupKey: string;
    sizeValueId: string;
    color: ColorVariantRow;
};

type ProductSizeGroupVariantsFieldProps = {
    initialVariants?: ProductVariant[];
    initialImages?: ProductImage[];
    attributeValues?: AttributeValueOption[];
    errors?: Record<string, string>;
    onRowCountChange?: (count: number) => void;
    productSku?: string;
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

function createColorRow(variant?: ProductVariant, colorValueId = ''): ColorVariantRow {
    return {
        key: variant ? `existing-${variant.id}` : `new-${crypto.randomUUID()}`,
        id: variant?.id,
        colorValueId:
            colorValueId || optionIdForAttribute(variant?.option_values, 'color'),
        original_price: variant?.original_price ?? '',
        sale_price: variant?.sale_price ?? '',
        stock: variant?.stock ?? 0,
        sku: variant?.sku ?? '',
        status: variant?.status ?? 'active',
    };
}

function createSizeGroup(sizeValueId = '', colors: ColorVariantRow[] = []): SizeGroup {
    return {
        key: `group-${crypto.randomUUID()}`,
        sizeValueId,
        colors,
        openColorKey: colors[0]?.key,
    };
}

function optionLabel(options: AttributeValueOption[], id: string): string {
    return options.find((option) => String(option.id) === id)?.value ?? '';
}

function optionMeta(options: AttributeValueOption[], id: string) {
    return options.find((option) => String(option.id) === id)?.meta ?? null;
}

function renderColorSwatch(
    meta?: { hex?: string; type?: 'solid' | 'multicolor' | 'pattern' } | null,
    className = 'size-3 rounded-full border',
) {
    const type = meta?.type ?? 'solid';

    if (type === 'solid') {
        return (
            <span
                className={`${className} shrink-0`}
                style={{ backgroundColor: meta?.hex ?? '#CBD5E1' }}
                title={meta?.hex ?? 'Solid'}
            />
        );
    }

    if (type === 'multicolor') {
        return (
            <span
                className={`${className} shrink-0`}
                style={{
                    background: 'linear-gradient(135deg, #FF007F 0%, #FFD700 33%, #00E5FF 66%, #7B2CBF 100%)',
                }}
                title="Multicolor"
            />
        );
    }

    return (
        <span
            className={`${className} shrink-0`}
            style={{
                background: 'repeating-linear-gradient(-45deg, #475569, #475569 3px, #F1F5F9 3px, #F1F5F9 6px)',
            }}
            title="Pattern"
        />
    );
}

function imageCount(images: ProductImage[], colorValueId: string): number {
    return images.filter(
        (image) => image.color_value_id && String(image.color_value_id) === colorValueId,
    ).length;
}

function slugifyPart(text: string): string {
    return text
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function generateUniqueVariantSku(
    productSku: string,
    sizeName: string,
    colorName: string,
    existingSkus: Set<string>,
): string {
    const pSku = slugifyPart(productSku) || 'PROD';
    const sName = slugifyPart(sizeName);
    const cName = slugifyPart(colorName);

    const parts = [pSku];
    if (sName) parts.push(sName);
    if (cName) parts.push(cName);

    const candidate = parts.join('-') || 'SKU';

    let uniqueSku = candidate;
    let counter = 1;
    while (existingSkus.has(uniqueSku.toUpperCase())) {
        uniqueSku = `${candidate}-${counter}`;
        counter++;
    }
    return uniqueSku;
}

export default function ProductSizeGroupVariantsField({
    initialVariants = [],
    initialImages = [],
    attributeValues = [],
    errors = {},
    onRowCountChange,
    productSku = '',
}: ProductSizeGroupVariantsFieldProps) {
    const [customColorOptions, setCustomColorOptions] = useState<AttributeValueOption[]>([]);
    const [showAddColorForm, setShowAddColorForm] = useState(false);
    const [newColorName, setNewColorName] = useState('');
    const [newColorType, setNewColorType] = useState<'solid' | 'multicolor' | 'pattern'>('solid');
    const [newColorHex, setNewColorHex] = useState('#3B82F6');
    const [isCreatingColor, setIsCreatingColor] = useState(false);
    const [colorCreateError, setColorCreateError] = useState<string | null>(null);

    const colorOptions = useMemo(
        () => [
            ...attributeValues.filter((option) => option.attribute?.slug === 'color'),
            ...customColorOptions,
        ],
        [attributeValues, customColorOptions],
    );

    const sizeOptions = useMemo(
        () =>
            attributeValues.filter((option) => option.attribute?.slug === 'size'),
        [attributeValues],
    );

    const initialGroups = useMemo(() => {
        const grouped = new Map<string, ColorVariantRow[]>();

        initialVariants.forEach((variant) => {
            const sizeValueId = optionIdForAttribute(variant.option_values, 'size');
            const colorValueId = optionIdForAttribute(variant.option_values, 'color');

            if (!grouped.has(sizeValueId)) {
                grouped.set(sizeValueId, []);
            }

            grouped.get(sizeValueId)?.push(createColorRow(variant, colorValueId));
        });

        return [...grouped.entries()].map(([sizeValueId, colors]) =>
            createSizeGroup(sizeValueId, colors),
        );
    }, [initialVariants]);

    const [groups, setGroups] = useState<SizeGroup[]>(initialGroups);
    const [colorDialogGroupKey, setColorDialogGroupKey] = useState<string | null>(null);
    const [selectedColorIds, setSelectedColorIds] = useState<Set<string>>(new Set());

    const flattened = useMemo<FlattenedVariant[]>(
        () =>
            groups.flatMap((group) =>
                group.colors.map((color) => ({
                    groupKey: group.key,
                    sizeValueId: group.sizeValueId,
                    color,
                })),
            ),
        [groups],
    );

    const duplicateSkus = useMemo(() => {
        const counts = new Map<string, number>();
        flattened.forEach((row) => {
            const skuVal = row.color.sku?.trim().toUpperCase();
            if (skuVal) {
                counts.set(skuVal, (counts.get(skuVal) || 0) + 1);
            }
        });
        const dupes = new Set<string>();
        counts.forEach((count, skuVal) => {
            if (count > 1) {
                dupes.add(skuVal);
            }
        });
        return dupes;
    }, [flattened]);

    const firstIndexByColor = useMemo(() => {
        const indexes = new Map<string, number>();

        flattened.forEach((row, index) => {
            if (row.color.colorValueId && !indexes.has(row.color.colorValueId)) {
                indexes.set(row.color.colorValueId, index);
            }
        });

        return indexes;
    }, [flattened]);

    useEffect(() => {
        onRowCountChange?.(flattened.length);
    }, [flattened.length, onRowCountChange]);

    const selectedSizes = useMemo(
        () => new Set(groups.map((group) => group.sizeValueId).filter(Boolean)),
        [groups],
    );

    const addSizeGroup = () => {
        const nextSize =
            sizeOptions.find((option) => !selectedSizes.has(String(option.id)))?.id ??
            '';

        setGroups((current) => [
            ...current,
            createSizeGroup(nextSize ? String(nextSize) : ''),
        ]);
    };

    const removeSizeGroup = (groupKey: string) => {
        setGroups((current) => current.filter((group) => group.key !== groupKey));
    };

    const updateSizeGroup = (groupKey: string, sizeValueId: string) => {
        setGroups((current) =>
            current.map((group) =>
                group.key === groupKey ? { ...group, sizeValueId } : group,
            ),
        );
    };

    const updateColorRow = (
        groupKey: string,
        colorKey: string,
        patch: Partial<ColorVariantRow>,
    ) => {
        setGroups((current) =>
            current.map((group) =>
                group.key === groupKey
                    ? {
                          ...group,
                          colors: group.colors.map((color) =>
                              color.key === colorKey ? { ...color, ...patch } : color,
                          ),
                      }
                    : group,
            ),
        );
    };

    const removeColor = (groupKey: string, colorKey: string) => {
        setGroups((current) =>
            current.map((group) =>
                group.key === groupKey
                    ? {
                          ...group,
                          colors: group.colors.filter((color) => color.key !== colorKey),
                          openColorKey:
                              group.openColorKey === colorKey
                                  ? undefined
                                  : group.openColorKey,
                      }
                    : group,
            ),
        );
    };

    const setOpenColor = (groupKey: string, colorKey?: string) => {
        setGroups((current) =>
            current.map((group) =>
                group.key === groupKey ? { ...group, openColorKey: colorKey } : group,
            ),
        );
    };

    const openColorDialog = (groupKey: string) => {
        setSelectedColorIds(new Set());
        setColorDialogGroupKey(groupKey);
        setShowAddColorForm(false);
        setColorCreateError(null);
    };

    const handleQuickStoreColor = async () => {
        if (!newColorName.trim()) return;
        setIsCreatingColor(true);
        setColorCreateError(null);

        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ||
                '';
            const response = await fetch('/admin/colors/quick-store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    value: newColorName.trim(),
                    type: newColorType,
                    hex: newColorType === 'solid' ? newColorHex : null,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create color.');
            }

            const newColor: AttributeValueOption = data.color;
            setCustomColorOptions((prev) => [...prev, newColor]);
            setSelectedColorIds((prev) => new Set(prev).add(String(newColor.id)));
            setNewColorName('');
            setNewColorHex('#3B82F6');
            setShowAddColorForm(false);
        } catch (err: any) {
            setColorCreateError(err.message || 'Failed to create color.');
        } finally {
            setIsCreatingColor(false);
        }
    };

    const applyColors = () => {
        if (!colorDialogGroupKey || selectedColorIds.size === 0) {
            setColorDialogGroupKey(null);
            setShowAddColorForm(false);

            return;
        }

        setGroups((current) => {
            const group = current.find((g) => g.key === colorDialogGroupKey);

            if (!group) return current;

            const sizeLabel = optionLabel(sizeOptions, group.sizeValueId);
            const existingSkus = new Set(
                current
                    .flatMap((g) => g.colors.map((c) => c.sku))
                    .filter(Boolean)
                    .map((s) => s.trim().toUpperCase()),
            );

            const existingColorIds = new Set(group.colors.map((c) => c.colorValueId));
            const additions = [...selectedColorIds]
                .filter((colorValueId) => !existingColorIds.has(colorValueId))
                .map((colorValueId) => {
                    const colorLabel = optionLabel(colorOptions, colorValueId);
                    const autoSku = generateUniqueVariantSku(
                        productSku,
                        sizeLabel,
                        colorLabel,
                        existingSkus,
                    );

                    existingSkus.add(autoSku.toUpperCase());

                    return {
                        ...createColorRow(undefined, colorValueId),
                        sku: autoSku,
                    };
                });

            return current.map((g) => {
                if (g.key !== colorDialogGroupKey) return g;

                return {
                    ...g,
                    colors: [...g.colors, ...additions],
                    openColorKey: additions[0]?.key ?? g.openColorKey,
                };
            });
        });

        setSelectedColorIds(new Set());
        setColorDialogGroupKey(null);
        setShowAddColorForm(false);
    };

    const activeDialogGroup = groups.find((group) => group.key === colorDialogGroupKey);
    const activeGroupColorIds = new Set(
        activeDialogGroup?.colors.map((color) => color.colorValueId) ?? [],
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Label>Product Variants</Label>
                    <p className="text-xs text-muted-foreground">
                        Create size groups and assign available colors. Each color is saved as a separate sellable variant.
                    </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSizeGroup}>
                    <Plus className="size-3.5" />
                    Add Size Group
                </Button>
            </div>

            {groups.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No variants. Base product price and stock will be used.
                </p>
            )}

            <div className="space-y-4">
                {groups.map((group) => {
                    const sizeLabel = optionLabel(sizeOptions, group.sizeValueId);

                    return (
                        <div key={group.key} className="space-y-4 rounded-lg border bg-white p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold">
                                        Size Group{sizeLabel ? `: ${sizeLabel}` : ''}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Colors inside this group become separate variants.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSizeGroup(group.key)}
                                >
                                    <Trash2 className="size-3.5" />
                                    Remove
                                </Button>
                            </div>

                            <div className="grid gap-2 sm:max-w-xs">
                                <Label htmlFor={`size-group-${group.key}`}>Size</Label>
                                <select
                                    id={`size-group-${group.key}`}
                                    value={group.sizeValueId}
                                    onChange={(event) =>
                                        updateSizeGroup(group.key, event.target.value)
                                    }
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                >
                                    <option value="">Select size</option>
                                    {sizeOptions.map((option) => {
                                        const value = String(option.id);
                                        const disabled =
                                            selectedSizes.has(value) && value !== group.sizeValueId;

                                        return (
                                            <option key={option.id} value={option.id} disabled={disabled}>
                                                {option.value}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium">Available Colors</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {group.colors.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">
                                                    No colors selected.
                                                </span>
                                            ) : (
                                                group.colors.map((color) => {
                                                    const label = optionLabel(colorOptions, color.colorValueId);
                                                    const meta = optionMeta(colorOptions, color.colorValueId);

                                                    return (
                                                        <Badge
                                                            key={color.key}
                                                            variant="secondary"
                                                            className="gap-1.5"
                                                        >
                                                            {renderColorSwatch(meta, 'size-2.5 rounded-full border')}
                                                            {label}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeColor(group.key, color.key)}
                                                                className="ml-1 rounded-sm text-muted-foreground hover:text-foreground"
                                                                aria-label={`Remove ${label}`}
                                                            >
                                                                <X className="size-3" />
                                                            </button>
                                                        </Badge>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openColorDialog(group.key)}
                                    >
                                        <Plus className="size-3.5" />
                                        Add Color
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {group.colors.map((color) => {
                                        const variantIndex = flattened.findIndex(
                                            (row) => row.color.key === color.key,
                                        );
                                        const colorLabel = optionLabel(colorOptions, color.colorValueId);
                                        const meta = optionMeta(colorOptions, color.colorValueId);
                                        const count = imageCount(initialImages, color.colorValueId);
                                        const isOpen = group.openColorKey === color.key;
                                        const canManageImages =
                                            firstIndexByColor.get(color.colorValueId) === variantIndex;
                                        const isDuplicateSku =
                                            Boolean(color.sku?.trim()) &&
                                            duplicateSkus.has(color.sku.trim().toUpperCase());

                                        return (
                                            <Collapsible
                                                key={color.key}
                                                open={isOpen}
                                                onOpenChange={(open) =>
                                                    setOpenColor(group.key, open ? color.key : undefined)
                                                }
                                                className="rounded-md border"
                                            >
                                                {color.id && (
                                                    <input
                                                        type="hidden"
                                                        name={`variants[${variantIndex}][id]`}
                                                        value={color.id}
                                                    />
                                                )}
                                                {group.sizeValueId && (
                                                    <input
                                                        type="hidden"
                                                        name={`variants[${variantIndex}][option_value_ids][]`}
                                                        value={group.sizeValueId}
                                                    />
                                                )}
                                                {color.colorValueId && (
                                                    <input
                                                        type="hidden"
                                                        name={`variants[${variantIndex}][option_value_ids][]`}
                                                        value={color.colorValueId}
                                                    />
                                                )}
                                                <input
                                                    type="hidden"
                                                    name={`variants[${variantIndex}][sku]`}
                                                    value={color.sku ?? ''}
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`variants[${variantIndex}][stock]`}
                                                    value={color.stock ?? 0}
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`variants[${variantIndex}][original_price]`}
                                                    value={color.original_price ?? ''}
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`variants[${variantIndex}][sale_price]`}
                                                    value={color.sale_price ?? ''}
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`variants[${variantIndex}][status]`}
                                                    value={color.status ?? 'active'}
                                                />

                                                <CollapsibleTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="flex w-full items-center justify-between gap-3 p-3 text-left"
                                                    >
                                                        <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[1fr_1fr_1fr_1fr] sm:items-center">
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                {renderColorSwatch(meta, 'size-3 rounded-full border')}
                                                                <span className="truncate text-sm font-semibold">
                                                                    {colorLabel || 'Color'}
                                                                </span>
                                                            </div>
                                                            <span className="truncate text-xs text-muted-foreground">
                                                                SKU {color.sku || '-'}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Stock {color.stock ?? 0}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {color.original_price || '-'} - {color.sale_price || '-'} | {count} images
                                                            </span>
                                                        </div>
                                                        <ChevronDown
                                                            className={`size-4 shrink-0 transition-transform ${
                                                                isOpen ? 'rotate-180' : ''
                                                            }`}
                                                        />
                                                    </button>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent forceMount className="data-[state=closed]:hidden">
                                                    <div className="space-y-4 border-t p-3">
                                                        <InputError
                                                            message={errors[`variants.${variantIndex}.option_value_ids`]}
                                                        />

                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            <div className="grid gap-2">
                                                                <div className="flex items-center justify-between">
                                                                    <Label htmlFor={`variant-sku-${variantIndex}`}>SKU</Label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const sizeLabelVal = optionLabel(sizeOptions, group.sizeValueId);
                                                                            const colorLabelVal = optionLabel(colorOptions, color.colorValueId);
                                                                            const existingSkus = new Set(
                                                                                flattened
                                                                                    .filter((r) => r.color.key !== color.key)
                                                                                    .map((r) => r.color.sku)
                                                                                    .filter(Boolean)
                                                                                    .map((s) => s.trim().toUpperCase()),
                                                                            );
                                                                            const autoSku = generateUniqueVariantSku(
                                                                                productSku,
                                                                                sizeLabelVal,
                                                                                colorLabelVal,
                                                                                existingSkus,
                                                                            );
                                                                            updateColorRow(group.key, color.key, {
                                                                                sku: autoSku,
                                                                            });
                                                                        }}
                                                                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                                                                    >
                                                                        Auto-generate
                                                                    </button>
                                                                </div>
                                                                <Input
                                                                    id={`variant-sku-${variantIndex}`}
                                                                    value={color.sku}
                                                                    onChange={(event) =>
                                                                        updateColorRow(group.key, color.key, {
                                                                            sku: event.target.value,
                                                                        })
                                                                    }
                                                                    placeholder="TSHIRT-XS-BLK"
                                                                />
                                                                {isDuplicateSku && (
                                                                    <p className="text-xs font-medium text-amber-600">
                                                                        Warning: Duplicate SKU
                                                                    </p>
                                                                )}
                                                                <InputError message={errors[`variants.${variantIndex}.sku`]} />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor={`variant-stock-${variantIndex}`}>Stock</Label>
                                                                <Input
                                                                    id={`variant-stock-${variantIndex}`}
                                                                    type="number"
                                                                    min={0}
                                                                    value={color.stock}
                                                                    onChange={(event) =>
                                                                        updateColorRow(group.key, color.key, {
                                                                            stock: Number(event.target.value),
                                                                        })
                                                                    }
                                                                />
                                                                <InputError message={errors[`variants.${variantIndex}.stock`]} />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor={`variant-original-${variantIndex}`}>
                                                                    Original price
                                                                </Label>
                                                                <Input
                                                                    id={`variant-original-${variantIndex}`}
                                                                    type="number"
                                                                    min={0}
                                                                    step="0.01"
                                                                    value={color.original_price}
                                                                    onChange={(event) =>
                                                                        updateColorRow(group.key, color.key, {
                                                                            original_price: event.target.value,
                                                                        })
                                                                    }
                                                                />
                                                                <InputError message={errors[`variants.${variantIndex}.original_price`]} />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor={`variant-sale-${variantIndex}`}>Sale price</Label>
                                                                <Input
                                                                    id={`variant-sale-${variantIndex}`}
                                                                    type="number"
                                                                    min={0}
                                                                    step="0.01"
                                                                    value={color.sale_price}
                                                                    onChange={(event) =>
                                                                        updateColorRow(group.key, color.key, {
                                                                            sale_price: event.target.value,
                                                                        })
                                                                    }
                                                                />
                                                                <InputError message={errors[`variants.${variantIndex}.sale_price`]} />
                                                            </div>
                                                            <div className="grid gap-2 sm:col-span-2 sm:max-w-xs">
                                                                <Label htmlFor={`variant-status-${variantIndex}`}>Status</Label>
                                                                <select
                                                                    id={`variant-status-${variantIndex}`}
                                                                    value={color.status}
                                                                    onChange={(event) =>
                                                                        updateColorRow(group.key, color.key, {
                                                                            status: event.target.value as ColorVariantRow['status'],
                                                                        })
                                                                    }
                                                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                                                >
                                                                    <option value="active">Active</option>
                                                                    <option value="inactive">Inactive</option>
                                                                </select>
                                                                <InputError message={errors[`variants.${variantIndex}.status`]} />
                                                            </div>
                                                        </div>

                                                        <ProductVariantImagesField
                                                            variantIndex={variantIndex}
                                                            colorValueId={color.colorValueId}
                                                            colorLabel={colorLabel}
                                                            canManage={canManageImages}
                                                            initialImages={initialImages.filter(
                                                                (image) =>
                                                                    image.color_value_id &&
                                                                    String(image.color_value_id) === color.colorValueId,
                                                            )}
                                                            errors={errors}
                                                        />
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog
                open={Boolean(colorDialogGroupKey)}
                onOpenChange={(open) => {
                    if (!open) {
                        setColorDialogGroupKey(null);
                        setSelectedColorIds(new Set());
                        setShowAddColorForm(false);
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-4">
                            <DialogTitle>Select Colors</DialogTitle>
                            {!showAddColorForm && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAddColorForm(true)}
                                    className="h-8 text-xs gap-1"
                                >
                                    <Plus className="size-3.5" />
                                    Add New Color
                                </Button>
                            )}
                        </div>
                        <DialogDescription>
                            Choose one or more colors for this size group.
                        </DialogDescription>
                    </DialogHeader>

                    {showAddColorForm && (
                        <div className="space-y-3 rounded-lg border bg-slate-50 p-3 dark:bg-slate-900">
                            <p className="text-xs font-semibold">Create New Color</p>
                            <div className="grid gap-2 sm:grid-cols-3">
                                <div className="grid gap-1">
                                    <Label htmlFor="new-color-name" className="text-xs">
                                        Color Name
                                    </Label>
                                    <Input
                                        id="new-color-name"
                                        value={newColorName}
                                        onChange={(e) => setNewColorName(e.target.value)}
                                        placeholder="e.g. Crimson"
                                        className="h-8 bg-white text-xs dark:bg-slate-950"
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <Label htmlFor="new-color-type" className="text-xs">
                                        Color Type
                                    </Label>
                                    <select
                                        id="new-color-type"
                                        value={newColorType}
                                        onChange={(e) => setNewColorType(e.target.value as 'solid' | 'multicolor' | 'pattern')}
                                        className="h-8 rounded-md border bg-white px-2 text-xs font-medium dark:bg-slate-950"
                                    >
                                        <option value="solid">Solid</option>
                                        <option value="multicolor">Multicolor</option>
                                        <option value="pattern">Pattern</option>
                                    </select>
                                </div>
                                {newColorType === 'solid' ? (
                                    <div className="grid gap-1">
                                        <Label htmlFor="new-color-hex" className="text-xs">
                                            Color Palette
                                        </Label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                id="new-color-picker"
                                                value={newColorHex}
                                                onChange={(e) => setNewColorHex(e.target.value)}
                                                className="size-8 cursor-pointer rounded border bg-white p-0.5"
                                            />
                                            <Input
                                                id="new-color-hex"
                                                value={newColorHex}
                                                onChange={(e) => setNewColorHex(e.target.value)}
                                                placeholder="#000000"
                                                className="h-8 bg-white font-mono text-xs dark:bg-slate-950"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-end">
                                        <p className="py-2 text-[11px] font-medium text-slate-500">
                                            {newColorType === 'multicolor' ? '🌈 Multiple colors' : '▧ Visual pattern'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {colorCreateError && (
                                <p className="text-xs font-medium text-destructive">
                                    {colorCreateError}
                                </p>
                            )}
                            <div className="flex justify-end gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowAddColorForm(false);
                                        setColorCreateError(null);
                                    }}
                                    className="h-7 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleQuickStoreColor}
                                    disabled={isCreatingColor || !newColorName.trim()}
                                    className="h-7 text-xs"
                                >
                                    {isCreatingColor ? 'Saving...' : 'Save & Select'}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="grid max-h-[280px] gap-2 overflow-y-auto pr-1">
                        {colorOptions.map((option) => {
                            const value = String(option.id);
                            const alreadySelected = activeGroupColorIds.has(value);
                            const checked = alreadySelected || selectedColorIds.has(value);

                            return (
                                <label
                                    key={option.id}
                                    className={`flex items-center gap-3 rounded-md border p-3 text-sm ${
                                        alreadySelected ? 'bg-muted text-muted-foreground' : 'bg-white'
                                    }`}
                                >
                                    <Checkbox
                                        checked={checked}
                                        disabled={alreadySelected}
                                        onCheckedChange={(state) => {
                                            setSelectedColorIds((current) => {
                                                const next = new Set(current);

                                                if (state === true) {
                                                    next.add(value);
                                                } else {
                                                    next.delete(value);
                                                }

                                                return next;
                                            });
                                        }}
                                    />
                                    {renderColorSwatch(option.meta, 'size-3 rounded-full border')}
                                    <span className="font-medium">{option.value}</span>
                                    {alreadySelected && (
                                        <span className="ml-auto text-xs text-muted-foreground">Already added</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setColorDialogGroupKey(null);
                                setShowAddColorForm(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="button" onClick={applyColors}>
                            Apply Colors
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
