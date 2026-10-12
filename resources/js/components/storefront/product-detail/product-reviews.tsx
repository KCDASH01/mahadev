import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import type { ProductReview, RatingSummary } from '@/types/product';

type ReviewForm = {
    name: string;
    email: string;
    rating: number;
    comment: string;
};

export default function ProductReviews({
    reviews,
    ratingSummary,
}: {
    reviews: ProductReview[];
    ratingSummary: RatingSummary;
}) {
    const [form, setForm] = useState<ReviewForm>({
        name: '',
        email: '',
        rating: 0,
        comment: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof ReviewForm, string>>>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = () => {
        const nextErrors: Partial<Record<keyof ReviewForm, string>> = {};
        if (!form.rating) nextErrors.rating = 'Please select a rating.';
        if (!form.comment.trim()) nextErrors.comment = 'Comment is required.';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!validate()) return;
        setSubmitted(true);
    };

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <p className="text-4xl font-bold text-slate-900">
                        {ratingSummary.average.toFixed(1)}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                                key={index}
                                className={`size-5 ${
                                    index < Math.round(ratingSummary.average)
                                        ? 'fill-amber-400'
                                        : 'text-slate-200'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                        Based on {ratingSummary.total} reviews
                    </p>
                </div>

                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingSummary.breakdown[star] ?? 0;
                        const percent =
                            ratingSummary.total > 0
                                ? (count / ratingSummary.total) * 100
                                : 0;

                        return (
                            <div key={star} className="flex items-center gap-3 text-sm">
                                <span className="w-12 text-slate-600">{star} Star</span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-[#2563EB]"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-slate-500">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <article
                        key={review.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-slate-900">{review.name}</p>
                            <p className="text-xs text-slate-500">{review.date}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={`size-4 ${
                                        index < review.rating
                                            ? 'fill-amber-400'
                                            : 'text-slate-200'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            {review.comment}
                        </p>
                    </article>
                ))}
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
            >
                <h3 className="text-lg font-semibold text-slate-900">Add a Review</h3>

                {submitted ? (
                    <p className="mt-4 text-sm text-[#10B981]">
                        Thank you! Your review has been submitted for moderation.
                    </p>
                ) : (
                    <div className="mt-4 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            name: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            email: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Rating
                            </label>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, index) => {
                                    const value = index + 1;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setForm((current) => ({
                                                    ...current,
                                                    rating: value,
                                                }))
                                            }
                                            className="p-1"
                                        >
                                            <Star
                                                className={`size-6 ${
                                                    value <= form.rating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-slate-300'
                                                }`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.rating && (
                                <p className="mt-1 text-xs text-[#EF4444]">{errors.rating}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Comment
                            </label>
                            <textarea
                                rows={4}
                                value={form.comment}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        comment: event.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                            />
                            {errors.comment && (
                                <p className="mt-1 text-xs text-[#EF4444]">{errors.comment}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Submit Review
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
