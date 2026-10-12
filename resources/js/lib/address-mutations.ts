import { router } from '@inertiajs/react';
import type { AddressFormValues } from '@/components/cart/address-form';

export type UserAddress = {
    id: number;
    full_name: string;
    phone: string;
    alternate_phone?: string | null;
    date_of_birth?: string | null;
    address_line_1: string;
    address_line_2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude?: number | null;
    longitude?: number | null;
    is_default: boolean;
};

function serializeAddressValues(values: AddressFormValues): Record<string, unknown> {
    return {
        ...values,
        latitude: values.latitude ? Number(values.latitude) : null,
        longitude: values.longitude ? Number(values.longitude) : null,
        date_of_birth: values.date_of_birth || null,
    };
}

export function addressToFormValues(address: UserAddress): AddressFormValues {
    return {
        full_name: address.full_name,
        phone: address.phone,
        alternate_phone: address.alternate_phone ?? '',
        date_of_birth: address.date_of_birth ?? '',
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 ?? '',
        landmark: address.landmark ?? '',
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
        latitude: address.latitude != null ? String(address.latitude) : '',
        longitude: address.longitude != null ? String(address.longitude) : '',
        is_default: address.is_default,
    };
}

type MutationOptions = {
    preserveScroll?: boolean;
    onSuccess?: () => void;
    onFinish?: () => void;
};

export function storeAddress(values: AddressFormValues, options: MutationOptions = {}): void {
    router.post('/addresses', serializeAddressValues(values), {
        preserveScroll: options.preserveScroll ?? true,
        onSuccess: options.onSuccess,
        onFinish: options.onFinish,
    });
}

export function updateAddress(addressId: number, values: AddressFormValues, options: MutationOptions = {}): void {
    router.post(`/addresses/${addressId}/update`, serializeAddressValues(values), {
        preserveScroll: options.preserveScroll ?? true,
        onSuccess: options.onSuccess,
        onFinish: options.onFinish,
    });
}

export function removeAddress(addressId: number, options: MutationOptions = {}): void {
    router.post(
        `/addresses/${addressId}/remove`,
        {},
        {
            preserveScroll: options.preserveScroll ?? true,
            onSuccess: options.onSuccess,
            onFinish: options.onFinish,
        },
    );
}

export function makeDefaultAddress(addressId: number, options: MutationOptions = {}): void {
    router.post(
        `/addresses/${addressId}/default`,
        {},
        {
            preserveScroll: options.preserveScroll ?? true,
            onSuccess: options.onSuccess,
            onFinish: options.onFinish,
        },
    );
}

export function selectCheckoutAddress(addressId: number): void {
    router.post('/cart/address', { address_id: addressId }, { preserveScroll: true });
}
