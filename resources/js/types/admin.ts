export type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    gender: 'men' | 'women' | 'kids' | 'unisex' | null;
    nav_group: string | null;
    sort_order?: number;
    image: string | null;
    description: string | null;
    status: 'active' | 'inactive';
    is_featured?: boolean;
    products_count?: number;
    parent?: { id: number; name: string; gender: Category['gender'] } | null;
    created_at: string;
    updated_at: string;
};

export type CategoryOption = {
    id: number;
    name: string;
    gender: Category['gender'];
};

export type Banner = {
    id: number;
    title: string;
    accent_line: string | null;
    main_line: string | null;
    tagline: string | null;
    promo_text: string | null;
    media_type?: 'image' | 'video';
    image: string | null;
    video?: string | null;
    mobile_image?: string | null;
    mobile_video?: string | null;
    image_position: string | null;
    link: string | null;
    cta_label: string | null;
    placement?: string;
    sort_order?: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
};

export type AnnouncementOffer = {
    id: number;
    text: string;
    highlight: string | null;
    sort_order: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
};

export type PromoStrip = {
    id: number;
    image: string | null;
    mobile_image?: string | null;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
};

export type HomepagePopup = {
    id: number;
    image: string | null;
    mobile_image?: string | null;
    link: string | null;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
};

export type LookbookSection = {
    id: number;
    eyebrow: string;
    title: string;
    subtitle: string | null;
    cta_label: string;
    cta_href: string;
    poster_image: string | null;
    video_url: string | null;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
};

// export type LookbookSection = {
//     id: number;
//     eyebrow: string;
//     title: string;
//     subtitle: string | null;
//     cta_label: string;
//     cta_href: string;
//     poster_image: string | null;
//     video_url: string | null;
//     is_visible: boolean;
//     created_at: string;
//     updated_at: string;
// };

export type SocialStory = {
    id: number;
    title: string;
    type: 'image' | 'video';
    image: string;
    video_url: string | null;
    link_url: string | null;
    overlay_eyebrow: string | null;
    overlay_title: string | null;
    overlay_discount: string | null;
    overlay_note: string | null;
    overlay_hashtag: string | null;
    show_thumbnail_promo: boolean;
    sort_order: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
};

export type Testimonial = {
    id: number;
    name: string;
    headline: string;
    body: string;
    rating: string;
    scene_image: string;
    sort_order: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
};

export type Blog = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string | null;
    category: string;
    image: string;
    published_at: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
};

export type Brand = {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    status: 'active' | 'inactive';
    products_count?: number;
    created_at: string;
    updated_at: string;
};

export type AdminColor = {
    id: number;
    value: string;
    slug: string;
    hex?: string | null;
    sort_order: number;
    status: 'active' | 'inactive';
    variants_count?: number;
    products_count?: number;
    product_images_count?: number;
};

export type Coupon = {
    id: number;
    code: string;
    title: string | null;
    description: string | null;
    type: string;
    value: string | null;
    buy_quantity: number | null;
    get_quantity: number | null;
    minimum_amount: string | null;
    max_discount: string | null;
    usage_limit: number | null;
    per_user_limit: number | null;
    used_count: number;
    starts_at: string | null;
    expiry_date: string | null;
    first_order_only: boolean;
    status: 'active' | 'inactive';
    usages_count?: number;
    usages_sum_discount_amount?: string | null;
    category_ids?: number[];
    product_ids?: number[];
    total_discount_given?: number;
    usages?: Array<{
        id: number;
        discount_amount: number;
        used_at: string | null;
        user: { id: number; name: string; email: string } | null;
        order: { id: number; order_number: string } | null;
    }>;
    created_at: string;
    updated_at: string;
};

export type ProductImage = {
    id: number;
    product_id: number;
    image: string;
    sort_order: number;
    color_value_id?: number | null;
};

export type ProductOffer = {
    title: string;
    detail: string;
    code: string;
};

export type AttributeValueOption = {
    id: number;
    attribute_id: number;
    value: string;
    slug: string;
    meta?: { hex?: string } | null;
    attribute?: { id: number; name: string; slug: string; input_type?: string };
};

export type CategoryFilterAttribute = {
    attributeId: number;
    name: string;
    slug: string;
    inputType: string;
    isRequired: boolean;
    values: AttributeValueOption[];
};

export type CategoryFilterAttributesMap = Record<number, CategoryFilterAttribute[]>;

export type ProductVariant = {
    id: number;
    product_id: number;
    original_price: string;
    sale_price: string;
    display_rating: string;
    display_review_count: number;
    stock: number;
    sku: string;
    status: 'active' | 'inactive';
    option_values?: AttributeValueOption[];
};

export type Product = {
    id: number;
    category_id: number;
    product_type?: 'clothing' | 'jewellery';
    brand_id: number | null;
    name: string;
    slug: string;
    sku: string;
    short_description: string | null;
    description: string | null;
    care_instructions?: string | null;
    details?: Record<string, string> | string[] | null;
    original_price: string;
    sale_price: string;
    display_rating?: string;
    display_review_count?: number;
    stock: number;
    thumbnail: string | null;
    weight: string | null;
    is_featured: boolean;
    status: 'active' | 'inactive';
    category?: { id: number; name: string };
    brand?: { id: number; name: string } | null;
    images?: ProductImage[];
    offers?: ProductOffer[];
    variants?: ProductVariant[];
    attribute_values?: AttributeValueOption[];
    variants_count?: number;
    variants_sum_stock?: number;
    images_count?: number;
    created_at: string;
    updated_at: string;
};

export type SelectOption = {
    id: number;
    name: string;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    email_verified_at: string | null;
    orders_count?: number;
    created_at: string;
};

export type AdminOrder = {
    id: number;
    order_number: string;
    user_id: number;
    subtotal: string;
    discount_amount: string;
    coupon_discount: string;
    shipping_charge: string;
    tax_amount: string;
    grand_total: string;
    payment_method: string;
    payment_status: string;
    order_status: string;
    coupon_code: string | null;
    transaction_id: string | null;
    placed_at: string | null;
    estimated_delivery_date: string | null;
    shipping_address_snapshot?: {
        full_name?: string | null;
        phone?: string | null;
        alternate_phone?: string | null;
        date_of_birth?: string | null;
        address_line_1?: string | null;
        address_line_2?: string | null;
        landmark?: string | null;
        city?: string | null;
        state?: string | null;
        country?: string | null;
        pincode?: string | null;
    } | null;
    items_count?: number;
    user?: {
        id: number;
        name: string;
        email: string;
        phone?: string | null;
    };
    items?: AdminOrderItem[];
    trackings?: AdminOrderTracking[];
    payments?: AdminPayment[];
    shipment?: AdminShippingShipment | null;
    coupon?: { id: number; code: string; title: string | null } | null;
    created_at: string;
};

export type AdminOrderItem = {
    id: number;
    product_name: string;
    quantity: number;
    sale_price: string;
    variant_label: string | null;
};

export type AdminOrderTracking = {
    id: number;
    status: string;
    remarks: string | null;
    created_at: string | null;
};

export type AdminShippingShipment = {
    id: number;
    order_id: number;
    velocity_order_id: string | null;
    velocity_shipment_id: string | null;
    awb_number: string | null;
    warehouse_id: string;
    courier_name: string | null;
    carrier_id: string | null;
    tracking_url: string | null;
    label_url: string | null;
    manifest_url: string | null;
    shipping_charge: string | null;
    cod_charge: string | null;
    weight: string | null;
    length: string | null;
    breadth: string | null;
    height: string | null;
    shipment_status: string;
    tracking_status: string | null;
    pickup_status: string | null;
    pickup_date: string | null;
    delivery_date: string | null;
    cancelled_at: string | null;
    last_tracked_at: string | null;
    pickup_generated: boolean;
    manifest_generated: boolean;
    failure_reason: string | null;
    display_failure_reason?: string | null;
    created_at: string;
    updated_at: string;
};

export type AdminPayment = {
    id: number;
    order_id: number;
    payment_gateway: string;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    transaction_id: string | null;
    amount: string;
    currency: string;
    status: string;
    paid_at: string | null;
    created_at: string | null;
    order?: {
        id: number;
        order_number: string;
        grand_total?: string;
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
};
