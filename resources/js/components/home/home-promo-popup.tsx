import { Link } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { mediaUrl } from '@/lib/media-url';
import { useIsMobile } from '@/hooks/use-mobile';
import type { HomepagePopupData } from '@/types/storefront';

const SHOW_DELAY_MS = 4500;
const DISMISS_KEY = 'mahadev_homepage_popup_dismissed';

type HomePromoPopupProps = {
    popup: HomepagePopupData | null | undefined;
};

function dismissStorageKey(popup: HomepagePopupData): string {
    return `${DISMISS_KEY}:${popup.image}:${popup.mobileImage ?? ''}:${popup.link ?? ''}`;
}

function wasDismissed(popup: HomepagePopupData): boolean {
    try {
        return sessionStorage.getItem(dismissStorageKey(popup)) === '1';
    } catch {
        return false;
    }
}

function rememberDismissed(popup: HomepagePopupData): void {
    try {
        sessionStorage.setItem(dismissStorageKey(popup), '1');
    } catch {
        // ignore
    }
}

export function HomePromoPopup({ popup }: HomePromoPopupProps) {
    const titleId = useId();
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    const close = useCallback(() => {
        if (popup) {
            rememberDismissed(popup);
        }
        setOpen(false);
    }, [popup]);

    useEffect(() => {
        if (!popup?.image || wasDismissed(popup)) {
            setOpen(false);
            return;
        }

        const timer = window.setTimeout(() => {
            setOpen(true);
        }, SHOW_DELAY_MS);

        return () => {
            window.clearTimeout(timer);
        };
    }, [popup]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, close]);

    if (!popup?.image || !open) {
        return null;
    }

    const source = isMobile && popup.mobileImage ? popup.mobileImage : popup.image;
    const imageSrc = mediaUrl(source) ?? source;
    const link = popup.link?.trim() || null;
    const isInternal = Boolean(link && link.startsWith('/') && !link.startsWith('//'));

    const image = (
        <img
            src={imageSrc}
            alt="Promotional offer"
            className="mx-auto max-h-[min(72dvh,720px)] w-full object-contain"
        />
    );

    return (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6">
            <button
                type="button"
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                aria-label="Close promotional popup"
                onClick={close}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative z-10 w-full max-w-[min(100%,420px)] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] sm:max-w-[480px]"
            >
                <h2 id={titleId} className="sr-only">
                    Promotional offer
                </h2>

                <button
                    type="button"
                    onClick={close}
                    className="absolute top-2 right-2 z-10 grid size-10 place-items-center rounded-full bg-white/95 text-[#09233D] shadow-md transition hover:bg-white"
                    aria-label="Close"
                >
                    <X className="size-5" />
                </button>

                {link ? (
                    isInternal ? (
                        <Link href={link} onClick={close} className="block">
                            {image}
                        </Link>
                    ) : (
                        <a href={link} onClick={close} className="block">
                            {image}
                        </a>
                    )
                ) : (
                    image
                )}
            </div>
        </div>
    );
}
