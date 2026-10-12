import { Images, Loader2, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import MediaInput from '@/components/admin/media-input';
import ProductGalleryField from '@/components/admin/product-gallery-field';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatFileSize } from '@/lib/image-compression';
import { cn } from '@/lib/utils';
import type { Product, SelectOption } from '@/types/admin';

type JewelleryFormFieldsProps = {
    product?: Product;
    categories: SelectOption[];
    brands: SelectOption[];
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

type TabId = 'details' | 'gallery';

const tabs: { id: TabId; label: string; icon: typeof Package }[] = [
    { id: 'details', label: 'Jewellery Details', icon: Package },
    { id: 'gallery', label: 'Images', icon: Images },
];

const jewelleryDetailFields = [
    { key: 'material', label: 'Material', placeholder: 'Stainless Steel' },
    { key: 'metal', label: 'Metal', placeholder: 'Gold / Silver' },
    { key: 'finish', label: 'Finish', placeholder: 'Gold Plated' },
    { key: 'color', label: 'Color', placeholder: 'Gold' },
    { key: 'stone', label: 'Stone', placeholder: 'CZ' },
    { key: 'occasion', label: 'Occasion', placeholder: 'Party' },
    { key: 'weight', label: 'Weight note', placeholder: '8g' },
    { key: 'care', label: 'Care (short)', placeholder: 'Keep away from water and perfume' },
] as const;

function tabFromErrors(errors: Record<string, string> | null | undefined): TabId | null {
    const keys = Object.keys(errors ?? {});

    if (keys.some((key) => key.startsWith('gallery'))) {
        return 'gallery';
    }

    if (keys.length > 0) {
        return 'details';
    }

    return null;
}

function formatSku(val: string): string {
    return val
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function jewelleryDetails(product?: Product): Record<string, string> {
    const details = product?.details;

    if (!details || Array.isArray(details)) {
        return {};
    }

    return details;
}

export default function JewelleryFormFields({
    product,
    categories,
    brands,
    errors,
    processing,
    submitLabel,
}: JewelleryFormFieldsProps) {
    const [activeTab, setActiveTab] = useState<TabId>('details');
    const [name, setName] = useState(product?.name ?? '');
    const [sku, setSku] = useState(product?.sku ?? '');
    const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(Boolean(product?.sku));
    const [totalUploadError, setTotalUploadError] = useState<string | null>(null);
    const initialDetails = jewelleryDetails(product);

    const handleFormSubmitCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
        setTotalUploadError(null);
        const form = e.currentTarget.closest('form');
        if (!form) return;

        const fileInputs = form.querySelectorAll<HTMLInputElement>('input[type="file"]');
        let totalBytes = 0;
        fileInputs.forEach((input) => {
            if (input.files) {
                for (let i = 0; i < input.files.length; i++) {
                    totalBytes += input.files[i].size;
                }
            }
        });

        const maxTotalBytes = 20 * 1024 * 1024;
        if (totalBytes > maxTotalBytes) {
            e.preventDefault();
            setTotalUploadError(
                `Total image upload size (${formatFileSize(totalBytes)}) exceeds the maximum allowed 20 MB limit. Please reduce the number of images or optimize them before submitting.`,
            );
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (!isSkuManuallyEdited) {
            setSku(formatSku(newName));
        }
    };

    useEffect(() => {
        const errorTab = tabFromErrors(errors);

        if (errorTab) {
            setActiveTab(errorTab);
        }
    }, [errors]);

    return (
        <>
            <div className="flex flex-wrap gap-1 border-b pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            activeTab === tab.id
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <tab.icon className="size-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={cn('space-y-6', activeTab !== 'details' && 'hidden')}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="name">Jewellery name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={name}
                            onChange={handleNameChange}
                            required
                            placeholder="Gold plated necklace"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Category</Label>
                        <select
                            id="category_id"
                            name="category_id"
                            defaultValue={product?.category_id ?? ''}
                            required
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                        >
                            <option value="" disabled>
                                Select jewellery category
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="brand_id">Brand</Label>
                        <select
                            id="brand_id"
                            name="brand_id"
                            defaultValue={product?.brand_id ?? ''}
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                        >
                            <option value="">No brand</option>
                            {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.brand_id} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sku">SKU</Label>
                            {name.trim() !== '' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSku(formatSku(name));
                                        setIsSkuManuallyEdited(false);
                                    }}
                                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                                >
                                    Auto-generate
                                </button>
                            )}
                        </div>
                        <Input
                            id="sku"
                            name="sku"
                            value={sku}
                            onChange={(event) => {
                                setSku(event.target.value);
                                setIsSkuManuallyEdited(true);
                            }}
                            required
                            placeholder="JWL-001"
                        />
                        <InputError message={errors.sku} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            defaultValue={product?.status ?? 'active'}
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <InputError message={errors.status} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="original_price">Original price (MRP)</Label>
                        <Input
                            id="original_price"
                            name="original_price"
                            type="number"
                            min={0}
                            step="0.01"
                            defaultValue={product?.original_price}
                            required
                        />
                        <InputError message={errors.original_price} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sale_price">Sale price</Label>
                        <Input
                            id="sale_price"
                            name="sale_price"
                            type="number"
                            min={0}
                            step="0.01"
                            defaultValue={product?.sale_price}
                            required
                        />
                        <InputError message={errors.sale_price} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                            id="stock"
                            name="stock"
                            type="number"
                            min={0}
                            defaultValue={product?.stock ?? 0}
                            required
                        />
                        <InputError message={errors.stock} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                            id="weight"
                            name="weight"
                            type="number"
                            min={0}
                            step="0.01"
                            defaultValue={product?.weight ?? ''}
                            placeholder="0.01"
                        />
                        <InputError message={errors.weight} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="display_rating">Display rating</Label>
                        <Input
                            id="display_rating"
                            name="display_rating"
                            type="number"
                            min={0}
                            max={5}
                            step="0.1"
                            defaultValue={product?.display_rating ?? '0'}
                        />
                        <InputError message={errors.display_rating} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="display_review_count">Display review count</Label>
                        <Input
                            id="display_review_count"
                            name="display_review_count"
                            type="number"
                            min={0}
                            step="1"
                            defaultValue={product?.display_review_count ?? 0}
                        />
                        <InputError message={errors.display_review_count} />
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2">
                        <input type="hidden" name="is_featured" value="0" />
                        <input
                            id="is_featured"
                            name="is_featured"
                            type="checkbox"
                            value="1"
                            defaultChecked={product?.is_featured ?? false}
                            className="size-4 rounded border"
                        />
                        <Label htmlFor="is_featured">Featured jewellery</Label>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="short_description">Short description</Label>
                    <textarea
                        id="short_description"
                        name="short_description"
                        defaultValue={product?.short_description ?? ''}
                        rows={2}
                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                        placeholder="Brief summary for listings"
                    />
                    <InputError message={errors.short_description} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        name="description"
                        defaultValue={product?.description ?? ''}
                        rows={5}
                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                        placeholder="Full jewellery description"
                    />
                    <InputError message={errors.description} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="care_instructions">Care instructions</Label>
                    <textarea
                        id="care_instructions"
                        name="care_instructions"
                        defaultValue={product?.care_instructions ?? ''}
                        rows={3}
                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                        placeholder="Keep away from water, perfume, and chemicals"
                    />
                    <InputError message={errors.care_instructions} />
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-sm font-medium">Optional jewellery details</p>
                        <p className="text-xs text-muted-foreground">
                            Leave blank if not needed. These appear on the product page.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {jewelleryDetailFields.map((field) => (
                            <div key={field.key} className="grid gap-2">
                                <Label htmlFor={`details-${field.key}`}>{field.label}</Label>
                                <Input
                                    id={`details-${field.key}`}
                                    name={`details[${field.key}]`}
                                    defaultValue={initialDetails[field.key] ?? ''}
                                    placeholder={field.placeholder}
                                />
                                <InputError message={errors[`details.${field.key}`]} />
                            </div>
                        ))}
                    </div>
                </div>

                <MediaInput
                    label="Main / thumbnail image"
                    urlFieldName="thumbnail"
                    fileFieldName="thumbnail_file"
                    currentValue={product?.thumbnail}
                    errors={errors}
                />
            </div>

            <div className={cn('space-y-6', activeTab !== 'gallery' && 'hidden')}>
                <ProductGalleryField
                    initialImages={(product?.images ?? []).filter((image) => !image.color_value_id)}
                    errors={errors}
                />
            </div>

            {totalUploadError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
                    {totalUploadError}
                </div>
            )}

            <div className="flex items-center gap-3 border-t pt-4">
                <Button type="submit" onClick={handleFormSubmitCheck} disabled={processing}>
                    {processing && <Loader2 className="size-4 animate-spin" />}
                    {processing
                        ? submitLabel.toLowerCase().includes('create')
                            ? 'Creating...'
                            : 'Saving...'
                        : submitLabel}
                </Button>
            </div>
        </>
    );
}
