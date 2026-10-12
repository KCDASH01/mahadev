import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Mail, MapPin, Phone, ShieldCheck, Youtube } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { homeBrand } from '@/data/home-brand';

const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
];

const serviceLinks = [
    { label: 'Help Center', href: '/help-center' },
    { label: 'Returns & Refund Policy', href: '/returns-refund-policy' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    { label: 'Track Order', href: '/track-order' },
];

const shopLinks = [
    { label: 'Gents Garments', href: '/collection/gents' },
    { label: 'Ladies Garments', href: '/collection/ladies' },
    { label: 'Furniture', href: '/collection/furniture' },
    { label: 'New Arrivals', href: '/new-arrivals' },
];

const socialLinks = [
    { label: 'Instagram', href: homeBrand.socialLinks.instagram, Icon: Instagram },
    { label: 'Facebook', href: homeBrand.socialLinks.facebook, Icon: Facebook },
    { label: 'YouTube', href: homeBrand.socialLinks.youtube, Icon: Youtube },
    { label: 'WhatsApp', href: homeBrand.socialLinks.whatsapp, Icon: WhatsAppIcon },
];

function FooterLinkGroup({
    title,
    links,
}: {
    title: string;
    links: { label: string; href: string }[];
}) {
    return (
        <div>
            <h3 className="text-[11px] font-medium tracking-[0.22em] text-[#FCFAF5] uppercase">{title}</h3>
            <div className="mt-3 h-px w-8 bg-[#D6A62D]" />
            <ul className="mt-5 space-y-3">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="inline-flex text-sm text-white/70 transition duration-200 hover:text-[#F4D77C]"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FooterContactItem({
    icon: Icon,
    label,
    value,
    href,
}: {
    icon: typeof MapPin;
    label: string;
    value: string;
    href?: string;
}) {
    const content = (
        <div className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center border border-[#D6A62D]/30 text-[#F4D77C]">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <span>
                <span className="block text-[10px] font-medium tracking-[0.18em] text-white/50 uppercase">{label}</span>
                <span className="mt-1 block text-sm leading-6 text-white/88">{value}</span>
            </span>
        </div>
    );

    if (href) {
        return (
            <a href={href} className="group block transition hover:text-[#F4D77C]">
                {content}
            </a>
        );
    }

    return <div>{content}</div>;
}

export function HomeFooter() {
    return (
        <>
        <a
            href={homeBrand.socialLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="fixed right-4 bottom-24 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1EBE57] sm:right-6 sm:bottom-6"
        >
            <WhatsAppIcon className="h-7 w-7" />
        </a>
        <footer className="text-white" style={{ backgroundColor: homeBrand.primaryDeep }}>
            <div className="home-ikat-edge mx-auto w-full max-w-[1800px] px-4 py-14 sm:px-5 lg:px-8 lg:py-16">
                <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
                    <div className="max-w-md">
                        <h3 className="font-helvetica text-xl font-medium text-white">Contact Us</h3>
                        <p className="mt-1 text-sm text-white/55">
                            Reach us for orders, returns, and styling support.
                        </p>

                        <div className="mt-6 space-y-4">
                            <FooterContactItem icon={MapPin} label="Address" value={homeBrand.contactAddress} />
                            <FooterContactItem
                                icon={Mail}
                                label="Email"
                                value={homeBrand.contactEmail}
                                href={`mailto:${homeBrand.contactEmail}`}
                            />
                            <div className="flex gap-3">
                                <span className="grid h-9 w-9 shrink-0 place-items-center border border-[#D6A62D]/30 text-[#F4D77C]">
                                    <Phone className="h-4 w-4" strokeWidth={1.5} />
                                </span>
                                <span>
                                    <span className="block text-[10px] font-medium tracking-[0.18em] text-white/50 uppercase">
                                        Phone
                                    </span>
                                    <span className="mt-1 flex flex-col text-sm leading-6 text-white/88">
                                        {homeBrand.contactPhones.map((phone) => (
                                            <a
                                                key={phone}
                                                href={`tel:${phone.replace(/\s/g, '')}`}
                                                className="transition hover:text-[#F4D77C]"
                                            >
                                                {phone}
                                            </a>
                                        ))}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <p className="mt-6 text-sm leading-7 text-white/70">
                            A community-focused shopping destination for dependable garments and furniture,
                            bringing quality products and fair value together in one trusted place.
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 border border-white/12 bg-white/5 px-4 py-2 text-[10px] font-medium tracking-[0.14em] text-white/75 uppercase">
                            <ShieldCheck className="h-4 w-4 text-[#F4D77C]" strokeWidth={1.5} />
                            {homeBrand.trustStatement}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {socialLinks.map(({ label, href, Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    className="group grid h-10 w-10 place-items-center border border-white/15 bg-white/5 transition duration-300 hover:border-[#F4D77C] hover:bg-[#062A4D]"
                                >
                                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <FooterLinkGroup title="Company" links={companyLinks} />
                    <FooterLinkGroup title="Customer Service" links={serviceLinks} />
                    <FooterLinkGroup title="Shop" links={shopLinks} />
                </div>
            </div>

            <div className="border-t border-white/10 bg-black/20">
                <div className="mx-auto flex w-full max-w-[1800px] flex-col justify-between gap-4 px-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:px-5 lg:px-8">
                    <p>
                        Copyright {new Date().getFullYear()} {homeBrand.name}. All rights reserved.
                        {' · '}
                        <a
                            href="https://www.kanpritech.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="transition hover:text-[#F4D77C]"
                        >
                            Developed By Kapri Technologies
                        </a>
                    </p>
                    <div className="flex flex-wrap gap-5">
                        <Link href="/privacy-policy" className="transition hover:text-[#F4D77C]">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-and-conditions" className="transition hover:text-[#F4D77C]">
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
        </>
    );
}
