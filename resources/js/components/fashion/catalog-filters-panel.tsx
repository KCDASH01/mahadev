import { Check, RotateCcw, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatPrice, type CatalogFilterAttribute, type CatalogFilters } from '@/data/fashion-products';
import { displaySizeLabel } from '@/lib/size-label';

const ratingOptions = [0, 4, 4.5, 4.8];

type CatalogFiltersPanelProps = {
    pageKey: string;
    title: string;
    categoryOptions: string[];
    filters: CatalogFilters;
    search: string;
    category: string;
    maxPrice: number;
    minRating: number;
    selectedAttributes: Record<string, string[]>;
    activeFilterCount: number;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onMaxPriceChange: (value: number) => void;
    onMinRatingChange: (value: number) => void;
    onToggleAttributeValue: (slug: string, value: string) => void;
    onReset: () => void;
    onClose: () => void;
};

function FilterSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
            <h3 className="text-sm font-semibold tracking-wide text-[#1A1A2E]">{title}</h3>
            <div className="mt-3">{children}</div>
        </section>
    );
}

function AttributeFilter({
    attribute,
    selectedValues,
    onToggle,
}: {
    attribute: CatalogFilterAttribute;
    selectedValues: string[];
    onToggle: (value: string) => void;
}) {
    const isColor = attribute.inputType === 'color';

    if (isColor) {
        return (
            <div className="flex flex-wrap gap-2.5">
                {attribute.options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    const hex = option.meta?.hex ?? '#CBD5E1';

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onToggle(option.value)}
                            title={option.label}
                            aria-label={option.label}
                            aria-pressed={isSelected}
                            className={`relative grid h-10 w-10 place-items-center rounded-full border-2 transition ${
                                isSelected
                                    ? 'border-[#062A4D] ring-2 ring-[#062A4D]/20'
                                    : 'border-white shadow-sm hover:border-[#062A4D]/40'
                            }`}
                            style={{ backgroundColor: hex }}
                        >
                            {isSelected && (
                                <Check
                                    className={`h-4 w-4 ${
                                        ['#FFFFFF', '#FFFDD0', '#F5D020', '#D4C4A8', '#C3B091'].includes(hex)
                                            ? 'text-[#1A1A2E]'
                                            : 'text-white'
                                    }`}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    const isCompact = attribute.slug === 'size';

    return (
        <div className={isCompact ? 'flex flex-wrap gap-2' : 'grid gap-2'}>
            {attribute.options.map((option) => {
                const isSelected = selectedValues.includes(option.value);

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onToggle(option.value)}
                        aria-pressed={isSelected}
                        className={`${
                            isCompact ? 'h-10 min-w-11 px-3' : 'h-10 px-3'
                        } inline-flex items-center justify-center rounded-lg border text-sm font-medium transition ${
                            isSelected
                                ? 'border-[#062A4D] bg-[#062A4D] text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#062A4D]/30 hover:bg-white'
                        }`}
                    >
                        {isCompact ? displaySizeLabel(option.label) : option.label}
                    </button>
                );
            })}
        </div>
    );
}

export function CatalogFiltersPanel({
    pageKey,
    title,
    categoryOptions,
    filters,
    search,
    category,
    maxPrice,
    minRating,
    selectedAttributes,
    activeFilterCount,
    onSearchChange,
    onCategoryChange,
    onMaxPriceChange,
    onMinRatingChange,
    onToggleAttributeValue,
    onReset,
    onClose,
}: CatalogFiltersPanelProps) {
    const priceStep = filters.price.max - filters.price.min > 5000 ? 500 : 100;

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
                aria-label="Close filters"
                onClick={onClose}
            />
            <aside className="absolute top-0 right-0 flex h-full w-full max-w-[360px] flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[#1A1A2E]">Filters</h2>
                        {activeFilterCount > 0 && (
                            <p className="mt-0.5 text-xs text-slate-500">
                                {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#062A4D] hover:text-[#062A4D]"
                        aria-label="Close filters"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                    <FilterSection title="Search">
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                id={`${pageKey}-search-products`}
                                value={search}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder={`Search ${title.toLowerCase()} products`}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-10 text-sm outline-none transition focus:border-[#062A4D] focus:bg-white"
                            />
                        </div>
                    </FilterSection>

                    {categoryOptions.length > 0 && (
                        <FilterSection title="Category">
                            <div className="grid gap-2">
                                {categoryOptions.map((item) => {
                                    const isSelected = category === item;

                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => onCategoryChange(item)}
                                            className={`flex h-10 items-center justify-between rounded-xl border px-3 text-left text-sm font-medium transition ${
                                                isSelected
                                                    ? 'border-[#062A4D] bg-[#062A4D] text-white'
                                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#062A4D]/30 hover:bg-white'
                                            }`}
                                        >
                                            {item}
                                            {isSelected && <Check className="h-4 w-4 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </FilterSection>
                    )}

                    <FilterSection title="Max price">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">{formatPrice(filters.price.min)}</span>
                            <span className="font-semibold text-[#1A1A2E]">{formatPrice(maxPrice)}</span>
                        </div>
                        <input
                            id={`${pageKey}-price-range`}
                            type="range"
                            min={filters.price.min}
                            max={filters.price.max}
                            step={priceStep}
                            value={maxPrice}
                            onChange={(event) => onMaxPriceChange(Number(event.target.value))}
                            className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#062A4D] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#062A4D]"
                        />
                    </FilterSection>

                    <FilterSection title="Rating">
                        <div className="grid grid-cols-2 gap-2">
                            {ratingOptions.map((rating) => {
                                const isSelected = minRating === rating;

                                return (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => onMinRatingChange(rating)}
                                        className={`h-10 rounded-xl border text-sm font-medium transition ${
                                            isSelected
                                                ? 'border-[#062A4D] bg-[#062A4D] text-white'
                                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#062A4D]/30 hover:bg-white'
                                        }`}
                                    >
                                        {rating === 0 ? 'Any rating' : `${rating}+ stars`}
                                    </button>
                                );
                            })}
                        </div>
                    </FilterSection>

                    {filters.attributes.map((attribute) => (
                        <FilterSection key={attribute.slug} title={attribute.name}>
                            <AttributeFilter
                                attribute={attribute}
                                selectedValues={selectedAttributes[attribute.slug] ?? []}
                                onToggle={(value) => onToggleAttributeValue(attribute.slug, value)}
                            />
                        </FilterSection>
                    ))}
                </div>

                <div className="border-t border-slate-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onReset}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-semibold text-[#1A1A2E] transition hover:border-[#062A4D] hover:text-[#062A4D]"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset filters
                    </button>
                </div>
            </aside>
        </div>
    );
}
