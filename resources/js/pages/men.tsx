import { Head } from '@inertiajs/react';
import { CatalogPage } from '@/components/fashion/catalog-page';
import { homeBrand } from '@/data/home-brand';
import type { CatalogCategory, FashionProduct } from '@/data/fashion-products';

export default function Men({
    products,
    categories,
}: {
    products: FashionProduct[];
    categories: CatalogCategory[];
}) {
    return (
        <>
            <Head title={`${homeBrand.name} Mens Wear`} />
            <CatalogPage
                products={products}
                categories={categories}
                gender="Men"
                heroImage="https://images.unsplash.com/photo-1630694892076-e3b924bbe017?auto=format&fit=crop&w=1600&q=85"
                heroImagePosition="50% 18%"
            />
        </>
    );
}
