<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function about(): Response
    {
        return $this->render('about');
    }

    public function contact(): Response
    {
        return $this->render('contact');
    }

    public function helpCenter(): Response
    {
        return $this->render('help-center');
    }

    public function returnsRefundPolicy(): Response
    {
        return $this->render('returns-refund-policy');
    }

    public function shippingPolicy(): Response
    {
        return $this->render('shipping-policy');
    }

    public function trackOrder(): Response
    {
        return $this->render('track-order');
    }

    public function privacyPolicy(): Response
    {
        return $this->render('privacy-policy');
    }

    public function termsAndConditions(): Response
    {
        return $this->render('terms-and-conditions');
    }

    private function render(string $pageKey): Response
    {
        return Inertia::render('static-page', [
            'pageKey' => $pageKey,
        ]);
    }
}
