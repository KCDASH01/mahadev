// resources/js/components/storefront/testimonials-section.tsx
import { Quote, Star } from 'lucide-react';
import SectionHeading from '@/components/storefront/section-heading';
import { themeColors } from '@/lib/theme-colors';

const testimonials = [
    {
        name: 'Dr. Priya Sharma',
        role: 'General Physician, Pune',
        quote: 'MedEcom delivers genuine medical equipment with proper invoices. Our clinic orders BP monitors and nebulizers regularly — always reliable quality.',
        rating: 5,
    },
    {
        name: 'Ramesh Verma',
        role: 'Home Care Customer, Delhi',
        quote: 'Ordered a wheelchair for my father. Fast delivery, helpful support team, and the product matched the description exactly. Highly recommended.',
        rating: 5,
    },
    {
        name: 'Anita Desai',
        role: 'Pharmacy Owner, Mumbai',
        quote: 'Competitive pricing on pulse oximeters and glucometers. Bulk orders are handled smoothly and shipping is always on time.',
        rating: 4,
    },
];

export default function TestimonialsSection() {
    return (
        <section className="w-full px-3 py-4 sm:px-4 md:py-6">
            <div className="mx-auto max-w-[1440px]">
                <SectionHeading
                    title="What Our Customers Say"
                    description="Trusted by doctors, caregivers, and families across India"
                />

                <div className="grid gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
                    {testimonials.map((item) => (
                        <article
                            key={item.name}
                            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
                        >
                            <Quote
                                className="size-8 opacity-20"
                                style={{ color: themeColors.primary }}
                            />
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                                &ldquo;{item.quote}&rdquo;
                            </p>
                            <div className="mt-4 flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                        key={index}
                                        className={`size-4 ${
                                            index < item.rating
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-slate-200'
                                        }`}
                                    />
                                ))}
                            </div>
                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <p
                                    className="text-sm font-semibold"
                                    style={{ color: themeColors.secondary }}
                                >
                                    {item.name}
                                </p>
                                <p className="text-xs text-slate-500">{item.role}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
