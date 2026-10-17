import { useState } from 'react';
import MediaInput from '@/components/admin/media-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SocialStory } from '@/types/admin';

type SocialStoryFormFieldsProps = {
    socialStory?: SocialStory;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function SocialStoryFormFields({
    socialStory,
    errors,
    processing,
    submitLabel,
}: SocialStoryFormFieldsProps) {
    const [type, setType] = useState<'image' | 'video'>(socialStory?.type ?? 'image');

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="title">Admin label</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={socialStory?.title}
                    required
                    placeholder="End of Season Sale"
                />
                <InputError message={errors.title} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="type">Story type</Label>
                    <select
                        id="type"
                        name="type"
                        value={type}
                        onChange={(event) => setType(event.target.value as 'image' | 'video')}
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                    </select>
                    <InputError message={errors.type} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="sort_order">Sort order</Label>
                    <Input
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        min={0}
                        defaultValue={socialStory?.sort_order ?? 0}
                    />
                    <InputError message={errors.sort_order} />
                </div>
            </div>

            <MediaInput
                label={type === 'video' ? 'Poster image' : 'Story image'}
                urlFieldName="image"
                fileFieldName="image_file"
                currentValue={socialStory?.image}
                errors={errors}
            />

            {type === 'video' && (
                <div className="grid gap-2">
                    <Label htmlFor="video_url">Video URL</Label>
                    <Input
                        id="video_url"
                        name="video_url"
                        defaultValue={socialStory?.video_url ?? ''}
                        placeholder="https://example.com/story.mp4"
                    />
                    <InputError message={errors.video_url} />
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="link_url">Optional link URL</Label>
                <Input
                    id="link_url"
                    name="link_url"
                    defaultValue={socialStory?.link_url ?? ''}
                    placeholder="/trending"
                />
                <InputError message={errors.link_url} />
            </div>

            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <div>
                    <h3 className="text-sm font-semibold">Promo overlay</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Optional text overlay shown in the story modal and thumbnail promo.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="overlay_eyebrow">Eyebrow</Label>
                        <Input
                            id="overlay_eyebrow"
                            name="overlay_eyebrow"
                            defaultValue={socialStory?.overlay_eyebrow ?? ''}
                            placeholder="END OF SEASON"
                        />
                        <InputError message={errors.overlay_eyebrow} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="overlay_title">Title</Label>
                        <Input
                            id="overlay_title"
                            name="overlay_title"
                            defaultValue={socialStory?.overlay_title ?? ''}
                            placeholder="SALE"
                        />
                        <InputError message={errors.overlay_title} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="overlay_discount">Discount text</Label>
                    <Input
                        id="overlay_discount"
                        name="overlay_discount"
                        defaultValue={socialStory?.overlay_discount ?? ''}
                        placeholder="UPTO 50% OFF"
                    />
                    <InputError message={errors.overlay_discount} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="overlay_note">Note</Label>
                    <textarea
                        id="overlay_note"
                        name="overlay_note"
                        defaultValue={socialStory?.overlay_note ?? ''}
                        rows={2}
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    />
                    <InputError message={errors.overlay_note} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="overlay_hashtag">Hashtag</Label>
                    <Input
                        id="overlay_hashtag"
                        name="overlay_hashtag"
                        defaultValue={socialStory?.overlay_hashtag ?? ''}
                        placeholder="#STYLEWITHMAHADEV"
                    />
                    <InputError message={errors.overlay_hashtag} />
                </div>

                <div className="flex items-center gap-2">
                    <input type="hidden" name="show_thumbnail_promo" value="0" />
                    <input
                        id="show_thumbnail_promo"
                        name="show_thumbnail_promo"
                        type="checkbox"
                        value="1"
                        defaultChecked={socialStory?.show_thumbnail_promo ?? false}
                        className="size-4 rounded border"
                    />
                    <Label htmlFor="show_thumbnail_promo">Show promo overlay on thumbnail</Label>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    name="status"
                    defaultValue={socialStory?.status ?? 'active'}
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
