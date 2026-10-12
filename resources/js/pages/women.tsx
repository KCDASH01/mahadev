import { Head } from '@inertiajs/react';
import { CatalogPage } from '@/components/fashion/catalog-page';
import { homeBrand } from '@/data/home-brand';
import type { CatalogCategory, FashionProduct } from '@/data/fashion-products';

export default function Women({
    products,
    categories,
}: {
    products: FashionProduct[];
    categories: CatalogCategory[];
}) {
    return (
        <>
            <Head title={`${homeBrand.name} Womens Wear`} />
            <CatalogPage
                products={products}
                categories={categories}
                gender="Women"
                heroImage="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85"
                heroImagePosition="50% 22%"
            />
        </>
    );
}
