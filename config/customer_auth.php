<?php

return [
    'otp_ttl' => (int) env('CUSTOMER_OTP_TTL', 300),
    'resend_cooldown' => (int) env('CUSTOMER_OTP_RESEND_COOLDOWN', 60),
    'max_verify_attempts' => (int) env('CUSTOMER_OTP_MAX_ATTEMPTS', 5),
    'max_resends' => (int) env('CUSTOMER_OTP_MAX_RESENDS', 5),
    'send_per_phone_per_hour' => (int) env('CUSTOMER_OTP_SEND_PER_PHONE', 5),
    'send_per_ip_per_hour' => (int) env('CUSTOMER_OTP_SEND_PER_IP', 10),
];
