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
                META_PIXEL_ID:        process.env.META_PIXEL_ID        || '',
                META_ACCESS_TOKEN:    process.env.META_ACCESS_TOKEN     || '',
                META_WHATSAPP_TOKEN:  process.env.META_WHATSAPP_TOKEN   || '',
                META_WA_PHONE_ID:     process.env.META_WA_PHONE_ID      || '',
                META_WABA_ID:         process.env.META_WABA_ID          || '',
                META_APP_ID:          process.env.META_APP_ID           || '',
                META_GRAPH_VERSION:   process.env.META_GRAPH_VERSION    || 'v21.0',
                META_WA_VERIFY_TOKEN: process.env.META_WA_VERIFY_TOKEN  || 'sheikha_verify',
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
