import MediaInput from '@/components/admin/media-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Testimonial } from '@/types/admin';

type TestimonialFormFieldsProps = {
    testimonial?: Testimonial;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function TestimonialFormFields({
    testimonial,
    errors,
    processing,
    submitLabel,
}: TestimonialFormFieldsProps) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="name">Customer name</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={testimonial?.name}
                        required
                        placeholder="Ananya Sharma"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                        id="rating"
                        name="rating"
                        type="number"
                        min={1}
                        max={5}
                        step={0.1}
                        defaultValue={testimonial?.rating ?? 5}
                        required
                    />
                    <InputError message={errors.rating} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="headline">Headline quote</Label>
                <Input
                    id="headline"
                    name="headline"
                    defaultValue={testimonial?.headline}
                    required
                    placeholder="Premium quality, every time!"
                />
                <InputError message={errors.headline} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="body">Testimonial text</Label>
                <textarea
                    id="body"
                    name="body"
                    defaultValue={testimonial?.body}
                    required
                    rows={4}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    placeholder="Share what the customer loved about Mahadev."
                />
                <InputError message={errors.body} />
            </div>

            <MediaInput
                label="Scene image"
                urlFieldName="scene_image"
                fileFieldName="scene_image_file"
                currentValue={testimonial?.scene_image}
                errors={errors}
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="sort_order">Sort order</Label>
                    <Input
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        min={0}
                        defaultValue={testimonial?.sort_order ?? 0}
                    />
                    <InputError message={errors.sort_order} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={testimonial?.status ?? 'active'}
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <InputError message={errors.status} />
                </div>
            </div>

            <Button type="submit" disabled={processing}>
                {submitLabel}
            </Button>
        </>
    );
}
