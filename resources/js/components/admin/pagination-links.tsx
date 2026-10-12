import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types/admin';

export default function PaginationLinks<T>({
    paginator,
}: {
    paginator: Paginated<T>;
}) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
                Page {paginator.current_page} of {paginator.last_page} (
                {paginator.total} total)
            </p>
            <div className="flex gap-2">
                {paginator.prev_page_url && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={paginator.prev_page_url} preserveScroll>
                            Previous
                        </Link>
                    </Button>
                )}
                {paginator.next_page_url && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={paginator.next_page_url} preserveScroll>
                            Next
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
