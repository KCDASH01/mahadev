<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeocodeService
{
    /**
     * @return array{
     *     address_line_1: string,
     *     address_line_2: string,
     *     city: string,
     *     state: string,
     *     country: string,
     *     pincode: string,
     *     pincode_approximate: bool
     * }
     */
    public function reverse(float $latitude, float $longitude): array
    {
        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'User-Agent' => (string) config('app.name', 'Mahadev').'/1.0 (address lookup)',
        ])
            ->timeout(10)
            ->get('https://nominatim.openstreetmap.org/reverse', [
                'format' => 'jsonv2',
                'lat' => $latitude,
                'lon' => $longitude,
                'zoom' => 18,
                'addressdetails' => 1,
                'countrycodes' => 'in',
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Unable to detect address from map location.');
        }

        /** @var array<string, mixed> $data */
        $data = $response->json() ?? [];
        $address = is_array($data['address'] ?? null) ? $data['address'] : [];

        $lineOne = collect([
            $address['house_number'] ?? null,
            $address['road'] ?? null,
            $address['neighbourhood'] ?? null,
            $address['suburb'] ?? null,
            $address['quarter'] ?? null,
        ])->filter()->implode(', ');

        $lineTwo = collect([
            $address['hamlet'] ?? null,
            $address['village'] ?? null,
            $address['county'] ?? null,
        ])->filter()->implode(', ');

        $city = collect([
            $address['city'] ?? null,
            $address['town'] ?? null,
            $address['state_district'] ?? null,
            $address['village'] ?? null,
            $address['suburb'] ?? null,
            $address['county'] ?? null,
        ])->filter()->first();

        $pincode = preg_replace('/\D/', '', (string) ($address['postcode'] ?? ''));
        $pincode = is_string($pincode) ? $pincode : '';

        $displayName = is_string($data['display_name'] ?? null) ? $data['display_name'] : '';

        return [
            'address_line_1' => $lineOne,
            'address_line_2' => $lineTwo,
            'city' => is_string($city) ? $city : '',
            'state' => is_string($address['state'] ?? null) ? $address['state'] : '',
            'country' => is_string($address['country'] ?? null) ? $address['country'] : 'India',
            'pincode' => strlen($pincode) === 6 ? $pincode : '',
            'pincode_approximate' => true,
            'display_name' => $displayName,
            'detected_area' => $displayName !== '' ? $displayName : $this->buildDetectedAreaLabel($address),
        ];
    }

    /**
     * @return array{
     *     city: string,
     *     state: string,
     *     country: string,
     *     area: string,
     *     latitude: ?float,
     *     longitude: ?float,
     *     map_label: string
     * }
     */
    public function lookupPincode(string $pincode): array
    {
        $normalized = preg_replace('/\D/', '', $pincode);
        $normalized = is_string($normalized) ? $normalized : '';

        if (strlen($normalized) !== 6) {
            throw new RuntimeException('Please enter a valid 6-digit pincode.');
        }

        $response = Http::retry(3, 500)->timeout(15)->get("https://api.postalpincode.in/pincode/{$normalized}");

        if ($response->failed()) {
            $coordinates = $this->coordinatesForPincode($normalized, '', '');

            return [
                'city' => '',
                'state' => '',
                'country' => 'India',
                'area' => '',
                'latitude' => $coordinates['latitude'],
                'longitude' => $coordinates['longitude'],
                'map_label' => $coordinates['map_label'],
                'verified' => false,
            ];
        }

        /** @var array<int, array<string, mixed>> $payload */
        $payload = $response->json() ?? [];

        $entry = $payload[0] ?? null;
        $status = is_array($entry) ? ($entry['Status'] ?? null) : null;

        if ($status !== 'Success') {
            throw new RuntimeException('Pincode not found. Please check and try again.');
        }

        $postOffices = is_array($entry['PostOffice'] ?? null) ? $entry['PostOffice'] : [];
        $office = $postOffices[0] ?? null;

        if (! is_array($office)) {
            throw new RuntimeException('Pincode not found. Please check and try again.');
        }

        $coordinates = $this->coordinatesForPincode($normalized, (string) ($office['District'] ?? ''), (string) ($office['State'] ?? ''));

        return [
            'city' => (string) ($office['District'] ?? $office['Block'] ?? $office['Name'] ?? ''),
            'state' => (string) ($office['State'] ?? ''),
            'country' => (string) ($office['Country'] ?? 'India'),
            'area' => (string) ($office['Name'] ?? ''),
            'latitude' => $coordinates['latitude'] ?? null,
            'longitude' => $coordinates['longitude'] ?? null,
            'map_label' => $coordinates['map_label'] ?? '',
            'verified' => true,
        ];
    }

    /**
     * @param  array<string, mixed>  $address
     */
    private function buildDetectedAreaLabel(array $address): string
    {
        return collect([
            $address['suburb'] ?? null,
            $address['village'] ?? null,
            $address['county'] ?? null,
            $address['state_district'] ?? null,
            $address['state'] ?? null,
            $address['country'] ?? null,
        ])->filter()->implode(', ');
    }

    /**
     * @return array{latitude: ?float, longitude: ?float, map_label: string}
     */
    private function coordinatesForPincode(string $pincode, string $district, string $state): array
    {
        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'User-Agent' => (string) config('app.name', 'Mahadev').'/1.0 (address lookup)',
        ])
            ->timeout(10)
            ->get('https://nominatim.openstreetmap.org/search', [
                'postalcode' => $pincode,
                'country' => 'India',
                'state' => $state,
                'format' => 'jsonv2',
                'limit' => 1,
            ]);

        if ($response->failed()) {
            return ['latitude' => null, 'longitude' => null, 'map_label' => ''];
        }

        /** @var array<int, array<string, mixed>> $results */
        $results = $response->json() ?? [];
        $match = $results[0] ?? null;

        if (! is_array($match)) {
            return ['latitude' => null, 'longitude' => null, 'map_label' => ''];
        }

        $label = is_string($match['display_name'] ?? null)
            ? $match['display_name']
            : collect([$district, $state, $pincode, 'India'])->filter()->implode(', ');

        return [
            'latitude' => isset($match['lat']) ? (float) $match['lat'] : null,
            'longitude' => isset($match['lon']) ? (float) $match['lon'] : null,
            'map_label' => $label,
        ];
    }
}
