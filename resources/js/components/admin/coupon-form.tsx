import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Coupon, SelectOption } from '@/types/admin';

type CouponTypeOption = {
    value: string;
    label: string;
};

type CouponFormFieldsProps = {
    coupon?: Coupon;
    categories: SelectOption[];
    products: SelectOption[];
    couponTypes: CouponTypeOption[];
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
};

export default function CouponFormFields({
    coupon,
    categories,
    products,
    couponTypes,
    errors,
    processing,
    submitLabel,
}: CouponFormFieldsProps) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input id="code" name="code" defaultValue={coupon?.code} required placeholder="WELCOME10" />
                    <InputError message={errors.code} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="type">Coupon Type</Label>
                    <select
                        id="type"
                        name="type"
                        defaultValue={coupon?.type ?? 'percentage'}
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    >
                        {couponTypes.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.type} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={coupon?.title ?? ''} placeholder="Flat 10% OFF on First Order" />
                <InputError message={errors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    name="description"
                    defaultValue={coupon?.description ?? ''}
                    rows={3}
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    placeholder="Shown on cart offer cards"
                />
                <InputError message={errors.description} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="value">Discount Value</Label>
                    <Input id="value" name="value" type="number" step="0.01" defaultValue={coupon?.value ?? ''} placeholder="10 or 200" />
                    <InputError message={errors.value} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="minimum_amount">Minimum Cart Value</Label>
                    <Input
                        id="minimum_amount"
                        name="minimum_amount"
                        type="number"
                        step="0.01"
                        defaultValue={coupon?.minimum_amount ?? ''}
                        placeholder="999"
                    />
                    <InputError message={errors.minimum_amount} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="max_discount">Maximum Discount</Label>
                    <Input
                        id="max_discount"
                        name="max_discount"
                        type="number"
                        step="0.01"
                        defaultValue={coupon?.max_discount ?? ''}
                        placeholder="500"
                    />
                    <InputError message={errors.max_discount} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="usage_limit">Total Usage Limit</Label>
                    <Input id="usage_limit" name="usage_limit" type="number" defaultValue={coupon?.usage_limit ?? ''} />
                    <InputError message={errors.usage_limit} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="per_user_limit">Per User Limit</Label>
                    <Input id="per_user_limit" name="per_user_limit" type="number" defaultValue={coupon?.per_user_limit ?? ''} />
                    <InputError message={errors.per_user_limit} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="buy_quantity">Buy Quantity (Buy X Get Y)</Label>
                    <Input id="buy_quantity" name="buy_quantity" type="number" defaultValue={coupon?.buy_quantity ?? ''} />
                    <InputError message={errors.buy_quantity} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="get_quantity">Get Quantity (Buy X Get Y)</Label>
                    <Input id="get_quantity" name="get_quantity" type="number" defaultValue={coupon?.get_quantity ?? ''} />
                    <InputError message={errors.get_quantity} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="starts_at">Start Date</Label>
                    <Input id="starts_at" name="starts_at" type="date" defaultValue={coupon?.starts_at?.slice(0, 10) ?? ''} />
                    <InputError message={errors.starts_at} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="expiry_date">Expiry Date</Label>
                    <Input id="expiry_date" name="expiry_date" type="date" defaultValue={coupon?.expiry_date?.slice(0, 10) ?? ''} />
                    <InputError message={errors.expiry_date} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="category_ids">Category Scope (optional)</Label>
                <select
                    id="category_ids"
                    name="category_ids[]"
                    multiple
                    defaultValue={coupon?.category_ids?.map(String) ?? []}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <InputError message={errors.category_ids} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="product_ids">Product Scope (optional)</Label>
                <select
                    id="product_ids"
                    name="product_ids[]"
                    multiple
                    defaultValue={coupon?.product_ids?.map(String) ?? []}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
                <InputError message={errors.product_ids} />
            </div>

            <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="first_order_only" value="1" defaultChecked={coupon?.first_order_only} />
                    First order only
                </label>
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={coupon?.status ?? 'active'}
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
