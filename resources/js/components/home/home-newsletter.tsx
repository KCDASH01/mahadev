import { motion } from 'framer-motion';
import { CheckCircle2, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

export function HomeNewsletter() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmed = email.trim();

        if (!trimmed) {
            toast.error('Please enter your email address.');
            return;
        }

        setSubscribed(true);
        toast.success('Thanks for subscribing!');
    };

    return (
        <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="home-ikat-wash mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#03182D] p-8 text-[#FCFAF5] sm:p-12 lg:p-14"
            >
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div>
                        <p className="text-[11px] font-medium tracking-[0.28em] text-[#F4D77C] uppercase">Newsletter</p>
                        <h2 className="mt-3 font-helvetica text-3xl font-medium tracking-tight sm:text-4xl">Stay Updated with Mahadev</h2>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-[15px]">
                            Join our list for new arrivals, style inspiration, and store updates delivered straight to
                            your inbox.
                        </p>
                    </div>

                    {subscribed ? (
                        <div className="border border-white/15 bg-white/8 p-6 text-center sm:p-8">
                            <CheckCircle2 className="mx-auto h-10 w-10 text-[#F4D77C]" strokeWidth={1.5} />
                            <p className="mt-4 font-helvetica text-2xl font-medium">You&apos;re on the list!</p>
                            <p className="mt-2 text-sm leading-6 text-white/80">
                                Thanks for joining Mahadev. We&apos;ll keep you updated on new arrivals and special
                                inspiration.
                            </p>
                        </div>
                    ) : (
                        <form
                            className="border border-white/15 bg-white/8 p-2"
                            onSubmit={handleSubmit}
                        >
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <label className="relative flex-1">
                                    <span className="sr-only">Email address</span>
                                    <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/55" strokeWidth={1.6} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="h-12 w-full border-0 bg-transparent pr-4 pl-11 text-sm text-white outline-none placeholder:text-white/45 focus:ring-0"
                                    />
                                </label>
                                <button
                                    type="submit"
                                    className="h-12 shrink-0 bg-[#FCFAF5] px-6 text-[11px] font-medium tracking-[0.2em] text-[#03182D] uppercase transition hover:bg-white"
                                >
                                    Subscribe
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </section>
    );
}
