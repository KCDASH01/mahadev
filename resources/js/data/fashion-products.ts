export type ProductColorVariant = {
    name: string;
    image: string;
    type?: 'solid' | 'multicolor' | 'pattern';
    hex?: string;
    gallery?: string[];
};

const colorHexMap: Record<string, string> = {
    Black: '#171717',
    White: '#FFFFFF',
    Blue: '#313C8D',
    Navy: '#171B45',
    Grey: '#6B7280',
    Beige: '#D4C4A8',
    Red: '#DC2626',
    Green: '#16A34A',
    Brown: '#78350F',
    Pink: '#EC4899',
    Orange: '#FF6A00',
    Yellow: '#F5D020',
    Indigo: '#4338CA',
    Maroon: '#7F1D1D',
    Olive: '#4D7C0F',
    Teal: '#0D9488',
    Purple: '#7C3AED',
    Cream: '#FFFDD0',
    Charcoal: '#374151',
    Khaki: '#C3B091',
};

export function resolveColorHex(name: string, hex?: string): string {
    if (hex) {
        return hex;
    }

    const normalized = name.trim().toLowerCase();

    for (const [label, value] of Object.entries(colorHexMap)) {
        if (label.toLowerCase() === normalized || normalized.includes(label.toLowerCase())) {
            return value;
        }
    }

    return '#CBD5E1';
}

export function resolveColorStyle(
    name: string,
    hex?: string,
    type?: 'solid' | 'multicolor' | 'pattern',
): React.CSSProperties {
    const normalized = name.trim().toLowerCase();
    const resolvedType =
        type ??
        (normalized.includes('multicolor')
            ? 'multicolor'
            : normalized.includes('pattern') || normalized.includes('floral') || normalized.includes('striped')
              ? 'pattern'
              : 'solid');

    if (resolvedType === 'multicolor') {
        return {
            background: 'linear-gradient(135deg, #FF007F 0%, #FFD700 33%, #00E5FF 66%, #7B2CBF 100%)',
        };
    }

    if (resolvedType === 'pattern') {
        return {
            background: 'repeating-linear-gradient(-45deg, #475569, #475569 3px, #F1F5F9 3px, #F1F5F9 6px)',
        };
    }

    return {
        backgroundColor: resolveColorHex(name, hex),
    };
}

export type ProductOffer = {
    title: string;
    detail: string;
    code: string;
};

export type ProductVariantOption = {
    id: number;
    color: string | null;
    size: string | null;
    stock: number;
    salePrice: number;
    originalPrice: number;
};

export type FashionProduct = {
    id: number;
    slug: string;
    gender: 'Men' | 'Women' | 'Kids' | 'Unisex';
    name: string;
    category: string;
    image: string;
    gallery: string[];
    colors?: ProductColorVariant[];
    offers?: ProductOffer[];
    variantOptions?: ProductVariantOption[];
    price: number;
    originalPrice: number;
    stock?: number;
    productType?: 'clothing' | 'jewellery';
    rating: number;
    reviews: number;
    sizes: string[];
    color: string | null;
    badge: string;
    fit: string;
    short_description?: string;
    description: string;
    careInstructions?: string;
    details: string[];
    attributes?: Record<string, string[]>;
};

export type CatalogFilterOption = {
    value: string;
    label: string;
    meta?: { hex?: string } | null;
};

export type CatalogFilterAttribute = {
    slug: string;
    name: string;
    inputType: string;
    options: CatalogFilterOption[];
};

export type CatalogFilters = {
    price: {
        min: number;
        max: number;
    };
    attributes: CatalogFilterAttribute[];
};

export type CatalogCategory = {
    label: string;
    image: string;
    count?: number;
    filter?: 'category' | 'gender';
    href?: string;
};

export type CatalogCollection = {
    title: string;
    slug: string;
    gender?: string | null;
    heroImage: string;
    heroImagePosition?: string;
};

function getUnsplashPhotoId(url: string) {
    const match = url.match(/photo-\d+-[\w-]+/);
    return match?.[0] ?? url.split('?')[0];
}

export function getProductHoverImage(product: FashionProduct) {
    const primaryId = getUnsplashPhotoId(product.image);
    const alternate = product.gallery.find((image) => getUnsplashPhotoId(image) !== primaryId);

    return alternate ?? product.gallery[1] ?? product.image;
}

export function getProductGalleryImages(product: FashionProduct) {
    const seen = new Set<string>();
    const images: string[] = [];

    for (const url of [product.image, ...product.gallery]) {
        const id = getUnsplashPhotoId(url);
        if (!seen.has(id)) {
            seen.add(id);
            images.push(url);
        }
    }

    return images;
}

export function getProductColorVariants(product: FashionProduct): ProductColorVariant[] {
    if (product.productType === 'jewellery') {
        return [];
    }

    // Only real colors from the API — never invent swatches from gallery images.
    if (product.colors?.length) {
        return product.colors;
    }

    return [];
}

export function getColorVariantGallery(product: FashionProduct, variant: ProductColorVariant): string[] {
    const seen = new Set<string>();
    const images: string[] = [];
    const urls = variant.gallery ?? [variant.image, ...product.gallery];

    for (const url of urls) {
        const id = getUnsplashPhotoId(url);
        if (!seen.has(id)) {
            seen.add(id);
            images.push(url);
        }
    }

    return images.length > 0 ? images : [variant.image];
}

export function formatPrice(price: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

export function getDiscountPercentage(originalPrice: number, price: number) {
    if (originalPrice <= price) {
        return 0;
    }

    return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function getSavingsAmount(originalPrice: number, price: number) {
    return Math.max(originalPrice - price, 0);
}

const newArrivalCategoryOrder = [
    'Shirts',
    'T-Shirts',
    'Jeans',
    'Trousers',
    'Hoodies',
    'Jackets',
    'Dresses',
    'Kurtis',
    'Tops',
];

export function getNewArrivalCategories(products: FashionProduct[]) {
    const available = new Set(products.map((product) => product.category));

    return newArrivalCategoryOrder
        .filter((category) => available.has(category))
        .concat(
            [...available]
                .filter((category) => !newArrivalCategoryOrder.includes(category))
                .sort(),
        );
}
