<?php

namespace App\Http\Controllers;

use App\Services\HomepageService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the storefront homepage.
     */
    public function index(HomepageService $homepage): Response
    {
        return Inertia::render('welcome', $homepage->data());
    }
}
