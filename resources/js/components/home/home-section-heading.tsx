import { motion } from 'framer-motion';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
};

export function HomeSectionHeading({
    eyebrow,
    title,
    description,
    align = 'center',
    light = false,
}: {
    eyebrow: string;
    title: string;
    description?: string;
    align?: 'center' | 'left';
    light?: boolean;
}) {
    const centered = align === 'center';

    return (
        <motion.div
            className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            variants={fadeUp}
        >
            <p
                className={`text-[11px] font-medium tracking-[0.28em] uppercase ${
                    light ? 'text-[#E8C9C4]' : 'text-[#062A4D]'
                }`}
            >
                {eyebrow}
            </p>
            <h2
                className={`mt-3 font-helvetica text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.65rem] ${
                    light ? 'text-white' : 'text-[#09233D]'
                }`}
            >
                {title}
            </h2>
            <HomeBrandMotif
                className={`mt-4 ${centered ? 'mx-auto' : 'mx-0'} ${light ? 'text-[#E8C9C4]' : ''}`}
            />
            {description && (
                <p
                    className={`mt-4 max-w-xl text-sm leading-7 sm:text-[15px] ${
                        light ? 'text-white/75' : 'text-[#647487]'
                    } ${centered ? 'mx-auto' : ''}`}
                >
                    {description}
                </p>
            )}
        </motion.div>
    );
}
