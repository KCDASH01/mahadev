import { SavedAddressesPanel } from '@/components/addresses/saved-addresses-panel';
import type { UserAddress } from '@/lib/address-mutations';
import { StorefrontAccountLayout } from '@/layouts/storefront-account-layout';

type AddressesIndexProps = {
    addresses: UserAddress[];
};

export default function AddressesIndex({ addresses }: AddressesIndexProps) {
    return (
        <StorefrontAccountLayout
            title="Saved Addresses"
            description={
                addresses.length === 0
                    ? 'Add an address for faster checkout.'
                    : `${addresses.length} saved address${addresses.length === 1 ? '' : 'es'}`
            }
        >
            <SavedAddressesPanel
                addresses={addresses}
                mode="manage"
                variant="plain"
                title="Your Addresses"
                description="Add, edit, or remove delivery addresses used at checkout."
            />
        </StorefrontAccountLayout>
    );
}
