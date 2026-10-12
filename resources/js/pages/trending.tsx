import { Head } from '@inertiajs/react';
import { CatalogPage } from '@/components/fashion/catalog-page';
import { homeBrand } from '@/data/home-brand';
import { pageHeroImages } from '@/data/home-content';
import type { CatalogCategory, FashionProduct } from '@/data/fashion-products';

export default function Trending({
    products,
    categories,
}: {
    products: FashionProduct[];
    categories: CatalogCategory[];
}) {
    return (
        <>
            <Head title={`${homeBrand.name} Trending Products`} />
            <CatalogPage
                products={products}
                categories={categories}
                pageTitle="Trending"
                heroImage={pageHeroImages.trending}
            />
        </>
    );
}
