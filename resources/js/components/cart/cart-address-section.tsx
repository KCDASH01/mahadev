import { usePage } from '@inertiajs/react';
import { SavedAddressesPanel } from '@/components/addresses/saved-addresses-panel';
import type { UserAddress } from '@/lib/address-mutations';

export type { UserAddress };

type CartAddressSectionProps = {
    addresses: UserAddress[];
    selectedAddressId: number | null;
};

export function CartAddressSection({ addresses, selectedAddressId }: CartAddressSectionProps) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    return (
        <SavedAddressesPanel
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            mode="select"
            title="Delivery Information"
            description="Select where you want your order delivered."
            showLoginPrompt={!auth?.user}
        />
    );
}
