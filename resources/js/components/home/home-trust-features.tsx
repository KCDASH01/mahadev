import { motion } from 'framer-motion';
import { CreditCard, Package, Sparkles, Star } from 'lucide-react';
import { trustFeatures } from '@/data/home-content';

const iconMap = {
    customers: Star,
    delivery: Package,
    payments: CreditCard,
    handcrafted: Sparkles,
};

export function HomeTrustFeatures() {
    return (
        <section className="border-y border-[#E8DDC5]/70 bg-[#F7F4F1] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-6xl">
                <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-6 xl:gap-8">
                    {trustFeatures.map((feature, index) => {
                        const Icon = iconMap[feature.icon];

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.35 }}
                                transition={{ duration: 0.45, delay: index * 0.06 }}
                                className="flex flex-col items-center px-2 text-center sm:px-4"
                            >
                                <div className="grid h-14 w-14 place-items-center text-[#09233D]">
                                    <Icon className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={1.35} />
                                </div>
                                <h3 className="mt-4 font-helvetica text-lg font-semibold tracking-tight text-[#09233D] tabular-nums sm:mt-5 sm:text-xl">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 max-w-[240px] text-sm leading-6 text-[#647487] sm:text-[15px] sm:leading-7">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
