<?php

return [
    /*
    |--------------------------------------------------------------------------
    | خدمات Google
    |--------------------------------------------------------------------------
    |
    | إعدادات جميع خدمات Google المتكاملة في المشروع
    |
    */

    'google' => [
        // Google OAuth
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect_uri' => env('GOOGLE_REDIRECT_URI', 'https://sheikha.top/auth/google/callback'),

        // Google Cloud Storage
        'cloud_project' => env('GOOGLE_CLOUD_PROJECT'),
        'cloud_storage_bucket' => env('GOOGLE_CLOUD_STORAGE_BUCKET'),
        'cloud_key_file' => env('GOOGLE_CLOUD_KEY_FILE', 'service-account.json'),

        // Firebase
        'firebase_database_uri' => env('FIREBASE_DATABASE_URI'),
        'firebase_service_account_file' => env('FIREBASE_SERVICE_ACCOUNT_FILE', 'firebase.json'),

        // Google Maps
        'maps_api_key' => env('GOOGLE_MAPS_API_KEY'),

        // Google Pay
        'pay_merchant_id' => env('GOOGLE_PAY_MERCHANT_ID'),
        'pay_merchant_name' => env('GOOGLE_PAY_MERCHANT_NAME', 'Sheikha Market'),
        'pay_public_key' => env('GOOGLE_PAY_PUBLIC_KEY'),
        'pay_environment' => env('GOOGLE_PAY_ENVIRONMENT', 'PRODUCTION'),

        // Google Analytics 4
        'analytics_measurement_id' => env('GA4_MEASUREMENT_ID'),
        'analytics_api_secret' => env('GA4_API_SECRET'),
        'analytics_property_id' => env('GA4_PROPERTY_ID'),
        'analytics_key_file' => env('GA4_KEY_FILE', 'analytics.json'),

        // Google Workspace
        'workspace_admin_email' => env('GOOGLE_WORKSPACE_ADMIN_EMAIL'),
        'workspace_api_key' => env('GOOGLE_WORKSPACE_API_KEY'),
    ],
];
