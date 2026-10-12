import MediaInput from '@/components/admin/media-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category, CategoryOption } from '@/types/admin';

type CategoryFormFieldsProps = {
    category?: Category;
    parentCategories?: CategoryOption[];
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function CategoryFormFields({
    category,
    parentCategories = [],
    errors,
    processing,
    submitLabel,
}: CategoryFormFieldsProps) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="parent_id">Collection</Label>
                <select
                    id="parent_id"
                    name="parent_id"
                    defaultValue={category?.parent_id ?? ''}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                    <option value="">Top level</option>
                    {parentCategories.map((parent) => (
                        <option key={parent.id} value={parent.id}>
                            {parent.name}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground">
                    Choose Top level for Gents, Ladies, or Furniture collections.
                    Choose one of those collections to add a subcategory under it.
                </p>
                <InputError message={errors.parent_id} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={category?.name}
                    required
                    placeholder="Category name"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    name="slug"
                    defaultValue={category?.slug}
                    placeholder="Auto-generated from name if empty"
                />
                <InputError message={errors.slug} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="nav_group">Navigation group</Label>
                <Input
                    id="nav_group"
                    name="nav_group"
                    defaultValue={category?.nav_group ?? ''}
                    placeholder="e.g. Topwear, Ethnic, Western"
                />
                <p className="text-xs text-muted-foreground">
                    Optional column heading in the header mega menu.
                </p>
                <InputError message={errors.nav_group} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="sort_order">Sort order</Label>
                <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    min={0}
                    defaultValue={category?.sort_order ?? 0}
                />
                <InputError message={errors.sort_order} />
            </div>

            <MediaInput
                label="Image"
                urlFieldName="image"
                fileFieldName="image_file"
                currentValue={category?.image}
                errors={errors}
                urlPlaceholder="https://example.com/image.jpg"
            />

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    name="description"
                    defaultValue={category?.description ?? ''}
                    rows={4}
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                    placeholder="Category description"
                />
                <InputError message={errors.description} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="is_featured">Homepage featured</Label>
                <select
                    id="is_featured"
                    name="is_featured"
                    defaultValue={category?.is_featured ? '1' : '0'}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                    <option value="1">Show in Shop Popular Categories</option>
                    <option value="0">Hidden from homepage</option>
                </select>
                <p className="text-xs text-muted-foreground">
                    Only applies to subcategories under Gents, Ladies, or Furniture.
                </p>
                <InputError message={errors.is_featured} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    name="status"
                    defaultValue={category?.status ?? 'active'}
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
