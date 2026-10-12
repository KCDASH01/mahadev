<?php

namespace App\Services;

use App\Models\Blog;
use Illuminate\Support\Collection;

class BlogService
{
    /**
     * @return array<string, mixed>
     */
    public function indexData(): array
    {
        return [
            'posts' => $this->activePosts(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function showData(string $slug): ?array
    {
        $post = Blog::query()
            ->where('slug', $slug)
            ->where('status', 'active')
            ->first([
                'id',
                'title',
                'slug',
                'excerpt',
                'content',
                'category',
                'image',
                'published_at',
            ]);

        if (! $post) {
            return null;
        }

        return [
            'post' => $post,
            'relatedPosts' => Blog::query()
                ->where('status', 'active')
                ->where('id', '!=', $post->id)
                ->orderByDesc('published_at')
                ->orderByDesc('created_at')
                ->limit(3)
                ->get(['id', 'title', 'slug', 'excerpt', 'category', 'image', 'published_at']),
        ];
    }

    /**
     * @return Collection<int, Blog>
     */
    private function activePosts(): Collection
    {
        return Blog::query()
            ->where('status', 'active')
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->get([
                'id',
                'title',
                'slug',
                'excerpt',
                'content',
                'category',
                'image',
                'published_at',
            ]);
    }
}
