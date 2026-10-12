<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Services\BlogService;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    /**
     * Display all blog posts.
     */
    public function index(BlogService $blogService): Response
    {
        return Inertia::render('blog/index', $blogService->indexData());
    }

    public function show(string $slug, BlogService $blogService): Response
    {
        $data = $blogService->showData($slug);

        if ($data === null) {
            abort(404);
        }

        return Inertia::render('blog/show', $data);
    }
}
