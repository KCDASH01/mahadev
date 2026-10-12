<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesMediaUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePromoStripRequest;
use App\Models\PromoStrip;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PromoStripController extends Controller
{
    use HandlesMediaUpload;

    public function edit(): Response
    {
        return Inertia::render('admin/promo-strip/edit', [
            'promoStrip' => PromoStrip::instance(),
        ]);
    }

    public function update(UpdatePromoStripRequest $request): RedirectResponse
    {
        $strip = PromoStrip::instance();
        $data = $request->validated();

        if ($request->file('image_file')) {
            $data['image'] = $this->resolveMediaField(
                $request->file('image_file'),
                null,
                $strip->image,
                'promo-strip',
            );
        }

        if ($request->file('mobile_image_file')) {
            $data['mobile_image'] = $this->resolveMediaField(
                $request->file('mobile_image_file'),
                null,
                $strip->mobile_image,
                'promo-strip',
            );
        }

        unset($data['image_file'], $data['mobile_image_file']);

        $strip->update($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Promo strip updated successfully.'),
        ]);

        return to_route('admin.promo-strip.edit');
    }
}
