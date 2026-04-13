const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dataEncryptionKey = process.env.DATA_ENCRYPTION_KEY || '';

module.exports = {
    apps: [
        /* ─── الخادم الرئيسي ─────────────────────────────── */
        {
            name: 'sheikha-api',
            cwd: __dirname,
            script: './server.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 8080,
                DATA_ENCRYPTION_KEY: dataEncryptionKey
            },
            watch: false,
            max_memory_restart: '1G',
            error_file: './logs/sheikha-error.log',
            out_file: './logs/sheikha-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            max_restarts: 3,
            min_uptime: '10s',
            gracefulShutdown: true
        },

        /* ─── مراقبة يومية: Health Check + KPI Snapshot ── */
        {
            name: 'sheikha-health-monitor',
            cwd: __dirname,
            script: './scripts/health-check-kpi.js',
            instances: 1,
            autorestart: false, // لا يُعاد تشغيله تلقائياً
            cron_restart: '0 6 * * *', // كل يوم الساعة 06:00 (توقيت الخادم)
            watch: false,
            env: {
                NODE_ENV: 'production',
                GOOGLE_CLOUD_PROJECT: 'sheikha-market-ops'
            },
            error_file: './logs/health-monitor-error.log',
            out_file: './logs/health-monitor-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            max_restarts: 0
        },

        /* ─── شيخة Meta AI — خادم الخلفية ─────────────── */
        /* يعمل بالخلفية بشكل مستقل عن الخادم الرئيسي      */
        {
            name: 'sheikha-meta-background',
            cwd: __dirname,
            script: './scripts/sheikha-meta-background.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '256M',
            restart_delay: 5000,
            env: {
                NODE_ENV: 'production',
                META_BACKGROUND_PORT: 8085,
                META_PIXEL_ID:           process.env.META_PIXEL_ID           || '',
                META_ACCESS_TOKEN:       process.env.META_ACCESS_TOKEN        || '',
                META_CAPI_ACCESS_TOKEN:  process.env.META_CAPI_ACCESS_TOKEN   || '',
                META_WHATSAPP_TOKEN:     process.env.META_WHATSAPP_TOKEN      || '',
                META_WA_PHONE_ID:        process.env.META_WA_PHONE_ID         || '',
                META_WABA_ID:            process.env.META_WABA_ID             || '',
                META_APP_ID:             process.env.META_APP_ID              || '',
                META_AD_ACCOUNT_ID:      process.env.META_AD_ACCOUNT_ID       || '',
                META_CATALOG_ID:         process.env.META_CATALOG_ID          || '',
                META_CATALOG_TEST_ID:    process.env.META_CATALOG_TEST_ID     || '',
                META_GRAPH_VERSION:      process.env.META_GRAPH_VERSION       || 'v21.0',
                META_WA_VERIFY_TOKEN:    process.env.META_WA_VERIFY_TOKEN     || 'sheikha_verify',
                META_TEST_EVENT_CODE:    process.env.META_TEST_EVENT_CODE     || '',
                META_AUTOMATION_APPROVED: process.env.META_AUTOMATION_APPROVED || 'false',
                // بيكسلات الأسواق الخمسة
                META_PIXEL_ID_METALS:   process.env.META_PIXEL_ID_METALS   || '',
                META_PIXEL_ID_SCRAP:    process.env.META_PIXEL_ID_SCRAP    || '',
                META_PIXEL_ID_PRECIOUS: process.env.META_PIXEL_ID_PRECIOUS || '',
                META_PIXEL_ID_RARE:     process.env.META_PIXEL_ID_RARE     || '',
                META_PIXEL_ID_NOW:      process.env.META_PIXEL_ID_NOW      || '',
                META_ACCESS_TOKEN_METALS:   process.env.META_ACCESS_TOKEN_METALS   || '',
                META_ACCESS_TOKEN_SCRAP:    process.env.META_ACCESS_TOKEN_SCRAP    || '',
                META_ACCESS_TOKEN_PRECIOUS: process.env.META_ACCESS_TOKEN_PRECIOUS || '',
                META_ACCESS_TOKEN_RARE:     process.env.META_ACCESS_TOKEN_RARE     || '',
                META_ACCESS_TOKEN_NOW:      process.env.META_ACCESS_TOKEN_NOW      || '',
                // توكنات CAPI الإقليمية — Regional Geo-Routing Tokens
                META_CAPI_TOKEN_SA_GCC:   process.env.META_CAPI_TOKEN_SA_GCC   || '',
                META_CAPI_TOKEN_EUROPE:   process.env.META_CAPI_TOKEN_EUROPE   || '',
                META_CAPI_TOKEN_AMERICAS: process.env.META_CAPI_TOKEN_AMERICAS || '',
                META_CAPI_TOKEN_ASIA:     process.env.META_CAPI_TOKEN_ASIA     || '',
                // أرقام واتساب لكل سوق — Per-Market WhatsApp Phone IDs
                META_WA_PHONE_ID_METALS:   process.env.META_WA_PHONE_ID_METALS   || '',
                META_WA_PHONE_ID_SCRAP:    process.env.META_WA_PHONE_ID_SCRAP    || '',
                META_WA_PHONE_ID_PRECIOUS: process.env.META_WA_PHONE_ID_PRECIOUS || '',
                META_WA_PHONE_ID_RARE:     process.env.META_WA_PHONE_ID_RARE     || '',
                META_WA_PHONE_ID_NOW:      process.env.META_WA_PHONE_ID_NOW      || '',
                // حوكمة — Governance & Alerts
                META_ALERT_MIN_EMQ:          process.env.META_ALERT_MIN_EMQ          || '6.0',
                META_ALERT_MAX_DEDUP:        process.env.META_ALERT_MAX_DEDUP        || '0.30',
                META_ALERT_MIN_WA_DELIVERY:  process.env.META_ALERT_MIN_WA_DELIVERY  || '0.90',
                META_AUDIT_LOG_SIZE:         process.env.META_AUDIT_LOG_SIZE         || '500',
            },
            error_file: './logs/meta-background-error.log',
            out_file: './logs/meta-background-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            max_restarts: 10,
            min_uptime: '5s',
        }
    ]
};
