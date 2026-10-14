import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { compressImage, formatFileSize } from '@/lib/image-compression';
import { mediaUrl } from '@/lib/media-url';
import type { PromoStrip } from '@/types/admin';

type PromoStripFormFieldsProps = {
    promoStrip: PromoStrip;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

const MAX_UPLOAD_BYTES = Math.floor(1.8 * 1024 * 1024);

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
    const desktopInputRef = useRef<HTMLInputElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(initialPreview);
    const [mobilePreview, setMobilePreview] = useState<string | null>(initialMobilePreview);
    const [localError, setLocalError] = useState<string | null>(null);
    const [mobileLocalError, setMobileLocalError] = useState<string | null>(null);
    const [desktopNote, setDesktopNote] = useState<string | null>(null);
    const [mobileNote, setMobileNote] = useState<string | null>(null);
    const [optimizing, setOptimizing] = useState<'desktop' | 'mobile' | null>(null);

    const handleFileChange = async (
        event: ChangeEvent<HTMLInputElement>,
        kind: 'desktop' | 'mobile',
    ) => {
        const file = event.target.files?.[0];
        const input = kind === 'desktop' ? desktopInputRef.current : mobileInputRef.current;
        const fallback = kind === 'desktop' ? initialPreview : initialMobilePreview;
        const setError = kind === 'desktop' ? setLocalError : setMobileLocalError;
        const setImagePreview = kind === 'desktop' ? setPreview : setMobilePreview;
        const setNote = kind === 'desktop' ? setDesktopNote : setMobileNote;

        if (!file) {
            setError(null);
            setNote(null);
            setImagePreview(fallback);

            return;
        }

        setError(null);
        setNote(null);
        setOptimizing(kind);

        try {
            const result = await compressImage(file, {
                maxInitialSizeMb: 20,
                maxWidth: kind === 'desktop' ? 1920 : 1080,
                maxHeight: kind === 'desktop' ? 720 : 1080,
                targetQuality: 0.82,
                maxOutputBytes: MAX_UPLOAD_BYTES,
            });

            if (input && typeof DataTransfer !== 'undefined') {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(result.file);
                input.files = dataTransfer.files;
            }

            setImagePreview(URL.createObjectURL(result.file));
            setNote(
                result.savedBytes > 0
                    ? `Resized for upload: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}.`
                    : `Ready to upload (${formatFileSize(result.compressedSize)}).`,
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Image optimization failed.';
            setError(message);
            setImagePreview(fallback);
            if (input) {
                input.value = '';
            }
        } finally {
            setOptimizing(null);
        }
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
                    ref={desktopInputRef}
                    id="image_file"
                    name="image_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={optimizing !== null}
                    onChange={(event) => handleFileChange(event, 'desktop')}
                />
                <p className="text-xs text-muted-foreground">
                    JPG, PNG, or WebP. Large files are resized to about 1920 × 720 px
                    and compressed before upload. Recommended banner: 1920 × 360 px.
                </p>
                {desktopNote && <p className="text-xs text-emerald-700">{desktopNote}</p>}
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
                    ref={mobileInputRef}
                    id="mobile_image_file"
                    name="mobile_image_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={optimizing !== null}
                    onChange={(event) => handleFileChange(event, 'mobile')}
                />
                <p className="text-xs text-muted-foreground">
                    Optional. Shown on phones (under 768px). If empty, the desktop
                    image is used. Large files are resized to about 1080 px wide
                    before upload.
                </p>
                {mobileNote && <p className="text-xs text-emerald-700">{mobileNote}</p>}
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

            <Button type="submit" disabled={processing || optimizing !== null}>
                {optimizing ? 'Resizing image...' : submitLabel}
            </Button>
        </>
    );
}
