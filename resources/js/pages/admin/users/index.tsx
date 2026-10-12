import { Head, Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import {
    AdminDateField,
    AdminFilterableContent,
    AdminFiltersBar,
    AdminSearchField,
} from '@/components/admin/admin-list-filters';
import PaginationLinks from '@/components/admin/pagination-links';
import StatusBadge from '@/components/admin/status-badge';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatDate } from '@/components/admin/commerce-utils';
import { index, show } from '@/routes/admin/users';
import { useAdminFilters } from '@/hooks/use-admin-filters';
import type { AdminUser, Paginated } from '@/types/admin';

export default function UsersIndex({
    users,
    filters = { search: '', registered_from: '', registered_to: '' },
}: {
    users: Paginated<AdminUser>;
    filters?: { search?: string; registered_from?: string; registered_to?: string };
}) {
    const { values, setValue, clearFilters, hasActiveFilters, isFiltering } = useAdminFilters(
        index.url(),
        filters,
        { only: ['users', 'filters'] },
    );

    return (
        <>
            <Head title="User Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="User Management"
                    description="Manage customer accounts (admin users are excluded)"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>All Customers</CardTitle>
                        <CardDescription>
                            {users.total} customer
                            {users.total === 1 ? '' : 's'} registered
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AdminFiltersBar showClear={hasActiveFilters} onClear={clearFilters}>
                            <AdminSearchField
                                value={values.search ?? ''}
                                onChange={(value) => setValue('search', value)}
                                placeholder="Search by name, email, or phone..."
                                isLoading={isFiltering}
                            />
                            <AdminDateField
                                label="Registered from"
                                value={values.registered_from ?? ''}
                                onChange={(value) => setValue('registered_from', value, true)}
                            />
                            <AdminDateField
                                label="Registered to"
                                value={values.registered_to ?? ''}
                                onChange={(value) => setValue('registered_to', value, true)}
                            />
                        </AdminFiltersBar>

                        <AdminFilterableContent isFiltering={isFiltering}>
                        {users.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? 'No customers match your filters.'
                                    : 'No customers registered yet.'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Phone
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Orders
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Registered
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {user.name}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {user.phone ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {user.orders_count ?? 0}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={user.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDate(user.created_at)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={show(
                                                                    user.id,
                                                                )}
                                                            >
                                                                <Eye className="size-3.5" />
                                                                View
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <PaginationLinks paginator={users} />
                        </AdminFilterableContent>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'User Management',
            href: index(),
        },
    ],
};
