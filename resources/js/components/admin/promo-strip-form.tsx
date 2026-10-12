import { useMemo, useState, type ChangeEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mediaUrl } from '@/lib/media-url';
import type { PromoStrip } from '@/types/admin';

type PromoStripFormFieldsProps = {
    promoStrip: PromoStrip;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function PromoStripFormFields({
    promoStrip,
    errors,
    processing,
    submitLabel,
}: PromoStripFormFieldsProps) {
    const initialPreview = useMemo(
        () => mediaUrl(promoStrip.image),
        [promoStrip.image],
    );
    const initialMobilePreview = useMemo(
        () => mediaUrl(promoStrip.mobile_image),
        [promoStrip.mobile_image],
    );
    const [preview, setPreview] = useState<string | null>(initialPreview);
    const [mobilePreview, setMobilePreview] = useState<string | null>(initialMobilePreview);
    const [localError, setLocalError] = useState<string | null>(null);
    const [mobileLocalError, setMobileLocalError] = useState<string | null>(null);
    const maxSizeMb = 20;
    const maxBytes = maxSizeMb * 1024 * 1024;

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>,
        kind: 'desktop' | 'mobile',
    ) => {
        const file = event.target.files?.[0];
        const fallback = kind === 'desktop' ? initialPreview : initialMobilePreview;
        const setError = kind === 'desktop' ? setLocalError : setMobileLocalError;
        const setImagePreview = kind === 'desktop' ? setPreview : setMobilePreview;

        if (!file) {
            setError(null);
            setImagePreview(fallback);

            return;
        }

        if (file.size > maxBytes) {
            setError(
                `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum size is ${maxSizeMb} MB.`,
            );
            event.target.value = '';
            setImagePreview(fallback);

            return;
        }

        setError(null);
        setImagePreview(URL.createObjectURL(file));
    };

    return (
        <>
            <div className="grid gap-3">
                <Label htmlFor="image_file">Promo strip image (desktop)</Label>
                {preview && (
                    <img
                        src={preview}
                        alt="Promo strip preview"
                        className="block h-auto w-full max-w-2xl rounded-md border object-contain"
                    />
                )}
                <Input
                    id="image_file"
                    name="image_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => handleFileChange(event, 'desktop')}
                />
                <p className="text-xs text-muted-foreground">
                    JPG, PNG, or WebP up to {maxSizeMb}MB. Recommended size: 1920 ×
                    360 px (full-width horizontal banner).
                </p>
                <InputError message={localError ?? errors.image_file} />
            </div>

            <div className="grid gap-3">
                <Label htmlFor="mobile_image_file">Promo strip image (mobile)</Label>
                {mobilePreview && (
                    <img
                        src={mobilePreview}
                        alt="Mobile promo strip preview"
                        className="block h-auto w-full max-w-sm rounded-md border object-contain"
                    />
                )}
                <Input
                    id="mobile_image_file"
                    name="mobile_image_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => handleFileChange(event, 'mobile')}
                />
                <p className="text-xs text-muted-foreground">
                    Optional. Shown on phones (under 768px). If empty, the desktop
                    image is used. Recommended size: 1080 × 720 px.
                </p>
                <InputError message={mobileLocalError ?? errors.mobile_image_file} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="is_visible">Visibility on website</Label>
                <select
                    id="is_visible"
                    name="is_visible"
                    defaultValue={promoStrip.is_visible ? '1' : '0'}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                    <option value="1">Visible</option>
                    <option value="0">Hidden</option>
                </select>
                <InputError message={errors.is_visible} />
            </div>

            <Button type="submit" disabled={processing}>
                {submitLabel}
            </Button>
        </>
    );
}
