<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Services\StorefrontCatalogService;
use App\Support\CategorySeo;
use App\Support\StorefrontPath;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function collection(StorefrontCatalogService $catalog, string $collection, ?string $category = null): Response|RedirectResponse
    {
        $slug = StorefrontPath::internalSlug($collection);

        abort_unless(in_array($slug, ['gents', 'ladies', 'furniture'], true), 404);

        if ($redirect = $this->canonicalCategoryRedirect($slug, $category)) {
            return $redirect;
        }

        return $this->renderCollection($catalog->genderCollection($slug, $category));
    }

    public function jewelleryCategory(StorefrontCatalogService $catalog, string $category): Response|RedirectResponse
    {
        if ($redirect = $this->canonicalCategoryRedirect('jewellery', $category)) {
            return $redirect;
        }

        return $this->collection($catalog, 'accessories', $category);
    }

    public function trending(StorefrontCatalogService $catalog, ?string $category = null): Response|RedirectResponse
    {
        if ($redirect = $this->canonicalCategoryRedirect('trending', $category)) {
            return $redirect;
        }

        return $this->renderCollection($catalog->trendingPage($category));
    }

    public function newArrivals(StorefrontCatalogService $catalog, ?string $category = null): Response|RedirectResponse
    {
        if ($redirect = $this->canonicalCategoryRedirect('new-arrivals', $category)) {
            return $redirect;
        }

        return $this->renderCollection($catalog->newArrivalsPage($category));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function renderCollection(array $data): Response
    {
        $slug = is_string($data['collection']['slug'] ?? null) ? $data['collection']['slug'] : '';
        $category = is_string($data['selectedCategory'] ?? null) ? $data['selectedCategory'] : 'All';
        $seo = CategorySeo::for($slug, $category);

        if ($seo !== null) {
            $data['seo'] = $seo;
        }

        return Inertia::render('collection', $data);
    }

    private function canonicalCategoryRedirect(string $collectionSlug, ?string $category): ?RedirectResponse
    {
        if (! filled($category)) {
            return null;
        }

        $canonical = StorefrontPath::categorySlug($category);

        if ($category === $canonical) {
            return null;
        }

        return redirect(StorefrontPath::collectionCategory($collectionSlug, $category), 301);
    }
}
