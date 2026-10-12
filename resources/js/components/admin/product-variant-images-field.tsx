import { Link2, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import MediaInput from '@/components/admin/media-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    compressImage,
    validateImageFile,
} from '@/lib/image-compression';
import { mediaUrl } from '@/lib/media-url';
import type { ProductImage } from '@/types/admin';

type VariantImageRow = {
    key: string;
    id?: number;
    image?: string | null;
    sort_order: number;
    file?: File;
};

type ProductVariantImagesFieldProps = {
    variantIndex: number;
    colorValueId: string;
    colorLabel?: string;
    canManage?: boolean;
    initialImages?: ProductImage[];
    errors?: Record<string, string>;
};

function createRow(image?: ProductImage, index = 0): VariantImageRow {
    return {
        key: image ? `existing-${image.id}` : `new-${crypto.randomUUID()}`,
        id: image?.id,
        image: image?.image ?? null,
        sort_order: image?.sort_order ?? index,
    };
}

export default function ProductVariantImagesField({
    variantIndex,
    colorValueId,
    colorLabel = 'this color',
    canManage = true,
    initialImages = [],
    errors = {},
}: ProductVariantImagesFieldProps) {
    const images = initialImages ?? [];
    const [rows, setRows] = useState<VariantImageRow[]>(
        images.length > 0
            ? images.map((image, index) => createRow(image, index))
            : [],
    );
    const multiFileRef = useRef<HTMLInputElement>(null);

    const addUrlRow = () => {
        setRows((current) => [...current, createRow(undefined, current.length)]);
    };

    const handleMultiFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newRows: VariantImageRow[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const validation = validateImageFile(file, 10);
            if (!validation.valid) continue;

            try {
                const result = await compressImage(file, {
                    maxInitialSizeMb: 10,
                    maxWidth: 2000,
                    maxHeight: 2000,
                    targetQuality: 0.85,
                });

                newRows.push({
                    key: `new-${crypto.randomUUID()}`,
                    sort_order: rows.length + newRows.length,
                    file: result.file,
                });
            } catch {
                if (file.size <= 10 * 1024 * 1024) {
                    newRows.push({
                        key: `new-${crypto.randomUUID()}`,
                        sort_order: rows.length + newRows.length,
                        file,
                    });
                }
            }
        }

        if (newRows.length > 0) {
            setRows((current) => [...current, ...newRows]);
        }

        if (multiFileRef.current) {
            multiFileRef.current.value = '';
        }
    };

    const removeRow = (key: string) => {
        setRows((current) => current.filter((row) => row.key !== key));
    };

    if (!colorValueId) {
        return (
            <p className="text-xs text-muted-foreground">
                Select a color above to attach shared color gallery images.
            </p>
        );
    }

    if (!canManage) {
        return (
            <div className="space-y-3">
                <div>
                    <Label>{colorLabel} Images</Label>
                    <p className="text-xs text-muted-foreground">
                        These images are shared by all sizes of this color.
                    </p>
                </div>
                {images.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                        No shared images for this color yet.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {images.map((image) => (
                            <img
                                key={image.id}
                                src={mediaUrl(image.image) ?? image.image}
                                alt=""
                                className="h-20 w-20 rounded-md border object-cover"
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <input
                type="hidden"
                name={`variants[${variantIndex}][sync_images]`}
                value="1"
            />
            <div className="flex items-center justify-between gap-3">
                <div>
                    <Label>{colorLabel} Images</Label>
                    <p className="text-xs text-muted-foreground">
                        These images are shared by all sizes of this color.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => multiFileRef.current?.click()}
                    >
                        <Plus className="size-3.5" />
                        Add Images
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addUrlRow}
                        title="Add image by URL"
                    >
                        <Link2 className="size-3.5" />
                    </Button>
                </div>
            </div>

            <input
                ref={multiFileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={handleMultiFileSelect}
            />

            {rows.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    No images for this color yet.
                </p>
            )}

            {rows.map((row, imageIndex) => (
                <div
                    key={row.key}
                    className="space-y-3 rounded-md border border-dashed p-3"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Image {imageIndex + 1}</p>
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
                            name={`variants[${variantIndex}][images][${imageIndex}][id]`}
                            value={row.id}
                        />
                    )}

                    <input
                        type="hidden"
                        name={`variants[${variantIndex}][images][${imageIndex}][color_value_id]`}
                        value={colorValueId}
                    />

                    <div className="grid gap-2 sm:max-w-xs">
                        <Label htmlFor={`variant-${variantIndex}-image-sort-${imageIndex}`}>
                            Sort order
                        </Label>
                        <Input
                            id={`variant-${variantIndex}-image-sort-${imageIndex}`}
                            name={`variants[${variantIndex}][images][${imageIndex}][sort_order]`}
                            type="number"
                            min={0}
                            defaultValue={row.sort_order}
                        />
                    </div>

                    <MediaInput
                        label="Variant image"
                        urlFieldName={`variants[${variantIndex}][images][${imageIndex}][image]`}
                        fileFieldName={`variants[${variantIndex}][images][${imageIndex}][file]`}
                        currentValue={row.image}
                        errors={errors}
                        initialFile={row.file}
                    />
                </div>
            ))}

            {rows.length > 0 && (
                <div className="flex justify-end gap-2 pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => multiFileRef.current?.click()}
                    >
                        <Plus className="size-3.5" />
                        Add Images
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addUrlRow}
                        title="Add image by URL"
                    >
                        <Link2 className="size-3.5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
