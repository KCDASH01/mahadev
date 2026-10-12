<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Category;
use App\Models\Product;
use App\Support\StorefrontPath;
use DateTimeInterface;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $now = now();

        $urls = collect([
            $this->url($this->publicUrl('/'), $now, '1.0'),
            $this->url($this->publicUrl(StorefrontPath::collection('gents')), $now, '0.9'),
            $this->url($this->publicUrl(StorefrontPath::collection('ladies')), $now, '0.9'),
            $this->url($this->publicUrl(StorefrontPath::collection('furniture')), $now, '0.9'),
            $this->url($this->publicUrl('/trending'), $now, '0.8'),
            $this->url($this->publicUrl('/new-arrivals'), $now, '0.8'),
            $this->url($this->publicUrl('/blog'), $now, '0.7'),
            $this->url($this->publicUrl('/about'), $now, '0.6'),
            $this->url($this->publicUrl('/contact'), $now, '0.6'),
            $this->url($this->publicUrl('/help-center'), $now, '0.5'),
            $this->url($this->publicUrl('/returns-refund-policy'), $now, '0.4'),
            $this->url($this->publicUrl('/shipping-policy'), $now, '0.4'),
            $this->url($this->publicUrl('/privacy-policy'), $now, '0.3'),
            $this->url($this->publicUrl('/terms-and-conditions'), $now, '0.3'),
        ]);

        $categoryUrls = Category::query()
            ->whereNotNull('parent_id')
            ->where('status', 'active')
            ->with('parent:id,slug')
            ->orderBy('name')
            ->get(['name', 'parent_id'])
            ->map(function (Category $category) use ($now) {
                $parentSlug = $category->parent?->slug;

                if (! $parentSlug) {
                    return null;
                }

                return $this->url(
                    $this->publicUrl(StorefrontPath::collectionCategory($parentSlug, $category->name)),
                    $now,
                    '0.7',
                );
            })
            ->filter();

        $productUrls = Product::query()
            ->where('status', 'active')
            ->orderByDesc('updated_at')
            ->get(['slug', 'updated_at'])
            ->map(fn (Product $product) => $this->url(
                $this->publicUrl(StorefrontPath::product($product->slug)),
                $product->updated_at ?? $now,
                '0.8',
            ));

        $blogUrls = Blog::query()
            ->where('status', 'active')
            ->orderByDesc('published_at')
            ->orderByDesc('updated_at')
            ->get(['slug', 'published_at', 'updated_at'])
            ->map(fn (Blog $post) => $this->url(
                $this->publicUrl('/blog/'.$post->slug),
                $post->published_at ?? $post->updated_at ?? $now,
                '0.6',
            ));

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<?xml-stylesheet type="text/css" href="https://www.xml-sitemaps.com/css/sitemap.css"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'."\n"
            .$urls->concat($categoryUrls)->concat($productUrls)->concat($blogUrls)->implode('')
            .'</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    private function publicUrl(string $path): string
    {
        $base = rtrim((string) config('app.sitemap_url', 'https://www.bhulika.com'), '/');

        return $base.($path === '/' ? '/' : $path);
    }

    private function url(string $loc, DateTimeInterface $lastmod, string $priority): string
    {
        return '  <url>'."\n"
            .'       <loc>'.$this->escape($loc).'</loc>'."\n"
            .'       <lastmod>'.$lastmod->format(DATE_ATOM).'</lastmod>'."\n"
            .'       <priority>'.number_format((float) $priority, 4).'</priority>'."\n"
            .'  </url>'."\n";
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
