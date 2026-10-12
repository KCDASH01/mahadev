import { Loader2, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type AdminFiltersBarProps = {
    children: ReactNode;
    onClear?: () => void;
    showClear?: boolean;
    className?: string;
};

const fieldClassName =
    'border border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 shadow-xs outline-none focus-visible:ring-[3px]';

export function AdminFiltersBar({ children, onClear, showClear = false, className }: AdminFiltersBarProps) {
    return (
        <div
            className={cn(
                'border-border bg-muted/40 flex flex-col gap-3 rounded-xl border p-4',
                className,
            )}
        >
            <div className="flex flex-wrap items-end gap-3">{children}</div>
            {showClear && onClear && (
                <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1.5 text-xs">
                        <X className="size-3.5" />
                        Clear filters
                    </Button>
                </div>
            )}
        </div>
    );
}

type AdminSearchFieldProps = {
    label?: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    isLoading?: boolean;
    className?: string;
};

export function AdminSearchField({
    label = 'Search',
    value,
    placeholder = 'Search...',
    onChange,
    isLoading = false,
    className,
}: AdminSearchFieldProps) {
    return (
        <div className={cn('min-w-[200px] flex-1', className)}>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
            <div className="relative">
                {isLoading ? (
                    <Loader2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : (
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                )}
                <Input
                    type="search"
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    className={cn(fieldClassName, 'pl-9')}
                />
            </div>
        </div>
    );
}

type AdminSelectFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    className?: string;
};

export function AdminSelectField({
    label,
    value,
    onChange,
    options,
    placeholder = 'All',
    className,
}: AdminSelectFieldProps) {
    return (
        <div className={cn('min-w-[160px]', className)}>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={cn(fieldClassName, 'w-full rounded-md px-3 text-sm')}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

type AdminDateFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

export function AdminDateField({ label, value, onChange, className }: AdminDateFieldProps) {
    return (
        <div className={cn('min-w-[150px]', className)}>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
            <Input
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={fieldClassName}
            />
        </div>
    );
}

type AdminFilterableContentProps = {
    children: ReactNode;
    isFiltering?: boolean;
    className?: string;
};

/** Wraps list/table content — dims slightly while a filter request is in flight */
export function AdminFilterableContent({
    children,
    isFiltering = false,
    className,
}: AdminFilterableContentProps) {
    return (
        <div
            className={cn(
                'space-y-4 transition-opacity duration-200',
                isFiltering && 'pointer-events-none opacity-60',
                className,
            )}
        >
            {children}
        </div>
    );
}
