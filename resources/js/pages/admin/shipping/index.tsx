import { Form, Head } from '@inertiajs/react';
import { Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/components/admin/commerce-utils';
import StatusBadge from '@/components/admin/status-badge';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ShippingRule = {
    id: number;
    min_amount: number;
    max_amount: number | null;
    shipping_charge: number;
    is_active: boolean;
};

type ShippingSettings = {
    cod_enabled: boolean;
    default_delivery_days: number;
};

type ShippingErrors = Partial<
    Record<'min_amount' | 'max_amount' | 'shipping_charge' | 'is_active', string>
>;

function RuleFields({
    rule,
    errors,
}: {
    rule?: ShippingRule;
    errors: ShippingErrors;
}) {
    return (
        <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="min_amount">Minimum amount (₹)</Label>
                    <Input
                        id="min_amount"
                        name="min_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={rule?.min_amount ?? ''}
                        required
                    />
                    <InputError message={errors.min_amount} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="max_amount">Maximum amount (₹)</Label>
                    <Input
                        id="max_amount"
                        name="max_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={rule?.max_amount ?? ''}
                        placeholder="Leave empty for no upper limit"
                    />
                    <InputError message={errors.max_amount} />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="shipping_charge">Shipping charge (₹)</Label>
                    <Input
                        id="shipping_charge"
                        name="shipping_charge"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={rule?.shipping_charge ?? ''}
                        required
                    />
                    <InputError message={errors.shipping_charge} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="is_active">Status</Label>
                    <select
                        id="is_active"
                        name="is_active"
                        defaultValue={rule ? (rule.is_active ? '1' : '0') : '1'}
                        className="border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    <InputError message={errors.is_active} />
                </div>
            </div>
        </div>
    );
}

function AddRuleDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="size-4" />
                    Add Rule
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Add shipping rule</DialogTitle>
                <DialogDescription>
                    Define a subtotal range and its shipping charge.
                </DialogDescription>
                <Form
                    action="/admin/shipping/rules"
                    method="post"
                    className="space-y-6"
                    onSuccess={() => setOpen(false)}
                    resetOnSuccess
                >
                    {({ processing, errors }) => (
                        <>
                            <RuleFields errors={errors as ShippingErrors} />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    Add Rule
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function EditRuleDialog({ rule }: { rule: ShippingRule }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Edit shipping rule</DialogTitle>
                <DialogDescription>
                    Update the subtotal range or charge.
                </DialogDescription>
                <Form
                    action={`/admin/shipping/rules/${rule.id}`}
                    method="post"
                    className="space-y-6"
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing, errors }) => (
                        <>
                            <RuleFields rule={rule} errors={errors as ShippingErrors} />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteRuleDialog({ rule }: { rule: ShippingRule }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Trash2 className="size-4 text-destructive" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Delete shipping rule</DialogTitle>
                <DialogDescription>
                    Delete this shipping rule? This cannot be undone.
                </DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Form
                        action={`/admin/shipping/rules/${rule.id}/delete`}
                        method="post"
                        onSuccess={() => setOpen(false)}
                    >
                        {({ processing }) => (
                            <Button type="submit" variant="destructive" disabled={processing}>
                                Delete
                            </Button>
                        )}
                    </Form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ShippingIndex({
    rules,
    settings,
}: {
    rules: ShippingRule[];
    settings: ShippingSettings;
}) {
    return (
        <>
            <Head title="Shipping Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Shipping Management"
                    description="Manage dynamic shipping charges, COD availability, and delivery time."
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>General Shipping Settings</CardTitle>
                        <CardDescription>
                            Cash on Delivery availability and the default delivery time used for estimated delivery dates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action="/admin/shipping/settings"
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="cod_enabled">Cash on Delivery</Label>
                                            <select
                                                id="cod_enabled"
                                                name="cod_enabled"
                                                defaultValue={settings.cod_enabled ? '1' : '0'}
                                                className="border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                            >
                                                <option value="1">Enabled</option>
                                                <option value="0">Disabled</option>
                                            </select>
                                            <InputError message={errors.cod_enabled} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="default_delivery_days">
                                                Default delivery days
                                            </Label>
                                            <Input
                                                id="default_delivery_days"
                                                name="default_delivery_days"
                                                type="number"
                                                min="0"
                                                max="365"
                                                defaultValue={settings.default_delivery_days}
                                                required
                                            />
                                            <InputError message={errors.default_delivery_days} />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        Save Settings
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Shipping Rules</CardTitle>
                            <CardDescription>
                                Charge is chosen by the cart subtotal. Ranges must not overlap.
                            </CardDescription>
                        </div>
                        <AddRuleDialog />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {rules.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No shipping rules yet. Add your first rule.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Subtotal Range</th>
                                            <th className="px-4 py-3 text-left font-medium">Shipping Charge</th>
                                            <th className="px-4 py-3 text-left font-medium">Status</th>
                                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rules.map((rule) => (
                                            <tr key={rule.id} className="border-b last:border-0">
                                                <td className="px-4 py-3 font-medium">
                                                    {formatCurrency(rule.min_amount)}
                                                    {' – '}
                                                    {rule.max_amount === null
                                                        ? 'and above'
                                                        : formatCurrency(rule.max_amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {rule.shipping_charge === 0
                                                        ? 'Free'
                                                        : formatCurrency(rule.shipping_charge)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={rule.is_active ? 'active' : 'inactive'}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Form
                                                            action={`/admin/shipping/rules/${rule.id}/toggle`}
                                                            method="post"
                                                        >
                                                            {({ processing }) => (
                                                                <Button
                                                                    type="submit"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    disabled={processing}
                                                                    title={rule.is_active ? 'Disable' : 'Enable'}
                                                                >
                                                                    <Power className="size-4" />
                                                                </Button>
                                                            )}
                                                        </Form>

                                                        <EditRuleDialog rule={rule} />

                                                        <DeleteRuleDialog rule={rule} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShippingIndex.layout = {
    breadcrumbs: [{ title: 'Shipping Management', href: '/admin/shipping' }],
};
