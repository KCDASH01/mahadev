import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminColor, ColorType } from '@/types/admin';

type ColorFormFieldsProps = {
    color?: AdminColor;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function ColorFormFields({
    color,
    errors,
    processing,
    submitLabel,
}: ColorFormFieldsProps) {
    const [colorType, setColorType] = useState<ColorType>(() => color?.type ?? 'solid');
    const [hexValue, setHexValue] = useState<string>(() => color?.hex ?? '');

    const handleTypeChange = (newType: ColorType) => {
        setColorType(newType);
        if (newType !== 'solid') {
            setHexValue('');
        }
    };

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="value">Color name</Label>
                <Input
                    id="value"
                    name="value"
                    defaultValue={color?.value}
                    required
                    placeholder="e.g. Cherry Red, Multicolor, Floral"
                />
                <InputError message={errors.value} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="type">Color type</Label>
                <select
                    id="type"
                    name="type"
                    value={colorType}
                    onChange={(e) => handleTypeChange(e.target.value as ColorType)}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                    <option value="solid">Solid (Single Color)</option>
                    <option value="multicolor">Multicolor (Multiple Colors / Print)</option>
                    <option value="pattern">Pattern (Floral, Striped, Checked, etc.)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                    {colorType === 'solid' && 'Single color products with a HEX swatch code.'}
                    {colorType === 'multicolor' && 'Products containing multiple colors or graphic prints.'}
                    {colorType === 'pattern' && 'Products where design/pattern is key (Floral, Camo, Striped, etc.).'}
                </p>
                <InputError message={errors.type} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    name="slug"
                    defaultValue={color?.slug}
                    placeholder="Auto-generated from name if empty"
                />
                <InputError message={errors.slug} />
            </div>

            {colorType === 'solid' ? (
                <div className="grid gap-2">
                    <Label htmlFor="hex">
                        Hex color <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                        <Input
                            id="hex"
                            name="hex"
                            value={hexValue}
                            onChange={(e) => setHexValue(e.target.value)}
                            required={colorType === 'solid'}
                            placeholder="#FF6A00"
                            className="max-w-[180px]"
                        />
                        <input
                            type="color"
                            aria-label="Pick color"
                            value={hexValue && /^#([A-Fa-f0-9]{6})$/.test(hexValue) ? hexValue : '#FF6A00'}
                            className="h-9 w-12 cursor-pointer rounded border bg-transparent p-1"
                            onChange={(event) => {
                                setHexValue(event.target.value.toUpperCase());
                            }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Used for color swatches on the product page. Example: #DC2626
                    </p>
                    <InputError message={errors.hex} />
                </div>
            ) : (
                <input type="hidden" name="hex" value="" />
            )}

            <div className="grid gap-2">
                <Label htmlFor="sort_order">Sort order</Label>
                <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    min={0}
                    defaultValue={color?.sort_order ?? 0}
                />
                <InputError message={errors.sort_order} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    name="status"
                    defaultValue={color?.status ?? 'active'}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <InputError message={errors.status} />
            </div>

            <Button type="submit" disabled={processing}>
                {submitLabel}
            </Button>
        </>
    );
}
