import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { homeBrand } from '@/data/home-brand';

export const HOME_ANNOUNCEMENT_HEIGHT = 36;

interface AnnouncementOffer {
    id: number | string;
    text: string;
    highlight: string;
}

function AnnouncementOfferText({ offer }: { offer: AnnouncementOffer }) {
    if (offer.highlight && offer.text.includes(offer.highlight)) {
        return (
            <>
                {offer.text.split(offer.highlight).map((part, i, arr) => (
                    <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                            <span className="font-semibold text-white">{offer.highlight}</span>
                        )}
                    </span>
                ))}
            </>
        );
    }

    return <>{offer.text}</>;
}

function AnnouncementMarqueeTrack({
    offers,
    ariaHidden = false,
}: {
    offers: AnnouncementOffer[];
    ariaHidden?: boolean;
}) {
    return (
        <div
            className="flex shrink-0 items-center"
            aria-hidden={ariaHidden || undefined}
        >
            {offers.map((offer, index) => (
                <span key={`${offer.id}-${index}`} className="flex shrink-0 items-center whitespace-nowrap">
                    <span className="px-8 text-[11px] font-normal tracking-wide text-white/95 sm:px-10 sm:text-xs">
                        <AnnouncementOfferText offer={offer} />
                    </span>
                    <span className="text-white/35" aria-hidden>
                        •
                    </span>
                </span>
            ))}
        </div>
    );
}

export function HomeAnnouncementBar() {
    const { announcementOffers } = usePage<{
        announcementOffers?: AnnouncementOffer[];
    }>().props;

    const offers = announcementOffers ?? [];

    const marqueeDuration = useMemo(() => {
        const totalChars = offers.reduce((sum, offer) => sum + offer.text.length, 0);
        return Math.max(24, Math.min(60, totalChars * 0.18));
    }, [offers]);

    if (offers.length === 0) return null;

    return (
        <div
            className="relative h-9 overflow-hidden text-white"
            style={{ backgroundColor: homeBrand.primaryDeep }}
            role="region"
            aria-label="Store announcements"
        >
            <div
                className="home-announcement-marquee flex h-9 w-max items-center"
                style={{ animationDuration: `${marqueeDuration}s` }}
            >
                <AnnouncementMarqueeTrack offers={offers} />
                <AnnouncementMarqueeTrack offers={offers} ariaHidden />
            </div>
        </div>
    );
}
