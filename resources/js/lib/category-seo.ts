import { categorySlug } from '@/lib/storefront-paths';

type CategorySeo = {
    title: string;
    description: string;
};

export function categorySeo(collectionSlug: string, category: string): CategorySeo | null {
    if (!category || category === 'All') {
        return null;
    }

    const categoryName = categorySlug(category).replace(/-/g, ' ');
    const collectionName = collectionSlug.charAt(0).toUpperCase() + collectionSlug.slice(1);

    return {
        title: `Shop ${categoryName} Online | ${collectionName} | Mahadev`,
        description: `Explore ${categoryName} in the ${collectionName} collection at Mahadev Multipurpose Co-operative Society Ltd. Quality products, fair value and secure ordering.`,
    };
}
