export function formatOrderStatus(status: string): string {
    return status.replace(/_/g, ' ');
}

export function formatPaymentStatus(paymentMethod: string, paymentStatus: string): string {
    if (paymentMethod === 'cod') {
        if (paymentStatus === 'pending') {
            return 'Pay on delivery';
        }

        if (paymentStatus === 'paid') {
            return 'Paid on delivery';
        }
    }

    return formatOrderStatus(paymentStatus);
}

export function orderStatusBadgeClass(status: string): string {
    if (status === 'paid' || status === 'confirmed' || status === 'delivered') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'processing' || status === 'shipped') {
        return 'bg-blue-50 text-blue-700';
    }

    if (status === 'pending' || status === 'pending_payment') {
        return 'bg-amber-50 text-amber-700';
    }

    return 'bg-slate-100 text-slate-700';
}

export function paymentStatusBadgeClass(paymentMethod: string, paymentStatus: string): string {
    if (paymentMethod === 'cod' && paymentStatus === 'pending') {
        return 'bg-amber-50 text-amber-800';
    }

    if (paymentStatus === 'paid') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (paymentStatus === 'pending' || paymentStatus === 'pending_payment') {
        return 'bg-amber-50 text-amber-700';
    }

    return 'bg-slate-100 text-slate-700';
}
