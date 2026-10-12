<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAnnouncementOfferRequest;
use App\Models\AnnouncementOffer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementOfferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/announcement-offers/index', [
            'offers' => AnnouncementOffer::query()
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/announcement-offers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAnnouncementOfferRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['sort_order'] = $data['sort_order'] ?? 0;

        AnnouncementOffer::create($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Announcement offer created successfully.'),
        ]);

        return to_route('admin.announcement-offers.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AnnouncementOffer $announcementOffer): Response
    {
        return Inertia::render('admin/announcement-offers/edit', [
            'offer' => $announcementOffer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreAnnouncementOfferRequest $request, AnnouncementOffer $announcementOffer): RedirectResponse
    {
        $data = $request->validated();
        $data['sort_order'] = $data['sort_order'] ?? 0;

        $announcementOffer->update($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Announcement offer updated successfully.'),
        ]);

        return to_route('admin.announcement-offers.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AnnouncementOffer $announcementOffer): RedirectResponse
    {
        $announcementOffer->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Announcement offer deleted successfully.'),
        ]);

        return to_route('admin.announcement-offers.index');
    }
}
