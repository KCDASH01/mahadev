import { Star } from 'lucide-react';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { mediaUrl } from '@/lib/media-url';
import { asSeenOnBrands } from '@/data/home-content';
import type { TestimonialData } from '@/types/storefront';

function Rating({ value }: { value: number }) {
    return (
        <div className="flex gap-0.5 text-[#062A4D]">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${value >= star - 0.2 ? 'fill-current' : 'fill-none text-[#E8DDC5]'}`}
                />
            ))}
        </div>
    );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
    const sceneImage = mediaUrl(testimonial.sceneImage) ?? testimonial.sceneImage;

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E7DFC9] bg-white shadow-[0_12px_32px_-24px_rgba(74,18,28,0.35)]">
            <div className="aspect-[4/5] overflow-hidden bg-[#F5F1E8] sm:aspect-[3/4]">
                <img
                    src={sceneImage}
                    alt={`${testimonial.name} shopping with Mahadev`}
                    className="h-full w-full object-cover object-top"
                />
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <Rating value={testimonial.rating} />
                <p className="mt-3 font-helvetica text-xl font-medium leading-snug text-[#09233D]">
                    &ldquo;{testimonial.headline}&rdquo;
                </p>
                <p className="mt-3 flex-1 text-sm leading-7 text-[#647487]">{testimonial.text}</p>
                <p className="mt-5 flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-[#062A4D] uppercase">
                    <span className="h-px w-5 bg-[#062A4D]/50" aria-hidden />
                    {testimonial.name}
                </p>
            </div>
        </article>
    );
}

export function HomeTestimonials({ testimonials = [] }: { testimonials?: TestimonialData[] }) {
    if (testimonials.length === 0) {
        return null;
    }

    return (
        <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="text-center">
                    <p className="text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">Reviews</p>
                    <h2 className="mt-3 font-helvetica text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl">
                        What Are People Saying?
                    </h2>
                    <HomeBrandMotif className="mt-4" />
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-4 xl:gap-8">
                    {testimonials.map((testimonial) => (
                        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                    ))}
                </div>

                <div className="mt-14 flex flex-col items-center gap-6 border-t border-[#E8DDC5] pt-10 sm:flex-row sm:justify-center sm:gap-10">
                    <p className="shrink-0 text-[11px] font-medium tracking-[0.24em] text-[#062A4D] uppercase">
                        As Seen On
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                        {asSeenOnBrands.map((brand) => (
                            <span
                                key={brand}
                                className="font-helvetica text-sm tracking-wide text-[#647487] italic sm:text-base"
                            >
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
