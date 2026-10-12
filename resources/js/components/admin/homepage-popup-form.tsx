import MediaInput from '@/components/admin/media-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { HomepagePopup } from '@/types/admin';

type HomepagePopupFormFieldsProps = {
    homepagePopup: HomepagePopup;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function HomepagePopupFormFields({
    homepagePopup,
    errors,
    processing,
    submitLabel,
}: HomepagePopupFormFieldsProps) {
    return (
        <>
            <MediaInput
                label="Popup image (desktop)"
                urlFieldName="image"
                fileFieldName="image_file"
                currentValue={homepagePopup.image}
                errors={errors}
                urlPlaceholder="https://example.com/popup.jpg"
                maxSizeMb={20}
                helperText="JPG, PNG, GIF, or WebP up to 20MB. Recommended: 900 × 1100 px (portrait). Shown after about 4.5 seconds on the homepage."
            />

            <MediaInput
                label="Popup image (mobile, optional)"
                urlFieldName="mobile_image"
                fileFieldName="mobile_image_file"
                currentValue={homepagePopup.mobile_image}
                errors={errors}
                urlPlaceholder="https://example.com/popup-mobile.jpg"
                maxSizeMb={20}
                helperText="Optional. Shown on phones (under 768px). If empty, the desktop image is used. Recommended: 800 × 1000 px."
            />

            <div className="grid gap-2">
                <Label htmlFor="link">Link (optional)</Label>
                <Input
                    id="link"
                    name="link"
                    defaultValue={homepagePopup.link ?? ''}
                    placeholder="/collection/women or https://example.com/offer"
                />
                <p className="text-xs text-muted-foreground">
                    Leave empty if the popup should not be clickable. Use a site path
                    like /collection/women or a full https:// URL.
                </p>
                <InputError message={errors.link} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="is_visible">Visibility on website</Label>
                <select
                    id="is_visible"
                    name="is_visible"
                    defaultValue={homepagePopup.is_visible ? '1' : '0'}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                    <option value="1">Visible</option>
                    <option value="0">Hidden</option>
                </select>
                <p className="text-xs text-muted-foreground">
                    Hidden popups never appear. Visible popups still need an image.
                </p>
                <InputError message={errors.is_visible} />
            </div>

            <Button type="submit" disabled={processing}>
                {submitLabel}
            </Button>
        </>
    );
}
