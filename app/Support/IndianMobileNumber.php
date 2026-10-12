<?php

namespace App\Support;

final class IndianMobileNumber
{
    public static function normalize(mixed $input): ?string
    {
        if (! is_string($input) && ! is_numeric($input)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $input) ?? '';

        if (str_starts_with($digits, '91') && strlen($digits) === 12) {
            $digits = substr($digits, 2);
        }

        if (str_starts_with($digits, '0') && strlen($digits) === 11) {
            $digits = substr($digits, 1);
        }

        if (! preg_match('/^[6-9]\d{9}$/', $digits)) {
            return null;
        }

        return $digits;
    }

    /**
     * @return list<string>
     */
    public static function storageVariants(string $digits): array
    {
        return array_values(array_unique([
            $digits,
            '91'.$digits,
            '+91'.$digits,
            '+91 '.$digits,
            '+91 '.substr($digits, 0, 5).' '.substr($digits, 5),
            '0'.$digits,
        ]));
    }

    public static function mask(string $digits): string
    {
        return '+91 XXXXX '.substr($digits, -4);
    }

    public static function toMsisdn(string $digits): string
    {
        return '91'.$digits;
    }
}
