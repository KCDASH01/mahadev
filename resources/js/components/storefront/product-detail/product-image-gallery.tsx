import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn } from 'lucide-react';
import { mediaUrl } from '@/lib/media-url';

function resolveGalleryImage(image: string) {
    return mediaUrl(image) ?? image;
}

function GalleryTile({
    src,
    alt,
    onOpen,
}: {
    src: string;
    alt: string;
    onOpen: () => void;
}) {
    const [failed, setFailed] = useState(false);

    return (
        <button
            type="button"
            onClick={onOpen}
            className="group relative block aspect-[3/4] w-full overflow-hidden bg-[#F3F3F3] text-left"
            aria-label={`View larger: ${alt}`}
        >
            {!failed ? (
                <>
                    <img
                        src={src}
                        alt={alt}
                        referrerPolicy="no-referrer"
                        onError={() => setFailed(true)}
                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.1] group-active:scale-[1.06] motion-reduce:transition-none"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                    <span className="pointer-events-none absolute right-2 bottom-2 grid size-8 place-items-center rounded-full bg-white/90 text-[#09233D] opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100 sm:right-3 sm:bottom-3">
                        <ZoomIn className="size-4" strokeWidth={1.75} />
                    </span>
                </>
            ) : (
                <span className="flex h-full items-center justify-center text-slate-300">
                    <ImageOff className="size-10" />
                </span>
            )}
        </button>
    );
}

export function ProductImageGallery({
    images,
    productName,
    className = '',
}: {
    images: string[];
    productName: string;
    className?: string;
}) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const galleryImages = images
        .map((image) => resolveGalleryImage(image))
        .filter(Boolean) as string[];

    const closeLightbox = useCallback(() => setLightboxIndex(null), []);

    const showPrevious = useCallback(() => {
        setLightboxIndex((current) => {
            if (current === null || galleryImages.length < 2) {
                return current;
            }

            return (current - 1 + galleryImages.length) % galleryImages.length;
        });
    }, [galleryImages.length]);

    const showNext = useCallback(() => {
        setLightboxIndex((current) => {
            if (current === null || galleryImages.length < 2) {
                return current;
            }

            return (current + 1) % galleryImages.length;
        });
    }, [galleryImages.length]);

    useEffect(() => {
        if (lightboxIndex === null) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeLightbox();
                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                showPrevious();
                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                showNext();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [closeLightbox, lightboxIndex, showNext, showPrevious]);

    if (galleryImages.length === 0) {
        return (
            <div
                className={`flex aspect-[3/4] items-center justify-center bg-[#F3F3F3] text-slate-300 ${className}`}
            >
                <ImageOff className="size-12" />
            </div>
        );
    }

    const activeLightboxImage =
        lightboxIndex !== null ? galleryImages[lightboxIndex] : null;
    const hasMultipleImages = galleryImages.length > 1;

    return (
        <>
            <div
                className={`grid grid-cols-2 gap-2 sm:gap-3 lg:gap-3.5 ${className}`}
            >
                {galleryImages.map((image, index) => (
                    <div
                        key={`${image}-${index}`}
                        className={galleryImages.length === 1 ? 'col-span-2' : ''}
                    >
                        <GalleryTile
                            src={image}
                            alt={`${productName} — view ${index + 1}`}
                            onOpen={() => setLightboxIndex(index)}
                        />
                    </div>
                ))}
            </div>

            {activeLightboxImage && lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-4 sm:p-8"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${productName} image preview`}
                    onClick={closeLightbox}
                >
                    <button
                        type="button"
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                        aria-label="Close image preview"
                    >
                        <X className="size-5" />
                    </button>

                    {hasMultipleImages && (
                        <>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    showPrevious();
                                }}
                                className="absolute top-1/2 left-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 sm:left-6 sm:size-12"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="size-6" strokeWidth={2} />
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    showNext();
                                }}
                                className="absolute top-1/2 right-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 sm:right-6 sm:size-12"
                                aria-label="Next image"
                            >
                                <ChevronRight className="size-6" strokeWidth={2} />
                            </button>
                            <p className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium tracking-wide text-white/90">
                                {lightboxIndex + 1} / {galleryImages.length}
                            </p>
                        </>
                    )}

                    <img
                        src={activeLightboxImage}
                        alt={`${productName} — enlarged view ${lightboxIndex + 1}`}
                        className="max-h-[90vh] max-w-full object-contain"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}

export default ProductImageGallery;
