import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type ProductOfferRow = {
    title: string;
    detail: string;
    code: string;
};

type OfferRow = ProductOfferRow & {
    key: string;
};

type ProductOffersFieldProps = {
    initialOffers?: ProductOfferRow[];
    errors?: Record<string, string>;
};

function createRow(offer?: ProductOfferRow): OfferRow {
    return {
        key: offer ? `existing-${offer.code}-${offer.title}` : `new-${crypto.randomUUID()}`,
        title: offer?.title ?? '',
        detail: offer?.detail ?? '',
        code: offer?.code ?? '',
    };
}

export default function ProductOffersField({
    initialOffers = [],
    errors = {},
}: ProductOffersFieldProps) {
    const offers = initialOffers ?? [];
    const [rows, setRows] = useState<OfferRow[]>(
        offers.length > 0 ? offers.map((offer) => createRow(offer)) : [],
    );

    const addRow = () => {
        setRows((current) => [...current, createRow()]);
    };

    const removeRow = (key: string) => {
        setRows((current) => current.filter((row) => row.key !== key));
    };

    const updateRow = (key: string, patch: Partial<OfferRow>) => {
        setRows((current) =>
            current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label>Product Offers</Label>
                    <p className="text-xs text-muted-foreground">
                        Optional. Shown on the product details page. The first offer is
                        visible by default; shoppers can expand to see more.
                    </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <Plus className="size-3.5" />
                    Add Offer
                </Button>
            </div>

            {rows.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No product-specific offers. Active store coupons will be used as a
                    fallback on the storefront.
                </p>
            )}

            {rows.map((row, index) => (
                <div key={row.key} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Offer {index + 1}</p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(row.key)}
                        >
                            <Trash2 className="size-3.5" />
                            Remove
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor={`offer-title-${index}`}>Title</Label>
                            <Input
                                id={`offer-title-${index}`}
                                name={`offers[${index}][title]`}
                                value={row.title}
                                onChange={(event) =>
                                    updateRow(row.key, { title: event.target.value })
                                }
                                placeholder="Get Flat 5% OFF"
                            />
                            <InputError message={errors[`offers.${index}.title`]} />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor={`offer-detail-${index}`}>Condition / detail</Label>
                            <Input
                                id={`offer-detail-${index}`}
                                name={`offers[${index}][detail]`}
                                value={row.detail}
                                onChange={(event) =>
                                    updateRow(row.key, { detail: event.target.value })
                                }
                                placeholder="Add items worth ₹499 or more to unlock this offer"
                            />
                            <InputError message={errors[`offers.${index}.detail`]} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`offer-code-${index}`}>Coupon code</Label>
                            <Input
                                id={`offer-code-${index}`}
                                name={`offers[${index}][code]`}
                                value={row.code}
                                onChange={(event) =>
                                    updateRow(row.key, { code: event.target.value })
                                }
                                placeholder="HOME5"
                            />
                            <InputError message={errors[`offers.${index}.code`]} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
