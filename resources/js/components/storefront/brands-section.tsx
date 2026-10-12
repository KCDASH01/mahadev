// resources/js/components/storefront/brands-section.tsx
import { useState } from 'react';
import SectionHeading from '@/components/storefront/section-heading';
import { mediaUrl } from '@/lib/media-url';
import type { HomepageBrand } from '@/types/homepage';

function BrandLogo({
    logo,
    name,
}: {
    logo: string | null;
    name: string;
}) {
    const [failed, setFailed] = useState(false);

    if (logo && !failed) {
        return (
            <img
                src={logo}
                alt={name}
                className="max-h-7 max-w-7 object-contain"
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <span className="text-xs font-bold text-slate-700">
            {name.charAt(0)}
        </span>
    );
}

export default function BrandsSection({ brands }: { brands: HomepageBrand[] }) {
    if (brands.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto w-full max-w-[1440px] px-3 py-6 sm:px-4 sm:py-8 md:py-12">
            <SectionHeading
                title="Featured Brands"
                description="Discover lots products from popular brands"
            />

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-4 md:mt-8 lg:grid-cols-5">
                {brands.map((brand) => {
                    const logo = mediaUrl(brand.logo);
                    const featuredImage = mediaUrl(brand.featured_image);

                    return (
                        <a
                            key={brand.id}
                            href={`/brands/${brand.slug}`}
                            className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            {featuredImage ? (
                                <img
                                    src={featuredImage}
                                    alt={brand.name}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/15 to-transparent" />

                            <div className="absolute top-0 right-0 left-0 p-3 sm:p-4">
                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white p-1.5 shadow-sm sm:size-10">
                                        <BrandLogo logo={logo} name={brand.name} />
                                    </div>
                                    <div className="min-w-0 pt-0.5">
                                        <h3 className="truncate text-sm font-bold text-white sm:text-base">
                                            {brand.name}
                                        </h3>
                                        {brand.tagline && (
                                            <p className="mt-0.5 truncate text-[11px] text-white/85 sm:text-xs">
                                                {brand.tagline}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}
