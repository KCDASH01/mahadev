<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class FashionTestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $img = fn (string $path) => "https://images.unsplash.com/{$path}?auto=format&fit=crop&w=900&q=85";

        $testimonials = [
            [
                'name' => 'Ananya Sharma',
                'headline' => 'Premium quality, every time!',
                'body' => 'The fabric quality feels premium and delivery to Odisha was quick. Great value for money on kurtis and everyday wear.',
                'rating' => 5,
                'scene_image' => $img('photo-1515886657613-9f3515b0c78f'),
                'sort_order' => 0,
            ],
            [
                'name' => 'Rohit Verma',
                'headline' => 'Perfect fit, great prices!',
                'body' => 'Perfect fit on shirts and kurtas. Mahadev has become my go-to for affordable fashion that still looks polished.',
                'rating' => 5,
                'scene_image' => $img('photo-1712130126754-009c33690ee3'),
                'sort_order' => 1,
            ],
            [
                'name' => 'Priya Mehta',
                'headline' => 'Office to outing ready!',
                'body' => 'Clean kurtis, helpful sizing, and pieces that work for office and outings alike. Checkout and delivery were smooth.',
                'rating' => 5,
                'scene_image' => $img('photo-1485230895905-ec40ba36b9bc'),
                'sort_order' => 2,
            ],
            [
                'name' => 'Karan Singh',
                'headline' => 'Looks expensive, costs less!',
                'body' => 'Fast shipping, secure checkout, and styles that look much more expensive than they are. Highly recommend for men\'s wear.',
                'rating' => 5,
                'scene_image' => $img('photo-1603252109303-2751441dd157'),
                'sort_order' => 3,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::query()->updateOrCreate(
                ['name' => $testimonial['name']],
                array_merge($testimonial, ['status' => 'active']),
            );
        }
    }
}
