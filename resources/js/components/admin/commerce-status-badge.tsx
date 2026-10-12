import {
    commerceStatusClass,
    formatCommerceStatus,
} from '@/components/admin/commerce-utils';

export default function CommerceStatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${commerceStatusClass(status)}`}
        >
            {formatCommerceStatus(status)}
        </span>
    );
}
