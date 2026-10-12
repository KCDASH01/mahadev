import { usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { themeColors } from '@/lib/theme-colors';
import type { AppSettings } from '@/types/settings';

const socialLabels: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
};

export default function SiteFooter() {
    const { appSettings } = usePage().props as { appSettings: AppSettings };
    const general = appSettings?.general;
    const socialLinks = appSettings?.social_links ?? {};

    if (!general && Object.keys(socialLinks).length === 0) {
        return null;
    }

    return (
        <footer
            className="mt-8 border-t text-white"
            style={{ backgroundColor: themeColors.footer }}
        >
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-3 py-10 sm:gap-10 sm:px-4 sm:py-12 md:grid-cols-4">
                <div className="md:col-span-2">
                    <p className="text-2xl font-bold">
                        {general?.site_name ?? 'Med Ecom'}
                    </p>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
                        Your trusted online store for hospital beds, oxygen
                        concentrators, BP monitors, wheelchairs, and home
                        healthcare essentials.
                    </p>
                </div>

                <div>
                    <p className="font-semibold">Contact</p>
                    <ul className="mt-4 space-y-3 text-sm text-white/75">
                        {general?.site_address && (
                            <li className="flex items-start gap-2">
                                <MapPin className="mt-0.5 size-4 shrink-0" />
                                <span>{general.site_address}</span>
                            </li>
                        )}
                        {general?.support_phone && (
                            <li className="flex items-center gap-2">
                                <Phone className="size-4 shrink-0" />
                                <a
                                    href={`tel:${general.support_phone}`}
                                    className="hover:text-white"
                                >
                                    {general.support_phone}
                                </a>
                            </li>
                        )}
                        {general?.support_email && (
                            <li className="flex items-center gap-2">
                                <Mail className="size-4 shrink-0" />
                                <a
                                    href={`mailto:${general.support_email}`}
                                    className="hover:text-white"
                                >
                                    {general.support_email}
                                </a>
                            </li>
                        )}
                    </ul>
                </div>

                <div>
                    <p className="font-semibold">Quick Links</p>
                    <ul className="mt-4 space-y-2 text-sm text-white/75">
                        <li>
                            <a href="/" className="hover:text-white">
                                Home
                            </a>
                        </li>
                        <li>
                            <a href="/offers" className="hover:text-white">
                                Offers
                            </a>
                        </li>
                        <li>
                            <a href="/contact" className="hover:text-white">
                                Contact
                            </a>
                        </li>
                    </ul>

                    {Object.keys(socialLinks).length > 0 && (
                        <nav
                            aria-label="Social media links"
                            className="mt-5 flex flex-wrap gap-2"
                        >
                            {Object.entries(socialLinks).map(
                                ([network, url]) => (
                                    <a
                                        key={network}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/90 transition hover:border-white/40 hover:text-white"
                                    >
                                        {socialLabels[network] ?? network}
                                    </a>
                                ),
                            )}
                        </nav>
                    )}
                </div>
            </div>

            <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
                © {new Date().getFullYear()} {general?.site_name ?? 'Med Ecom'}.
                All rights reserved.
            </div>
        </footer>
    );
}
