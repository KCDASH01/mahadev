import { mediaUrl } from '@/lib/media-url';
import type { PromoStripData } from '@/types/storefront';

export function HomeSubBanners({ promoStrip }: { promoStrip?: PromoStripData | null }) {
    if (!promoStrip?.image) {
        return null;
    }

    const desktopSrc = mediaUrl(promoStrip.image) ?? promoStrip.image;
    const mobileSrc = mediaUrl(promoStrip.mobileImage) ?? promoStrip.mobileImage ?? desktopSrc;
    const hasMobileImage = Boolean(promoStrip.mobileImage);

    return (
        <section className="w-full bg-white">
            {hasMobileImage ? (
                <>
                    <img
                        src={mobileSrc}
                        alt="Promotional offer"
                        className="block h-[240px] w-full object-cover object-center md:hidden"
                        loading="lazy"
                        decoding="async"
                    />
                    <img
                        src={desktopSrc}
                        alt=""
                        className="hidden h-[300px] w-full object-cover object-center md:block lg:h-[360px]"
                        loading="lazy"
                        decoding="async"
                    />
                </>
            ) : (
                <img
                    src={desktopSrc}
                    alt="Promotional offer"
                    className="block h-[200px] w-full object-cover object-center sm:h-[250px] md:h-[300px] lg:h-[360px]"
                    loading="lazy"
                    decoding="async"
                />
            )}
        </section>
    );
}
