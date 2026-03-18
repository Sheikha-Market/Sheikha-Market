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
        }
    ]
};
