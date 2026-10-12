import { Link } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AddressForm, type AddressFormValues } from '@/components/cart/address-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    addressToFormValues,
    makeDefaultAddress,
    removeAddress,
    selectCheckoutAddress,
    storeAddress,
    updateAddress,
    type UserAddress,
} from '@/lib/address-mutations';

type SavedAddressesPanelProps = {
    addresses: UserAddress[];
    selectedAddressId?: number | null;
    mode?: 'manage' | 'select';
    title?: string;
    description?: string;
    showLoginPrompt?: boolean;
    variant?: 'card' | 'plain';
};

export function SavedAddressesPanel({
    addresses,
    selectedAddressId = null,
    mode = 'manage',
    title = 'Saved Addresses',
    description = 'Manage your delivery addresses.',
    showLoginPrompt = false,
    variant = 'card',
}: SavedAddressesPanelProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
    const [processing, setProcessing] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);

    const isSelectMode = mode === 'select';
    const dialogTitle = editingAddress ? 'Edit Delivery Address' : 'Add Delivery Address';

    const openAddDialog = () => {
        setEditingAddress(null);
        setDialogOpen(true);
    };

    const openEditDialog = (address: UserAddress) => {
        setEditingAddress(address);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingAddress(null);
    };

    const saveAddress = (values: AddressFormValues) => {
        setProcessing(true);

        const callbacks = {
            preserveScroll: true,
            onSuccess: () => closeDialog(),
            onFinish: () => setProcessing(false),
        };

        if (editingAddress) {
            updateAddress(editingAddress.id, values, callbacks);
            return;
        }

        storeAddress(values, callbacks);
    };

    const handleRemove = (address: UserAddress) => {
        if (
            !window.confirm(
                `Remove this address from your saved list?\n\nPast orders delivered here will keep their delivery details.`,
            )
        ) {
            return;
        }

        setRemovingId(address.id);
        removeAddress(address.id, {
            preserveScroll: true,
            onFinish: () => setRemovingId(null),
        });
    };

    const handleMakeDefault = (addressId: number) => {
        makeDefaultAddress(addressId);
    };

    if (showLoginPrompt) {
        const loginContent = (
            <>
                <h2 className="font-serif text-xl font-medium text-[#09233D]">{title}</h2>
                <p className="mt-3 text-sm text-[#647487]">Please log in to manage your delivery addresses.</p>
                <Button asChild className="mt-4 bg-[#062A4D] hover:bg-[#041F3A]">
                    <Link href="/login">Log in</Link>
                </Button>
            </>
        );

        if (variant === 'plain') {
            return <div>{loginContent}</div>;
        }

        return (
            <div className="border border-[#E8DDC5] bg-white p-5 sm:p-6">
                {loginContent}
            </div>
        );
    }

    const content = (
        <>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-serif text-xl font-medium text-[#09233D]">{title}</h2>
                    <p className="mt-2 text-sm text-[#647487]">{description}</p>
                </div>
                <Dialog
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) {
                            setEditingAddress(null);
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" onClick={openAddDialog}>
                            <Plus className="size-3.5" />
                            Add Address
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{dialogTitle}</DialogTitle>
                        </DialogHeader>
                        <AddressForm
                            key={editingAddress?.id ?? 'new'}
                            initialValues={editingAddress ? addressToFormValues(editingAddress) : undefined}
                            submitLabel={editingAddress ? 'Update Address' : 'Save Address'}
                            processing={processing}
                            onSubmit={saveAddress}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {addresses.length === 0 ? (
                <div className="mt-4 border border-dashed border-[#E8DDC5] bg-[#FCFAF5] p-6 text-center">
                    <p className="text-sm text-[#647487]">No saved addresses yet.</p>
                    <Button type="button" className="mt-4 bg-[#062A4D] hover:bg-[#041F3A]" onClick={openAddDialog}>
                        Add Address
                    </Button>
                </div>
            ) : (
                <div className="mt-4 grid gap-3">
                    {addresses.map((address) => {
                        const isSelected = isSelectMode && address.id === selectedAddressId;

                        return (
                            <div
                                key={address.id}
                                className={`border p-4 transition ${
                                    isSelected
                                        ? 'border-[#062A4D] bg-[#F5F1E8] ring-1 ring-[#062A4D]/20'
                                        : 'border-[#E8DDC5]'
                                }`}
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <button
                                        type="button"
                                        disabled={!isSelectMode}
                                        onClick={() => isSelectMode && selectCheckoutAddress(address.id)}
                                        className={`flex min-w-0 flex-1 items-start gap-3 text-left ${
                                            isSelectMode ? 'cursor-pointer' : 'cursor-default'
                                        }`}
                                    >
                                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#062A4D]" />
                                        <div className="text-sm leading-6 text-slate-600">
                                            <p className="font-semibold text-neutral-900">
                                                {address.full_name}
                                                {address.is_default && (
                                                    <span className="ml-2 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                                                        Default
                                                    </span>
                                                )}
                                            </p>
                                            <p>
                                                {address.address_line_1}
                                                {address.address_line_2 ? `, ${address.address_line_2}` : ''}
                                            </p>
                                            {address.landmark && <p>Landmark: {address.landmark}</p>}
                                            <p>
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                            <p className="text-slate-500">{address.country}</p>
                                            <p className="mt-1 text-slate-500">+91 {address.phone}</p>
                                            {address.date_of_birth && (
                                                <p className="text-slate-500">DOB: {address.date_of_birth}</p>
                                            )}
                                        </div>
                                    </button>

                                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                                        {!address.is_default && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleMakeDefault(address.id)}
                                            >
                                                <Star className="size-3.5" />
                                                Set Default
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(address)}
                                        >
                                            <Pencil className="size-3.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            disabled={removingId === address.id}
                                            onClick={() => handleRemove(address)}
                                        >
                                            <Trash2 className="size-3.5" />
                                            {removingId === address.id ? 'Removing...' : 'Remove'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isSelectMode && selectedAddressId != null && (
                <SelectedAddressSummary
                    address={addresses.find((item) => item.id === selectedAddressId) ?? null}
                />
            )}
        </>
    );

    if (variant === 'plain') {
        return <div>{content}</div>;
    }

    return (
        <div className="border border-[#E8DDC5] bg-white p-5 sm:p-6">
            {content}
        </div>
    );
}

function SelectedAddressSummary({ address }: { address: UserAddress | null }) {
    if (!address) {
        return null;
    }

    return (
        <div className="mt-4 flex gap-3 border border-[#E8DDC5] bg-[#FCFAF5] p-4">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#062A4D]" />
            <div className="text-sm leading-6 text-slate-600">
                <p className="font-semibold text-neutral-900">Delivering to {address.full_name}</p>
                <p>
                    {address.address_line_1}, {address.city}, {address.state} - {address.pincode}
                </p>
            </div>
        </div>
    );
}

export type { UserAddress };
