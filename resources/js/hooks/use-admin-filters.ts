import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type AdminFilterValues = Record<string, string>;

type UseAdminFiltersOptions = {
    debounceMs?: number;
    /** Inertia partial reload keys — avoids full page refresh while filtering */
    only?: string[];
};

function normalizeFilters(filters: AdminFilterValues): AdminFilterValues {
    return Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value ?? '']));
}

function serializeFilters(values: AdminFilterValues): Record<string, string> {
    return Object.fromEntries(
        Object.entries(values).filter(([, value]) => value.trim() !== ''),
    );
}

export function useAdminFilters(
    routeUrl: string,
    initialFilters: AdminFilterValues = {},
    { debounceMs = 400, only = [] }: UseAdminFiltersOptions = {},
) {
    const [values, setValues] = useState<AdminFilterValues>(() => normalizeFilters(initialFilters));
    const [isFiltering, setIsFiltering] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestIdRef = useRef(0);
    const initialKey = useMemo(() => JSON.stringify(initialFilters), [initialFilters]);

    // Sync from server only when filter values change — not on every new object reference.
    useEffect(() => {
        setValues(normalizeFilters(JSON.parse(initialKey) as AdminFilterValues));
    }, [initialKey]);

    const applyFilters = useCallback(
        (next: AdminFilterValues) => {
            const requestId = ++requestIdRef.current;
            setIsFiltering(true);

            router.get(routeUrl, serializeFilters(next), {
                only: only.length > 0 ? only : undefined,
                preserveState: true,
                preserveScroll: true,
                replace: true,
                showProgress: false,
                onFinish: () => {
                    if (requestId === requestIdRef.current) {
                        setIsFiltering(false);
                    }
                },
            });
        },
        [only, routeUrl],
    );

    const setValue = useCallback(
        (key: string, value: string, immediate = false) => {
            setValues((current) => {
                const next = { ...current, [key]: value };

                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                }

                if (immediate) {
                    applyFilters(next);
                } else {
                    debounceRef.current = setTimeout(() => applyFilters(next), debounceMs);
                }

                return next;
            });
        },
        [applyFilters, debounceMs],
    );

    const clearFilters = useCallback(() => {
        const cleared = Object.fromEntries(Object.keys(values).map((key) => [key, '']));
        setValues(cleared);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        applyFilters(cleared);
    }, [applyFilters, values]);

    const hasActiveFilters = useMemo(
        () => Object.values(values).some((value) => value.trim() !== ''),
        [values],
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return { values, setValue, clearFilters, hasActiveFilters, isFiltering };
}
