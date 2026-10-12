import MediaInput from '@/components/admin/media-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Brand } from '@/types/admin';

type BrandFormFieldsProps = {
    brand?: Brand;
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function BrandFormFields({
    brand,
    errors,
    processing,
    submitLabel,
}: BrandFormFieldsProps) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={brand?.name}
                    required
                    placeholder="Brand name"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    name="slug"
                    defaultValue={brand?.slug}
                    placeholder="Auto-generated from name if empty"
                />
                <InputError message={errors.slug} />
            </div>

            <MediaInput
                label="Logo"
                urlFieldName="logo"
                fileFieldName="logo_file"
                currentValue={brand?.logo}
                errors={errors}
                urlPlaceholder="https://example.com/logo.png"
            />

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    name="description"
                    defaultValue={brand?.description ?? ''}
                    rows={4}
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                    placeholder="Brand description"
                />
                <InputError message={errors.description} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    name="status"
                    defaultValue={brand?.status ?? 'active'}
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
