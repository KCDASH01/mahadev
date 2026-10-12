import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

type HorizontalScrollRowProps = {
    children: ReactNode;
    className?: string;
    itemClassName?: string;
};

export default function HorizontalScrollRow({
    children,
    className = '',
    itemClassName = '',
}: HorizontalScrollRowProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const track = trackRef.current;
        if (!track) {
            return;
        }

        setCanScrollLeft(track.scrollLeft > 4);
        setCanScrollRight(
            track.scrollLeft < track.scrollWidth - track.clientWidth - 4,
        );
    }, []);

    useEffect(() => {
        updateScrollState();
        const track = trackRef.current;
        if (!track) {
            return;
        }

        const observer = new ResizeObserver(updateScrollState);
        observer.observe(track);
        window.addEventListener('resize', updateScrollState);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateScrollState);
        };
    }, [updateScrollState, children]);

    const scroll = (direction: 'left' | 'right') => {
        const track = trackRef.current;
        if (!track) {
            return;
        }

        const scrollAmount = Math.max(track.clientWidth * 0.85, 280);
        track.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <div className={`group/scroll relative ${className}`}>
            {canScrollLeft && (
                <button
                    type="button"
                    onClick={() => scroll('left')}
                    className="absolute top-1/2 left-1 z-10 hidden -translate-y-1/2 items-center justify-center border border-[#E8DDC5] bg-[#FCFAF5] p-2 text-[#09233D] shadow-sm transition hover:border-[#062A4D] hover:text-[#062A4D] md:flex"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="size-5" />
                </button>
            )}

            {canScrollRight && (
                <button
                    type="button"
                    onClick={() => scroll('right')}
                    className="absolute top-1/2 right-1 z-10 hidden -translate-y-1/2 items-center justify-center border border-[#E8DDC5] bg-[#FCFAF5] p-2 text-[#09233D] shadow-sm transition hover:border-[#062A4D] hover:text-[#062A4D] md:flex"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="size-5" />
                </button>
            )}

            <div
                ref={trackRef}
                onScroll={updateScrollState}
                className={`flex overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${itemClassName}`}
            >
                {children}
            </div>
        </div>
    );
}
