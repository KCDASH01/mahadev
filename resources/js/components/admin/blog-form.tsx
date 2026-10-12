import MediaInput from '@/components/admin/media-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Blog } from '@/types/admin';

type BlogFormFieldsProps = {
    blog?: Blog;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

function formatDateInput(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toISOString().slice(0, 10);
}

export default function BlogFormFields({
    blog,
    errors,
    processing,
    submitLabel,
}: BlogFormFieldsProps) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={blog?.title}
                    required
                    placeholder="Blog post title"
                />
                <InputError message={errors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    name="slug"
                    defaultValue={blog?.slug}
                    placeholder="auto-generated-from-title"
                />
                <InputError message={errors.slug} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <textarea
                    id="excerpt"
                    name="excerpt"
                    defaultValue={blog?.excerpt}
                    required
                    rows={3}
                    placeholder="Short summary shown on the blog listing card"
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                />
                <InputError message={errors.excerpt} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="content">Full content</Label>
                <textarea
                    id="content"
                    name="content"
                    defaultValue={blog?.content ?? ''}
                    required
                    rows={8}
                    placeholder="Full article shown on the blog detail page"
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex min-h-[160px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                />
                <InputError message={errors.content} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                    id="category"
                    name="category"
                    defaultValue={blog?.category}
                    required
                    placeholder="Style Guide, Women, Kids, Trends..."
                />
                <InputError message={errors.category} />
            </div>

            <MediaInput
                label="Cover image"
                urlFieldName="image"
                fileFieldName="image_file"
                currentValue={blog?.image}
                errors={errors}
                urlPlaceholder="https://example.com/blog-cover.jpg"
            />

            <div className="grid gap-2">
                <Label htmlFor="published_at">Published date</Label>
                <Input
                    id="published_at"
                    name="published_at"
                    type="date"
                    defaultValue={formatDateInput(blog?.published_at)}
                />
                <InputError message={errors.published_at} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    name="status"
                    defaultValue={blog?.status ?? 'active'}
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
