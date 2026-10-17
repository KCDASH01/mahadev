<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'razorpay' => [
        'key' => env('RAZORPAY_KEY'),
        'secret' => env('RAZORPAY_SECRET'),
    ],

    'delhivery' => [
        'enabled' => env('DELHIVERY_ENABLED', true),
        'token' => env('DELHIVERY_API_TOKEN'),
        'base_url' => env('DELHIVERY_BASE_URL', 'https://track.delhivery.com'),
        'pickup_location' => env('DELHIVERY_PICKUP_LOCATION', ''),
        'seller_gst_tin' => env('DELHIVERY_SELLER_GST_TIN', ''),
        'hsn_code' => env('DELHIVERY_HSN_CODE', '6109'),
        'default_weight_kg' => env('DELHIVERY_DEFAULT_WEIGHT_KG', 0.5),
        'default_length_cm' => env('DELHIVERY_DEFAULT_LENGTH_CM', 25),
        'default_width_cm' => env('DELHIVERY_DEFAULT_WIDTH_CM', 20),
        'default_height_cm' => env('DELHIVERY_DEFAULT_HEIGHT_CM', 5),
        'timeout' => env('DELHIVERY_TIMEOUT', 30),
        'auto_create_on_order' => env('DELHIVERY_AUTO_CREATE_ON_ORDER', true),
    ],

    'meta' => [
        'pixel_id' => env('META_PIXEL_ID'),
    ],

    'google' => [
        'site_verification' => env('GOOGLE_SITE_VERIFICATION'),
        'gtm_id' => env('GOOGLE_GTM_ID'),
    ],

    'twofactor' => [
        'key' => env('TWOFACTOR_API_KEY'),
        'base_url' => env('TWOFACTOR_BASE_URL', 'https://2factor.in/API/V1'),
        // SMS only. AUTOGEN is the only valid 2Factor SMS OTP endpoint.
        'send_action' => env('TWOFACTOR_SEND_ACTION', 'AUTOGEN'),
        'template' => env('TWOFACTOR_OTP_TEMPLATE'),
        'timeout' => env('TWOFACTOR_TIMEOUT', 15),
    ],

];
