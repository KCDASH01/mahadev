export function collectionPath(slug: string): string {
    if (slug === 'trending') {
        return '/trending';
    }

    if (slug === 'new-arrivals') {
        return '/new-arrivals';
    }

    return `/collection/${slug}`;
}

export function categorySlug(category: string): string {
    return category.trim().replace(/\s+/g, '-');
}

export function collectionCategoryPath(slug: string, category: string): string {
    const encoded = encodeURIComponent(categorySlug(category));

    if (slug === 'trending' || slug === 'new-arrivals') {
        return `/${slug}/category/${encoded}`;
    }

    return `/collection/${slug}/category/${encoded}`;
}

export function productPath(slug: string): string {
    return `/product/${slug}`;
}

export function productReviewsPath(slug: string): string {
    return `/product/${slug}/reviews`;
}

export function collectionLabel(slug: string): string {
    if (slug === 'new-arrivals') {
        return 'New Arrivals';
    }

    return slug.charAt(0).toUpperCase() + slug.slice(1);
}
