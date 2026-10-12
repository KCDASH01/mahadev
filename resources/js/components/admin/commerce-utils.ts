export function formatCommerceStatus(status: string): string {
    return status.replace(/_/g, ' ');
}

export function commerceStatusClass(status: string): string {
    if (status === 'paid' || status === 'confirmed' || status === 'delivered') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'pending' || status === 'pending_payment') {
        return 'bg-amber-50 text-amber-700';
    }

    if (status === 'cancelled' || status === 'payment_failed') {
        return 'bg-red-50 text-red-700';
    }

    return 'bg-slate-100 text-slate-700';
}

export function formatCurrency(amount: string | number): string {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function formatDateTime(iso?: string | null): string {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDate(iso?: string | null): string {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
