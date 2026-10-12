<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;

class ProductReviewService
{
    /**
     * @return array<int, array{id: int, name: string, rating: int, title: string|null, comment: string, date: string}>
     */
    public function approvedReviews(Product $product): array
    {
        return ProductReview::query()
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->with('user:id,name')
            ->latest()
            ->get()
            ->map(fn (ProductReview $review) => $this->formatReview($review))
            ->values()
            ->all();
    }

    /**
     * @return array{average: float, total: int, breakdown: array<int, int>}
     */
    public function ratingSummary(Product $product): array
    {
        $reviews = ProductReview::query()
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->get(['rating']);

        $breakdown = [
            5 => 0,
            4 => 0,
            3 => 0,
            2 => 0,
            1 => 0,
        ];

        foreach ($reviews as $review) {
            $breakdown[(int) $review->rating] = ($breakdown[(int) $review->rating] ?? 0) + 1;
        }

        $total = $reviews->count();

        if ($total > 0) {
            return [
                'average' => round((float) $reviews->avg('rating'), 1),
                'total' => $total,
                'breakdown' => $breakdown,
            ];
        }

        $displayTotal = (int) ($product->display_review_count ?? 0);
        $displayAverage = round((float) ($product->display_rating ?? 0), 1);

        if ($displayTotal > 0 && $displayAverage > 0) {
            $bucket = (int) max(1, min(5, round($displayAverage)));
            $breakdown[$bucket] = $displayTotal;
        }

        return [
            'average' => $displayAverage,
            'total' => $displayTotal,
            'breakdown' => $breakdown,
        ];
    }

    /**
     * @return array{id: int, name: string, rating: int, title: string|null, comment: string, date: string}|null
     */
    public function userReview(User $user, Product $product): ?array
    {
        $review = ProductReview::query()
            ->where('product_id', $product->id)
            ->where('user_id', $user->id)
            ->with('user:id,name')
            ->first();

        return $review ? $this->formatReview($review) : null;
    }

    public function store(
        User $user,
        Product $product,
        int $rating,
        string $body,
        ?string $title = null,
    ): ProductReview {
        $review = ProductReview::updateOrCreate(
            [
                'user_id' => $user->id,
                'product_id' => $product->id,
            ],
            [
                'rating' => $rating,
                'title' => filled($title) ? $title : null,
                'body' => $body,
                'status' => 'approved',
            ],
        );

        $this->syncProductRating($product);

        return $review->load('user:id,name');
    }

    public function syncProductRating(Product $product): void
    {
        $stats = ProductReview::query()
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->selectRaw('AVG(rating) as average_rating, COUNT(*) as total_reviews')
            ->first();

        $product->update([
            'avg_rating' => round((float) ($stats->average_rating ?? 0), 2),
            'review_count' => (int) ($stats->total_reviews ?? 0),
        ]);
    }

    /**
     * @return array{id: int, name: string, rating: int, title: string|null, comment: string, date: string}
     */
    private function formatReview(ProductReview $review): array
    {
        return [
            'id' => $review->id,
            'name' => $review->user?->name ?? 'Customer',
            'rating' => (int) $review->rating,
            'title' => $review->title,
            'comment' => $review->body,
            'date' => $review->created_at?->format('d M Y') ?? '',
        ];
    }
}
