<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;

class CustomerUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Rahul Sharma',
                'email' => 'rahul@gmail.com',
                'phone' => '+91 9876500001',
                'city' => 'Bhubaneswar',
            ],
            [
                'name' => 'Priya Patnaik',
                'email' => 'priya@gmail.com',
                'phone' => '+91 9876500002',
                'city' => 'Cuttack',
            ],
            [
                'name' => 'Amit Das',
                'email' => 'amit@gmail.com',
                'phone' => '+91 9876500003',
                'city' => 'Puri',
            ],
            [
                'name' => 'Sneha Mohanty',
                'email' => 'sneha@gmail.com',
                'phone' => '+91 9876500004',
                'city' => 'Bhubaneswar',
            ],
            [
                'name' => 'Vikram Reddy',
                'email' => 'vikram@gmail.com',
                'phone' => '+91 9876500005',
                'city' => 'Berhampur',
            ],
        ];

        foreach ($customers as $customer) {
            $user = User::updateOrCreate(
                ['email' => $customer['email']],
                [
                    'name' => $customer['name'],
                    'phone' => $customer['phone'],
                    'password' => 'password',
                    'role' => 'customer',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ],
            );

            UserAddress::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'is_default' => true,
                ],
                [
                    'full_name' => $customer['name'],
                    'phone' => $customer['phone'],
                    'address_line_1' => 'Plot 12, Medical Colony',
                    'address_line_2' => 'Near City Hospital',
                    'landmark' => 'Opposite Apollo Pharmacy',
                    'city' => $customer['city'],
                    'state' => 'Odisha',
                    'country' => 'India',
                    'pincode' => '751001',
                    'latitude' => 20.2961,
                    'longitude' => 85.8245,
                ],
            );
        }
    }
}
