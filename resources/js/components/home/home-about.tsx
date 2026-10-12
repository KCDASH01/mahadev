import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { pageHeroImages } from '@/data/home-content';

const highlights = [
    'A complete range of garments for gents and ladies',
    'Furniture for living, bedroom, storage and kitchen needs',
    'Transparent pricing and secure online ordering',
    'A community-first co-operative approach to service',
];

export function HomeAbout() {
    return (
        <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-2xl border border-[#E7DFC9]"
                >
                    <img
                        src={pageHeroImages.about}
                        alt="Mahadev garments and furniture collection"
                        className="aspect-[4/5] w-full object-cover lg:aspect-[5/6]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#03182D]/30 to-transparent" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">
                        About Mahadev
                    </p>
                    <h2 className="mt-3 font-helvetica text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl">
                        Everyday Essentials. Co-operative Values.
                    </h2>
                    <HomeBrandMotif className="mx-0 mt-4" />
                    <p className="mt-5 text-base leading-8 text-[#647487]">
                        Mahadev Multipurpose Co-operative Society Ltd brings garments and furniture together under
                        one dependable roof. From jeans, shirts, sarees and kurtis to sofas, beds, storage and kitchen
                        stands, every department is designed around practical choice and lasting value.
                    </p>
                    <p className="mt-4 text-base font-medium leading-8 text-[#09233D]">
                        Our promise: quality, value and responsible service.
                    </p>

                    <ul className="mt-8 space-y-4">
                        {highlights.map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-3 text-sm font-medium text-[#09233D] sm:text-[15px]"
                            >
                                <CheckCircle2
                                    className="mt-0.5 h-5 w-5 shrink-0 text-[#062A4D]"
                                    strokeWidth={1.6}
                                />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <Link
                        href="/about"
                        className="mt-10 inline-flex h-11 items-center gap-2 bg-[#062A4D] px-7 text-[11px] font-medium tracking-[0.2em] text-[#FCFAF5] uppercase transition hover:bg-[#041F3A]"
                    >
                        Discover Mahadev
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
