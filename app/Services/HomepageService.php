<?php

namespace App\Services;

use App\Models\Banner;
use App\Models\Blog;
use App\Models\Brand;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\HomepagePopup;
use App\Models\LookbookSection;
use App\Models\Product;
use App\Models\PromoStrip;
use App\Models\SocialStory;
use App\Models\Testimonial;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class HomepageService
{
    public function __construct(
        private StorefrontProductService $storefrontProducts,
        private ExploreCollectionService $exploreCollectionService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function data(): array
    {
        return [
            'heroSlides' => $this->heroSlides(),
            'promoStrip' => $this->promoStrip(),
            'homepagePopup' => $this->homepagePopup(),
            'exploreCollections' => $this->exploreCollectionService->collections(),
            'navCategories' => $this->navCategories(),
            'shopCategories' => $this->shopCategories(),
            'featuredProducts' => $this->storefrontProducts->collection(
                $this->storefrontProducts->featured(8),
            ),
            'newArrivals' => $this->newArrivals(),
            'bestSellers' => $this->bestSellers(),
            'trendingProducts' => $this->storefrontProducts->collection(
                $this->storefrontProducts->trending(4),
            ),
            'newArrivalProducts' => $this->storefrontProducts->collection(
                $this->storefrontProducts->newArrivals(),
            ),
            'lookbookSection' => $this->lookbookSection(),
            'socialStories' => $this->socialStories(),
            'testimonials' => $this->testimonials(),
            'brands' => $this->topBrands(),
            'blogPosts' => $this->blogPosts(),
            'whyChooseUs' => $this->whyChooseUs(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function heroSlides(): array
    {
        try {
            return Banner::query()
                ->where('placement', 'hero')
                ->where('status', 'active')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get([
                    'id',
                    'accent_line',
                    'main_line',
                    'tagline',
                    'promo_text',
                    'image',
                    'video',
                    'mobile_image',
                    'mobile_video',
                    'media_type',
                    'image_position',
                    'link',
                    'cta_label',
                ])
                ->filter(function (Banner $banner): bool {
                    return $banner->isVideo() || filled($banner->image);
                })
                ->map(fn (Banner $banner) => [
                    'id' => $banner->id,
                    'accentLine' => $banner->accent_line ?? '',
                    'mainLine' => $banner->main_line ?? '',
                    'tagline' => $banner->tagline ?? '',
                    'promoText' => $banner->promo_text ?? '',
                    'mediaType' => $banner->isVideo() ? Banner::MEDIA_TYPE_VIDEO : Banner::MEDIA_TYPE_IMAGE,
                    'image' => $banner->image ?: null,
                    'video' => $banner->isVideo() ? $banner->video : null,
                    'mobileImage' => $banner->mobile_image ?: null,
                    'mobileVideo' => $banner->mobile_video ?: null,
                    'imagePosition' => $banner->image_position ?? 'center top',
                    'cta' => [
                        'label' => $banner->cta_label ?: '',
                        'href' => $banner->link ?: '/',
                    ],
                ])
                ->values()
                ->all();
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    private function promoStrip(): ?array
    {
        $strip = PromoStrip::instance();

        if (! $strip->is_visible || blank($strip->image)) {
            return null;
        }

        return [
            'image' => $strip->image,
            'mobileImage' => $strip->mobile_image ?: null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function homepagePopup(): ?array
    {
        try {
            $popup = HomepagePopup::instance();
        } catch (\Throwable) {
            return null;
        }

        if (! $popup->is_visible || blank($popup->image)) {
            return null;
        }

        return [
            'image' => $popup->image,
            'mobileImage' => $popup->mobile_image ?: null,
            'link' => filled($popup->link) ? $popup->link : null,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function socialStories(): array
    {
        return SocialStory::query()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(function (SocialStory $story): array {
                $overlay = null;

                if ($story->overlay_title || $story->overlay_discount) {
                    $overlay = array_filter([
                        'eyebrow' => $story->overlay_eyebrow,
                        'title' => $story->overlay_title ?? '',
                        'discount' => $story->overlay_discount ?? '',
                        'note' => $story->overlay_note,
                        'hashtag' => $story->overlay_hashtag,
                    ], fn ($value) => filled($value));
                }

                return [
                    'id' => $story->id,
                    'type' => $story->type,
                    'image' => $story->image,
                    'videoUrl' => $story->video_url,
                    'linkUrl' => $story->link_url,
                    'overlay' => $overlay ?: null,
                    'showThumbnailPromo' => (bool) $story->show_thumbnail_promo,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function testimonials(): array
    {
        return Testimonial::query()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Testimonial $testimonial) => [
                'id' => $testimonial->id,
                'name' => $testimonial->name,
                'headline' => $testimonial->headline,
                'text' => $testimonial->body,
                'rating' => (float) $testimonial->rating,
                'sceneImage' => $testimonial->scene_image,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function lookbookSection(): ?array
    {
        $section = LookbookSection::instance();

        if (! $section->is_visible) {
            return null;
        }

        return [
            'eyebrow' => $section->eyebrow,
            'title' => $section->title,
            'subtitle' => $section->subtitle ?? '',
            'cta' => [
                'label' => $section->cta_label,
                'href' => $section->cta_href,
            ],
            'posterImage' => $section->poster_image,
            'videoUrl' => $section->video_url,
        ];
    }

    /**
     * @return Collection<int, Category>
     */
    private function navCategories(): Collection
    {
        return Category::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->limit(8)
            ->get(['id', 'name', 'slug']);
    }

    /**
     * @return Collection<int, Category>
     */
    private function shopCategories(): Collection
    {
        return Category::query()
            ->where('status', 'active')
            ->withCount(['products' => fn ($query) => $query->where('status', 'active')])
            ->orderByDesc('products_count')
            ->orderBy('name')
            ->limit(12)
            ->get(['id', 'name', 'slug', 'image']);
    }

    /**
     * @return Collection<int, Product>
     */
    private function featuredProducts(): Collection
    {
        return $this->productQuery()
            ->where('is_featured', true)
            ->latest()
            ->limit(10)
            ->get();
    }

    /**
     * @return Collection<int, Product>
     */
    private function newArrivals(): Collection
    {
        return $this->productQuery()
            ->latest()
            ->limit(10)
            ->get();
    }

    /**
     * @return Collection<int, Product>
     */
    private function bestSellers(): Collection
    {
        $rankedProductIds = OrderItem::query()
            ->select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereNotNull('product_id')
            ->whereHas('order', fn ($query) => $query->where('order_status', 'delivered'))
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->pluck('product_id');

        if ($rankedProductIds->isEmpty()) {
            return $this->featuredProducts();
        }

        $products = $this->productQuery()
            ->whereIn('id', $rankedProductIds)
            ->get()
            ->sortBy(fn (Product $product) => $rankedProductIds->search($product->id))
            ->values();

        return $products;
    }

    /**
     * @return Collection<int, Brand>
     */
    private function topBrands(): Collection
    {
        return Brand::query()
            ->where('status', 'active')
            ->withCount(['products' => fn ($query) => $query->where('status', 'active')])
            ->orderByDesc('products_count')
            ->orderBy('name')
            ->limit(5)
            ->get(['id', 'name', 'slug', 'logo', 'featured_image', 'tagline']);
    }

    /**
     * @return Collection<int, Blog>
     */
    private function blogPosts(): Collection
    {
        return Blog::query()
            ->where('status', 'active')
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'content', 'category', 'image', 'published_at']);
    }

    /**
     * @return array<int, array{title: string, description: string}>
     */
    private function whyChooseUs(): array
    {
        $general = app(SettingsService::class)->general();

        return [
            [
                'title' => '100% Genuine Products',
                'description' => 'Authentic fashion styles sourced from trusted brands and verified suppliers.',
            ],
            [
                'title' => 'Secure Payments',
                'description' => 'Safe checkout with trusted payment options and encrypted transactions.',
            ],
            [
                'title' => 'Fast Delivery',
                'description' => 'Quick dispatch and reliable shipping across India.',
            ],
            [
                'title' => 'Customer Support',
                'description' => $general?->support_phone
                    ? "Dedicated support at {$general->support_phone}."
                    : 'Friendly support team ready to help with your orders.',
            ],
        ];
    }

    private function productQuery()
    {
        return Product::query()
            ->where('status', 'active')
            ->with(['category:id,name,slug', 'brand:id,name,slug']);
    }
}
