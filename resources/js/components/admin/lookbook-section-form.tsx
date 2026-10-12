import MediaInput from '@/components/admin/media-input';
import VideoInput from '@/components/admin/video-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LookbookSection } from '@/types/admin';

type LookbookSectionFormFieldsProps = {
    lookbookSection: LookbookSection;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function LookbookSectionFormFields({
    lookbookSection,
    errors,
    processing,
    submitLabel,
}: LookbookSectionFormFieldsProps) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="eyebrow">Eyebrow label</Label>
                <Input
                    id="eyebrow"
                    name="eyebrow"
                    defaultValue={lookbookSection.eyebrow}
                    required
                    placeholder="Lookbook"
                />
                <InputError message={errors.eyebrow} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="title">Heading</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={lookbookSection.title}
                    required
                    placeholder="Crafted for Modern Indian Fashion"
                />
                <InputError message={errors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <textarea
                    id="subtitle"
                    name="subtitle"
                    defaultValue={lookbookSection.subtitle ?? ''}
                    rows={3}
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    placeholder="Short supporting text"
                />
                <InputError message={errors.subtitle} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cta_label">Button label</Label>
                    <Input
                        id="cta_label"
                        name="cta_label"
                        defaultValue={lookbookSection.cta_label}
                        required
                    />
                    <InputError message={errors.cta_label} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="cta_href">Button link</Label>
                    <Input
                        id="cta_href"
                        name="cta_href"
                        defaultValue={lookbookSection.cta_href}
                        required
                        placeholder="/trending"
                    />
                    <InputError message={errors.cta_href} />
                </div>
            </div>

            <MediaInput
                label="Poster image (optional)"
                urlFieldName="poster_image"
                fileFieldName="poster_image_file"
                currentValue={lookbookSection.poster_image}
                errors={errors}
                urlPlaceholder="https://example.com/lookbook-poster.jpg"
            />

            <VideoInput
                label="Background video (optional)"
                urlFieldName="video_url"
                fileFieldName="video_url_file"
                currentValue={lookbookSection.video_url}
                errors={errors}
                urlPlaceholder="https://example.com/lookbook.mp4"
            />

            <div className="grid gap-2">
                <Label htmlFor="is_visible">Visibility on website</Label>
                <select
                    id="is_visible"
                    name="is_visible"
                    defaultValue={lookbookSection.is_visible ? '1' : '0'}
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
