export type NavMegaMenuLink = {
    label: string;
    href: string;
};

export type NavMegaMenuColumn = {
    title: string;
    links: NavMegaMenuLink[];
};

export type NavMegaMenu = {
    href: string;
    columns: NavMegaMenuColumn[];
};

export type StorefrontNavItem = {
    label: string;
    href: string;
    mega: boolean;
    key?: string;
    highlight?: boolean;
};

export type StorefrontNav = {
    items: StorefrontNavItem[];
    megaMenus: Record<string, NavMegaMenu>;
};

export type HeroSlide = {
    id: number;
    accentLine: string;
    mainLine: string;
    tagline: string;
    promoText: string;
    mediaType?: 'image' | 'video';
    image: string | null;
    video?: string | null;
    mobileImage?: string | null;
    mobileVideo?: string | null;
    imagePosition: string;
    cta: {
        label: string;
        href: string;
    };
};

export type PromoStripData = {
    image: string;
    mobileImage?: string | null;
};

export type HomepagePopupData = {
    image: string;
    mobileImage?: string | null;
    link?: string | null;
};

export type LookbookSectionData = {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: {
        label: string;
        href: string;
    };
    posterImage: string | null;
    videoUrl: string | null;
};

export type ExploreCollection = {
    title: string;
    image: string;
    href: string;
    imagePosition?: string;
};

export type FeaturedCategory = {
    title: string;
    count: string;
    image: string;
    href: string;
    gender: string;
    imagePosition?: string;
};

export type SocialStoryOverlayData = {
    eyebrow?: string;
    title: string;
    discount: string;
    note?: string;
    hashtag?: string;
};

export type SocialStoryData = {
    id: number;
    type: 'image' | 'video';
    image: string;
    videoUrl?: string | null;
    linkUrl?: string | null;
    overlay?: SocialStoryOverlayData | null;
    showThumbnailPromo?: boolean;
};

export type TestimonialData = {
    id: number;
    name: string;
    rating: number;
    headline: string;
    text: string;
    sceneImage: string;
};
