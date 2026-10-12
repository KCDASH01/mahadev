import { homeBrand } from '@/data/home-brand';

export type StaticPageSection = {
    heading?: string;
    paragraphs?: string[];
    bullets?: string[];
};

export type StaticPageContent = {
    title: string;
    subtitle: string;
    sections: StaticPageSection[];
};

export const staticPages: Record<string, StaticPageContent> = {
    about: {
        title: 'About Mahadev',
        subtitle: 'Everyday essentials guided by co-operative values.',
        sections: [
            {
                paragraphs: [
                    'Mahadev Multipurpose Co-operative Society Ltd is a community-focused destination for garments and furniture.',
                    'Our garment range includes jeans, shirts, T-shirts, kurtas and blazers for gents, plus sarees, tops, jeans, kurtis and lehengas for ladies. Our furniture range covers sofas, beds, dressing tables, Alena, shoe racks, almirahs, kitchen stands and vegetable stands.',
                ],
            },
            {
                heading: 'Our Promise: Quality. Value. Responsibility.',
                paragraphs: [
                    'At Mahadev, we believe everyday shopping should be dependable, transparent and easy to access.',
                    'We focus on useful products, fair value and responsible service for every customer.',
                    'Every product is organized clearly so customers can compare, order and receive support with confidence.',
                ],
            },
            {
                heading: 'A Multipurpose Co-operative Approach',
                paragraphs: [
                    'Our purpose is to serve practical household and clothing needs through one trusted, community-minded organization.',
                    'By choosing Mahadev, you support a business built around shared value and long-term relationships.',
                ],
            },
            {
                paragraphs: [
                    'Mahadev — Garments. Furniture. Community value.',
                ],
            },
        ],
    },
    contact: {
        title: 'Contact Us',
        subtitle: 'We are here to help with orders, sizing, returns, and product questions.',
        sections: [
            {
                paragraphs: [
                    'Reach out to the Mahadev team using the details below. We typically respond within one business day.',
                ],
            },
            {
                heading: 'Store pickup address',
                paragraphs: [homeBrand.contactAddress],
            },
            {
                heading: 'Email',
                paragraphs: [homeBrand.contactEmail],
            },
            {
                heading: 'Phone',
                paragraphs: [...homeBrand.contactPhones],
            },
        ],
    },
    'help-center': {
        title: 'Help Center',
        subtitle: 'Quick answers for shopping, orders, payments, and account support.',
        sections: [
            {
                heading: 'Shopping & sizing',
                paragraphs: [
                    'Browse Garments by Gents or Ladies, or explore Furniture from the navigation menu. Use product filters to narrow by category, size, color, material, and price.',
                ],
                bullets: [
                    'Check the size guide on each product page',
                    'Compare fabric and fit details before checkout',
                    'Use filters on collection pages for faster discovery',
                ],
            },
            {
                heading: 'Orders & payments',
                paragraphs: [
                    'We support secure checkout with popular payment methods including cards, UPI, and Razorpay.',
                ],
                bullets: [
                    'Order confirmation is sent after successful payment',
                    'Prepaid orders may qualify for additional offers shown at checkout',
                    'Contact us if your payment succeeds but the order is not visible',
                ],
            },
            {
                heading: 'Need more help?',
                paragraphs: [
                    'Visit our Contact page or email us directly for personalized support.',
                ],
            },
        ],
    },
    'returns-refund-policy': {
        title: 'Returns & Refund Policy',
        subtitle: 'Simple, fair returns designed for a better shopping experience.',
        sections: [
            {
                heading: 'Return window',
                paragraphs: [
                    'Eligible items may be returned within 7 days of delivery if unused, unworn, and in original packaging with tags intact.',
                ],
            },
            {
                heading: 'Non-returnable items',
                bullets: [
                    'Innerwear, socks, and personal-care fashion accessories',
                    'Customized or altered products',
                    'Final sale or clearance items marked non-returnable',
                ],
            },
            {
                heading: 'Refund timeline',
                paragraphs: [
                    'Approved refunds are processed within 5–7 business days to the original payment method. Bank processing times may vary.',
                ],
            },
        ],
    },
    'shipping-policy': {
        title: 'Shipping Policy',
        subtitle: 'Reliable delivery across India with clear timelines and tracking support.',
        sections: [
            {
                heading: 'Processing time',
                paragraphs: [
                    'Orders are usually processed within 1–2 business days after confirmation. During peak sale periods, processing may take slightly longer.',
                ],
            },
            {
                heading: 'Delivery estimates',
                bullets: [
                    'Metro cities: 3–5 business days',
                    'Other serviceable locations: 5–8 business days',
                    'Remote areas may require additional time',
                ],
            },
            {
                heading: 'Free shipping',
                paragraphs: [
                    'Enjoy free standard shipping on orders above ₹999, as shown on the homepage and checkout.',
                ],
            },
        ],
    },
    'track-order': {
        title: 'Track Order',
        subtitle: 'Follow your Mahadev order from dispatch to delivery.',
        sections: [
            {
                paragraphs: [
                    'Once your order ships, you will receive tracking details by SMS and email if provided at checkout.',
                ],
            },
            {
                heading: 'How to track',
                bullets: [
                    'Check your order confirmation message for the tracking link',
                    'Use the courier tracking number on the carrier website',
                    'Contact support with your order ID if tracking is unavailable after 48 hours',
                ],
            },
            {
                heading: 'Delivery issues',
                paragraphs: [
                    'If your package is delayed, marked delivered but not received, or arrives damaged, contact us within 48 hours so we can assist quickly.',
                ],
            },
        ],
    },
    'privacy-policy': {
        title: 'Privacy Policy',
        subtitle: 'How Mahadev collects, uses, and protects your information.',
        sections: [
            {
                paragraphs: [
                    'We collect information you provide when creating an account, placing an order, or contacting support. This may include your name, phone number, email address, shipping details, and payment-related metadata processed securely by our payment partners.',
                ],
            },
            {
                heading: 'How we use your data',
                bullets: [
                    'Process and deliver orders',
                    'Provide customer support and order updates',
                    'Improve website experience and product recommendations',
                    'Send promotional communication when you opt in',
                ],
            },
            {
                heading: 'Your choices',
                paragraphs: [
                    'You may request correction or deletion of personal data by contacting our support team, subject to legal and operational requirements.',
                ],
            },
        ],
    },
    'terms-and-conditions': {
        title: 'Terms & Conditions',
        subtitle: 'Please read these terms carefully before using Mahadev.',
        sections: [
            {
                paragraphs: [
                    'By accessing or purchasing from Mahadev, you agree to these terms. Product images are representative; slight color or texture variation may occur due to photography and fabric batches.',
                ],
            },
            {
                heading: 'Pricing & availability',
                bullets: [
                    'Prices are listed in INR and may change without notice',
                    'Promotional offers are subject to stated conditions',
                    'We reserve the right to cancel orders affected by stock or pricing errors',
                ],
            },
            {
                heading: 'Limitation of liability',
                paragraphs: [
                    'Mahadev is not liable for indirect or consequential damages arising from use of the website or delayed delivery caused by factors outside our reasonable control.',
                ],
            },
        ],
    },
};
