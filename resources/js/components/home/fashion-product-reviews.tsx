import { Link, router, usePage } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { authUrlWithRedirect } from '@/lib/auth-redirect';
import { productPath, productReviewsPath } from '@/lib/storefront-paths';
import type { Auth } from '@/types/auth';
import type { ProductReview, RatingSummary } from '@/types/product';

type FashionProductReviewsProps = {
    productSlug: string;
    reviews: ProductReview[];
    ratingSummary: RatingSummary;
    userReview: ProductReview | null;
    /** Admin-seeded fallback when no approved customer reviews exist yet. */
    displayRating?: number;
    displayReviewCount?: number;
};

function StarRating({
    value,
    onChange,
    readonly = false,
    size = 'md',
}: {
    value: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md';
}) {
    const starClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => {
                const rating = index + 1;
                const filled = rating <= value;

                if (readonly) {
                    return (
                        <Star
                            key={rating}
                            className={`${starClass} ${
                                filled ? 'fill-[#F5D020] text-[#F5D020]' : 'text-slate-200'
                            }`}
                        />
                    );
                }

                return (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => onChange?.(rating)}
                        className="p-0.5 transition hover:scale-105"
                        aria-label={`Rate ${rating} stars`}
                    >
                        <Star
                            className={`${starClass} ${
                                filled ? 'fill-[#F5D020] text-[#F5D020]' : 'text-slate-300'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export function FashionProductReviews({
    productSlug,
    reviews,
    ratingSummary,
    userReview,
    displayRating = 0,
    displayReviewCount = 0,
}: FashionProductReviewsProps) {
    const { auth, errors } = usePage().props as {
        auth?: Auth;
        errors?: Record<string, string>;
    };
    const [rating, setRating] = useState(userReview?.rating ?? 0);
    const [title, setTitle] = useState(userReview?.title ?? '');
    const [body, setBody] = useState(userReview?.comment ?? '');
    const [submitting, setSubmitting] = useState(false);
    const reviewReturnUrl = `${productPath(productSlug)}#reviews`;
    const loginUrl = authUrlWithRedirect('/login', reviewReturnUrl);

    const summary: RatingSummary =
        ratingSummary.total > 0
            ? ratingSummary
            : (() => {
                  const average = displayRating || 0;
                  const total = displayReviewCount || 0;
                  const breakdown: RatingSummary['breakdown'] = {
                      5: 0,
                      4: 0,
                      3: 0,
                      2: 0,
                      1: 0,
                  };

                  if (total > 0 && average > 0) {
                      const bucket = Math.min(5, Math.max(1, Math.round(average))) as
                          | 1
                          | 2
                          | 3
                          | 4
                          | 5;
                      breakdown[bucket] = total;
                  }

                  return { average, total, breakdown };
              })();

    useEffect(() => {
        setRating(userReview?.rating ?? 0);
        setTitle(userReview?.title ?? '');
        setBody(userReview?.comment ?? '');
    }, [userReview]);

    useEffect(() => {
        if (window.location.hash !== '#reviews') {
            return;
        }

        const timer = window.setTimeout(() => {
            document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);

        return () => window.clearTimeout(timer);
    }, []);

    const handleSubmit = () => {
        if (!auth?.user) {
            router.visit(loginUrl);
            return;
        }

        setSubmitting(true);

        router.post(
            productReviewsPath(productSlug),
            {
                rating,
                title: title.trim() || null,
                body,
            },
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <section id="reviews" className="border-t border-slate-100 bg-white px-6 py-12 sm:px-10 lg:px-12 lg:py-14">
            <div className="mx-auto max-w-[1200px]">
                <h2 className="text-center text-lg font-bold tracking-[0.12em] text-neutral-900 uppercase sm:text-xl">
                    Ratings &amp; Reviews
                </h2>

                <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
                    <div className="rounded-xl border border-slate-100 bg-[#F5F7FC]/60 p-6">
                        <p className="text-4xl font-bold text-neutral-900">
                            {summary.average.toFixed(1)}
                        </p>
                        <StarRating value={Math.round(summary.average)} readonly />
                        <p className="mt-2 text-sm text-slate-500">
                            {summary.total} review{summary.total === 1 ? '' : 's'}
                        </p>

                        <div className="mt-6 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = summary.breakdown[star] ?? 0;
                                const percent =
                                    summary.total > 0 ? (count / summary.total) * 100 : 0;

                                return (
                                    <div key={star} className="flex items-center gap-3 text-xs">
                                        <span className="w-8 font-semibold text-slate-600">{star}</span>
                                        <Star className="h-3 w-3 fill-[#F5D020] text-[#F5D020]" />
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-neutral-900 transition-all"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <span className="w-6 text-right text-slate-500">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {reviews.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                No reviews yet. Be the first to share your experience.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <article
                                        key={review.id}
                                        className="border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-neutral-900">{review.name}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">{review.date}</p>
                                            </div>
                                            <StarRating value={review.rating} readonly size="sm" />
                                        </div>
                                        {review.title && (
                                            <p className="mt-3 text-sm font-semibold text-neutral-800">
                                                {review.title}
                                            </p>
                                        )}
                                        <p className="mt-2 text-sm leading-7 text-slate-600">{review.comment}</p>
                                    </article>
                                ))}
                            </div>
                        )}

                        <div className="rounded-xl border border-slate-100 bg-white p-5 sm:p-6">
                            <h3 className="text-sm font-bold tracking-wide text-neutral-900 uppercase">
                                {userReview ? 'Update Your Review' : 'Write a Review'}
                            </h3>

                            {!auth?.user ? (
                                <p className="mt-4 text-sm text-slate-600">
                                    <Link href={loginUrl} className="font-semibold text-[#313C8D] underline-offset-2 hover:underline">
                                        Sign in
                                    </Link>{' '}
                                    to rate and review this product.
                                </p>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    <div>
                                        <p className="mb-2 text-sm font-semibold text-neutral-900">Your rating</p>
                                        <StarRating value={rating} onChange={setRating} />
                                        <InputError message={errors?.rating} className="mt-1" />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="review-title"
                                            className="mb-2 block text-sm font-semibold text-neutral-900"
                                        >
                                            Title <span className="font-normal text-slate-400">(optional)</span>
                                        </label>
                                        <input
                                            id="review-title"
                                            type="text"
                                            value={title}
                                            onChange={(event) => setTitle(event.target.value)}
                                            placeholder="Summarize your experience"
                                            className="h-10 w-full border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-900"
                                        />
                                        <InputError message={errors?.title} className="mt-1" />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="review-body"
                                            className="mb-2 block text-sm font-semibold text-neutral-900"
                                        >
                                            Review
                                        </label>
                                        <textarea
                                            id="review-body"
                                            rows={4}
                                            value={body}
                                            onChange={(event) => setBody(event.target.value)}
                                            placeholder="Share fit, quality, and what you liked or disliked"
                                            className="w-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-900"
                                        />
                                        <InputError message={errors?.body} className="mt-1" />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitting || rating === 0}
                                        className="inline-flex h-10 items-center justify-center bg-neutral-900 px-6 text-xs font-bold tracking-wide text-white uppercase transition hover:bg-[#313C8D] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submitting
                                            ? 'Submitting...'
                                            : userReview
                                              ? 'Update Review'
                                              : 'Submit Review'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
