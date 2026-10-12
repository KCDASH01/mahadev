import { Head } from '@inertiajs/react';
import { CatalogPage } from '@/components/fashion/catalog-page';
import type { CatalogCategory, CatalogCollection, CatalogFilters, FashionProduct } from '@/data/fashion-products';
import { homeBrand } from '@/data/home-brand';
import { categorySeo } from '@/lib/category-seo';

export default function Collection({
    products,
    categories,
    collection,
    filters,
    selectedCategory = 'All',
    seo: serverSeo = null,
}: {
    products: FashionProduct[];
    categories: CatalogCategory[];
    collection: CatalogCollection;
    filters: CatalogFilters;
    selectedCategory?: string;
    seo?: { title: string; description: string } | null;
}) {
    const seo = serverSeo ?? categorySeo(collection.slug, selectedCategory);
    const pageTitle =
        seo?.title ??
        (selectedCategory && selectedCategory !== 'All'
            ? `${homeBrand.name} ${selectedCategory}`
            : `${homeBrand.name} ${collection.title}`);
    const pageDescription = seo?.description;

    return (
        <>
            <Head title={pageTitle}>
                {pageDescription && (
                    <meta head-key="description" name="description" content={pageDescription} />
                )}
                {seo && (
                    <meta head-key="og:title" property="og:title" content={seo.title} />
                )}
                {pageDescription && (
                    <meta head-key="og:description" property="og:description" content={pageDescription} />
                )}
            </Head>
            <CatalogPage
                products={products}
                categories={categories}
                collection={collection}
                filters={filters}
                selectedCategory={selectedCategory}
            />
        </>
    );
}
