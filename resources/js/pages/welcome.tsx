import { Head } from '@inertiajs/react';
import { HomeAbout } from '@/components/home/home-about';
import { HomeCategories } from '@/components/home/home-categories';
import { HomeExploreCollections } from '@/components/home/home-explore-collections';
import { HomeFeatured } from '@/components/home/home-featured';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { HomeHero } from '@/components/home/home-hero';
import { HomeNewArrivals } from '@/components/home/home-new-arrivals';
import { HomeNewsletter } from '@/components/home/home-newsletter';
import { HomePromoPopup } from '@/components/home/home-promo-popup';
import { HomeSocialStories } from '@/components/home/home-social-stories';
import { HomeSubBanners } from '@/components/home/home-sub-banners';
import { HomeTestimonials } from '@/components/home/home-testimonials';
import { HomeTrending } from '@/components/home/home-trending';
import { HomeTrustFeatures } from '@/components/home/home-trust-features';
import { HomeVideoSection } from '@/components/home/home-video-section';
import type { FashionProduct } from '@/data/fashion-products';
import { heroSlides as fallbackHeroSlides, exploreCollections as fallbackExploreCollections } from '@/data/home-content';
import type { ExploreCollection, HeroSlide, HomepagePopupData, LookbookSectionData, PromoStripData, SocialStoryData, TestimonialData } from '@/types/storefront';

export default function Welcome({
    heroSlides = [],
    promoStrip = null,
    homepagePopup = null,
    exploreCollections = [],
    featuredProducts = [],
    trendingProducts = [],
    newArrivalProducts = [],
    lookbookSection = null,
    socialStories = [],
    testimonials = [],
}: {
    heroSlides?: HeroSlide[] | null;
    promoStrip?: PromoStripData | null;
    homepagePopup?: HomepagePopupData | null;
    exploreCollections?: ExploreCollection[];
    featuredProducts?: FashionProduct[];
    trendingProducts?: FashionProduct[];
    newArrivalProducts?: FashionProduct[];
    lookbookSection?: LookbookSectionData | null;
    socialStories?: SocialStoryData[];
    testimonials?: TestimonialData[];
}) {
    const slides = Array.isArray(heroSlides) && heroSlides.length > 0 ? heroSlides : fallbackHeroSlides;
    const hasHero = slides.length > 0;
    const featured = Array.isArray(featuredProducts) ? featuredProducts : [];

    return (
        <>
            <Head title="Mahadev Multipurpose Co-operative Society Ltd | Garments & Furniture">
                <meta
                    head-key="description"
                    name="description"
                    content="Shop garments for gents and ladies, plus dependable furniture for every room, from Mahadev Multipurpose Co-operative Society Ltd."
                />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content="Mahadev Multipurpose Co-operative Society Ltd | Garments & Furniture"
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content="Quality garments and furniture at co-operative value, with secure online ordering."
                />
            </Head>

            <div className="min-h-screen overflow-x-hidden bg-white font-helvetica text-[#09233D] antialiased">
                <HomeHeader overlayOnHero={hasHero} />
                <main
                    className={
                        hasHero
                            ? 'bg-white pt-[var(--home-announcement-offset)]'
                            : 'bg-white pt-home-header'
                    }
                >
                    <HomeHero slides={slides} />
                    <HomeExploreCollections collections={exploreCollections.length > 0 ? exploreCollections : fallbackExploreCollections} />
                    <HomeSubBanners promoStrip={promoStrip} />
                    <HomeCategories />
                    <HomeFeatured products={featured} />
                    <HomeTrending products={trendingProducts} />
                    <HomeVideoSection lookbookSection={lookbookSection} />
                    <HomeNewArrivals products={newArrivalProducts} />
                    <HomeSocialStories stories={socialStories} />
                    <HomeTestimonials testimonials={testimonials} />
                    <HomeAbout />
                    <HomeTrustFeatures />
                    <HomeNewsletter />
                </main>
                <HomeFooter />
                <HomePromoPopup popup={homepagePopup} />
            </div>
        </>
    );
}
