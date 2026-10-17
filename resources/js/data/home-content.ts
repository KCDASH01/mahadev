const banner = (path: string) =>
    `https://images.unsplash.com/${path}?auto=format&fit=crop&w=1600&q=85&v=3`;

const img = (path: string, width = 1200) =>
    `https://images.unsplash.com/${path}?auto=format&fit=crop&w=${width}&q=85`;

export const heroSlides = [
    {
        id: 1001,
        accentLine: 'STYLE FOR EVERY DAY',
        mainLine: 'GARMENTS',
        tagline: 'Thoughtfully selected fashion for gents and ladies, with quality you can trust.',
        promoText: 'New collection now available',
        image: banner('photo-1445205170230-053b83016050'),
        imagePosition: 'center 35%',
        cta: { label: 'SHOP GARMENTS', href: '/collection/gents' },
    },
    {
        id: 1002,
        accentLine: 'MADE FOR YOUR HOME',
        mainLine: 'FURNITURE',
        tagline: 'Comfortable, useful and dependable furniture for every room and every budget.',
        promoText: 'Built for everyday living',
        image: banner('photo-1555041469-a586c61ea9bc'),
        imagePosition: 'center 55%',
        cta: { label: 'SHOP FURNITURE', href: '/collection/furniture' },
    },
    {
        id: 1003,
        accentLine: 'ELEGANCE FOR EVERY OCCASION',
        mainLine: 'LADIES COLLECTION',
        tagline: 'Sarees, tops, jeans, kurtis and lehengas chosen for modern Indian wardrobes.',
        promoText: 'Discover the latest styles',
        image: banner('photo-1583391733956-6c78276477e2'),
        imagePosition: 'center 25%',
        cta: { label: 'SHOP LADIES', href: '/collection/ladies' },
    },
];

export const promoStrip = {
    image: img('photo-1556821840-3a63f95609a7', 1920),
};

export const exploreCollections = [
    { title: 'Gents', image: img('photo-1617137968427-85924c800a22', 900), href: '/collection/gents' },
    { title: 'Ladies', image: '/storage/ladies-explore.jpg', href: '/collection/ladies' },
    { title: 'Furniture', image: img('photo-1555041469-a586c61ea9bc', 900), href: '/collection/furniture' },
];

export const mostWantedCategories = [
    { title: 'Shirt', count: 'New', image: img('photo-1596755094514-f87e34085b2c', 600), href: '/collection/gents/category/Shirt' },
    { title: 'Kurta', count: 'New', image: img('photo-1602216056096-3b40cc0c9944', 600), href: '/collection/gents/category/Kurta' },
    { title: 'Saree', count: 'New', image: img('photo-1610030469983-98e550d6193c', 600), href: '/collection/ladies/category/Saree' },
    { title: 'Kurti', count: 'New', image: img('photo-1583391733956-6c78276477e2', 600), href: '/collection/ladies/category/Kurti' },
    { title: 'Sofa', count: 'New', image: img('photo-1555041469-a586c61ea9bc', 600), href: '/collection/furniture/category/Sofa' },
    { title: 'Bed', count: 'New', image: img('photo-1505693416388-ac5ce068fe85', 600), href: '/collection/furniture/category/Bed' },
    { title: 'Almirah', count: 'New', image: img('photo-1616486338812-3dadae4b4ace', 600), href: '/collection/furniture/category/Almirah' },
    { title: 'Kitchen Stand', count: 'New', image: img('photo-1556911220-bff31c812dba', 600), href: '/collection/furniture/category/Kitchen-Stand' },
];

export type SocialStoryOverlay = {
    eyebrow?: string;
    title: string;
    discount: string;
    note?: string;
    hashtag?: string;
};

export type SocialStory = {
    id: number;
    type: 'image' | 'video';
    image: string;
    video?: string;
    overlay?: SocialStoryOverlay;
    showThumbnailPromo?: boolean;
};

export const socialStories: SocialStory[] = [
    {
        id: 1,
        type: 'image',
        image: img('photo-1542272604-787c3835535d', 900),
        showThumbnailPromo: true,
        overlay: {
            eyebrow: 'END OF SEASON',
            title: 'SALE',
            discount: 'UPTO 50% OFF',
            note: 'MANY MORE EXCITING OFFERS IN-STORE AND ONLINE',
            hashtag: '#STYLEWITHMAHADEV',
        },
    },
    { id: 2, type: 'image', image: img('photo-1756483492198-8ca91227489b', 900) },
    {
        id: 3,
        type: 'video',
        image: img('photo-1515886657613-9f3515b0c78f', 900),
        video: 'https://videos.pexels.com/video-files/4760244/4760244-hd_1080_1920_25fps.mp4',
    },
    { id: 4, type: 'image', image: img('photo-1769275061356-a038b498c4a7', 900) },
    { id: 5, type: 'image', image: img('photo-1625978827241-c8bdc7cc3ff7', 900) },
    {
        id: 6,
        type: 'video',
        image: img('photo-1485230895905-ec40ba36b9bc', 900),
        video: 'https://videos.pexels.com/video-files/7695997/7695997-hd_1080_1920_25fps.mp4',
    },
    { id: 7, type: 'image', image: img('photo-1759840278381-bf7d5e332050', 900) },
    { id: 8, type: 'image', image: img('photo-1712130126754-009c33690ee3', 900) },
];

export type HomeTestimonial = {
    name: string;
    rating: number;
    headline: string;
    text: string;
    sceneImage: string;
};

export const homeTestimonials: HomeTestimonial[] = [
    {
        name: 'Ananya Sharma',
        rating: 5,
        headline: 'Premium quality, every time!',
        text: 'The fabric quality feels premium and delivery to Odisha was quick. Great value for money on kurtis and everyday wear.',
        sceneImage: img('photo-1515886657613-9f3515b0c78f', 900),
    },
    {
        name: 'Rohit Verma',
        rating: 5,
        headline: 'Perfect fit, great prices!',
        text: 'Perfect fit on shirts and kurtas. Mahadev has become my go-to for dependable products at sensible prices.',
        sceneImage: img('photo-1712130126754-009c33690ee3', 900),
    },
    {
        name: 'Priya Mehta',
        rating: 5,
        headline: 'Office to outing ready!',
        text: 'Clean kurtis, helpful sizing, and pieces that work for office and outings alike. Checkout and delivery were smooth.',
        sceneImage: img('photo-1485230895905-ec40ba36b9bc', 900),
    },
    {
        name: 'Karan Singh',
        rating: 5,
        headline: 'Looks expensive, costs less!',
        text: 'Fast shipping, secure checkout, and styles that look much more expensive than they are. Highly recommend for men’s wear.',
        sceneImage: img('photo-1603252109303-2751441dd157', 900),
    },
];

export const asSeenOnBrands = ['Vogue India', 'GQ India', 'Hindustan Times', 'India Today', 'Elle India'];

export const trustFeatures = [
    {
        title: '10k+ Happy Customers',
        description: '10 years of delivering style and quality to shoppers across India.',
        icon: 'customers' as const,
    },
    {
        title: 'Express Delivery',
        description: 'We stand committed to safely deliver your orders in 3 days*.',
        icon: 'delivery' as const,
    },
    {
        title: '100% Secure Payments',
        description: 'You are in safe hands. All your payments are secured by 128-bit encryption.',
        icon: 'payments' as const,
    },
    {
        title: 'Handcrafted Products',
        description: 'Thoughtful fabrics, careful finishing, and quality you can see in every piece.',
        icon: 'handcrafted' as const,
    },
];

export const navMegaMenus = {
    Garments: {
        href: '/collection/gents',
        columns: [
            {
                title: 'Gents',
                links: [
                    { label: 'Jeans', href: '/collection/gents/category/Jeans' },
                    { label: 'Shirt', href: '/collection/gents/category/Shirt' },
                    { label: 'T-Shirt', href: '/collection/gents/category/T-Shirt' },
                    { label: 'Kurta', href: '/collection/gents/category/Kurta' },
                    { label: 'Blazer', href: '/collection/gents/category/Blazer' },
                ],
            },
            {
                title: 'Ladies',
                links: [
                    { label: 'Saree', href: '/collection/ladies/category/Saree' },
                    { label: 'Top', href: '/collection/ladies/category/Top' },
                    { label: 'Jeans', href: '/collection/ladies/category/Jeans' },
                    { label: 'Kurti', href: '/collection/ladies/category/Kurti' },
                    { label: 'Lehenga', href: '/collection/ladies/category/Lehenga' },
                ],
            },
        ],
    },
    Furniture: {
        href: '/collection/furniture',
        columns: [
            {
                title: 'Living & Bedroom',
                links: [
                    { label: 'Sofa', href: '/collection/furniture/category/Sofa' },
                    { label: 'Bed', href: '/collection/furniture/category/Bed' },
                    { label: 'Dressing Table', href: '/collection/furniture/category/Dressing-Table' },
                    { label: 'Alena', href: '/collection/furniture/category/Alena' },
                ],
            },
            {
                title: 'Storage & Utility',
                links: [
                    { label: 'Shoe Rack', href: '/collection/furniture/category/Shoe-Rack' },
                    { label: 'Almirah', href: '/collection/furniture/category/Almirah' },
                    { label: 'Kitchen Stand', href: '/collection/furniture/category/Kitchen-Stand' },
                    { label: 'Vegetable Stand', href: '/collection/furniture/category/Vegetable-Stand' },
                ],
            },
        ],
    },
} as const;

export const mainNavItems = [
    { label: 'Garments', mega: true as const },
    { label: 'Furniture', mega: true as const },
];

export const videoSection = {
    image: img('photo-1618221195710-dd6b41faaea6', 2200),
    title: 'One Trusted Society. Many Everyday Needs.',
    subtitle: 'Discover garments and furniture selected with value, quality and community in mind.',
    cta: { label: 'Explore Mahadev', href: '/about' },
};

export const pageHeroImages = {
    about: img('photo-1618221195710-dd6b41faaea6', 1600),
    trending: img('photo-1625978827241-c8bdc7cc3ff7', 1600),
};
