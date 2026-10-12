import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { mediaUrl } from '@/lib/media-url';
import type { ExploreCollection } from '@/types/storefront';

export function HomeExploreCollections({
    collections = [],
}: {
    collections?: ExploreCollection[];
}) {
    if (collections.length === 0) {
        return null;
    }

    return (
        <section id="collections" className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                    className="text-center"
                >
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-[#D6A62D] uppercase">
                        Garments &amp; Furniture
                    </p>
                    <h2 className="font-helvetica text-4xl font-medium tracking-tight text-[#09233D] sm:text-5xl">
                        Shop by Department
                    </h2>
                    <HomeBrandMotif className="mt-4" />
                </motion.div>

                <div className="mt-12 grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 sm:mt-14 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-12">
                    {collections.map((collection, index) => (
                        <motion.div
                            key={collection.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, delay: index * 0.06 }}
                            className="w-full max-w-[220px] sm:max-w-[240px]"
                        >
                            <Link
                                href={collection.href}
                                className="group flex flex-col items-center text-center"
                            >
                                <span className="relative block aspect-square w-full overflow-hidden rounded-full border border-[#062A4D]/45 bg-[#F7F4F1] shadow-[0_8px_24px_-16px_rgba(74,18,28,0.45)] ring-1 ring-[#062A4D]/15 transition duration-500 group-hover:border-[#062A4D] group-hover:shadow-[0_14px_28px_-14px_rgba(74,18,28,0.4)] group-hover:ring-[#062A4D]/35">
                                    <img
                                        src={mediaUrl(collection.image) ?? collection.image}
                                        alt={collection.title}
                                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                                        style={{
                                            objectPosition:
                                                collection.imagePosition ?? 'center center',
                                        }}
                                    />
                                </span>
                                <span className="mt-4 font-helvetica text-lg font-medium tracking-wide text-[#D6A62D] uppercase transition group-hover:text-[#041F3A] sm:mt-5 sm:text-xl">
                                    {collection.title}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
