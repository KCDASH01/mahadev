import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import type { AttributeValueOption, CategoryFilterAttribute, CategoryFilterAttributesMap } from '@/types/admin';

type ProductFilterAttributesFieldProps = {
    categoryId: number | '';
    categoryFilterAttributes: CategoryFilterAttributesMap;
    initialValues?: AttributeValueOption[];
    errors: Record<string, string>;
};

function buildInitialSelections(
    attributes: CategoryFilterAttribute[],
    initialValues: AttributeValueOption[] = [],
): Record<string, number | ''> {
    const selections: Record<string, number | ''> = {};

    for (const attribute of attributes) {
        selections[attribute.slug] = '';
    }

    for (const value of initialValues) {
        const slug = value.attribute?.slug;

        if (slug && attributes.some((attribute) => attribute.slug === slug)) {
            selections[slug] = value.id;
        }
    }

    return selections;
}

export default function ProductFilterAttributesField({
    categoryId,
    categoryFilterAttributes,
    initialValues = [],
    errors,
}: ProductFilterAttributesFieldProps) {
    const attributes = useMemo(
        () => (categoryId ? categoryFilterAttributes[categoryId] ?? [] : []),
        [categoryFilterAttributes, categoryId],
    );

    const [selections, setSelections] = useState<Record<string, number | ''>>(() =>
        buildInitialSelections(attributes, initialValues),
    );

    const selectedIds = Object.values(selections).filter((value): value is number => typeof value === 'number');

    if (!categoryId) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Select a category to configure filter attributes such as fit, material, and pattern.
            </div>
        );
    }

    if (attributes.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                This category has no filter attributes configured. Color and size are managed in Product Variants.
            </div>
        );
    }

    return (
        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
            <div>
                <h3 className="text-sm font-semibold">Filter attributes</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                    Used on collection pages for filtering. Color and size stay in the Product Variants tab.
                </p>
            </div>

            {selectedIds.map((id) => (
                <input key={id} type="hidden" name="filter_attribute_value_ids[]" value={id} />
            ))}

            <div className="grid gap-4 sm:grid-cols-2">
                {attributes.map((attribute) => (
                    <div key={attribute.slug} className="grid gap-2">
                        <Label htmlFor={`filter-attribute-${attribute.slug}`}>
                            {attribute.name}
                            {attribute.isRequired && <span className="text-destructive"> *</span>}
                        </Label>
                        <select
                            id={`filter-attribute-${attribute.slug}`}
                            value={selections[attribute.slug] ?? ''}
                            onChange={(event) => {
                                const nextValue = event.target.value ? Number(event.target.value) : '';

                                setSelections((current) => ({
                                    ...current,
                                    [attribute.slug]: nextValue,
                                }));
                            }}
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                        >
                            <option value="">
                                {attribute.isRequired ? `Select ${attribute.name.toLowerCase()}` : 'Not specified'}
                            </option>
                            {attribute.values.map((value) => (
                                <option key={value.id} value={value.id}>
                                    {value.value}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <InputError message={errors.filter_attribute_value_ids} />
        </div>
    );
}
