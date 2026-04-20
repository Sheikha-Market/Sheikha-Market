const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dataEncryptionKey = process.env.DATA_ENCRYPTION_KEY || '';

module.exports = {
    apps: [
        /* ─── الخادم الرئيسي ─────────────────────────────── */
        /*  المنفذ 8080: الخادم الأساسي (MAIN Cell — الشبكة العصبية)          */
        /*  المنفذ 8081: بوابة الأسواق الجامع (MARKETPLACE Cell)               */
        /*  server.js::_startMarketplaceGateway() يُطلق بوابة 8081 تلقائياً   */
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

        /* ─── Sheikha Copilot Server — خادم MCP الخلفي ── */
        /* يعمل دائماً في الخلفية كجسر بين GitHub Copilot  */
        /* والسيرفرات عبر بروتوكول MCP على المنفذ 3091     */
        {
            name: 'sheikha-copilot',
            cwd: __dirname,
            script: './scripts/sheikha-copilot-server.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '128M',
            restart_delay: 3000,
            env: {
                NODE_ENV:             'production',
                COPILOT_SERVER_PORT:  3091,
                COPILOT_SERVER_HOST:  '0.0.0.0',
                SHEIKHA_SERVER_URL:   'http://127.0.0.1:8080',
            },
            error_file: './logs/copilot-server-error.log',
            out_file:   './logs/copilot-server-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            max_restarts: 10,
            min_uptime: '5s',
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

        /* ─── Sheikha Ollama Copilot — خادم الذكاء المحلي ─ */
        /* يعمل دائماً في الخلفية كجسر بين Ollama والمنظومة */
        /* Ollama → خادم محلي على المنفذ 3092              */
        {
            name: 'sheikha-ollama-copilot',
            cwd: __dirname,
            script: './scripts/sheikha-ollama-copilot.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '256M',
            restart_delay: 5000,
            env: {
                NODE_ENV:             'production',
                OLLAMA_COPILOT_PORT:  3092,
                OLLAMA_COPILOT_HOST:  '0.0.0.0',
                OLLAMA_HOST:          process.env.OLLAMA_HOST          || 'http://127.0.0.1:11434',
                OLLAMA_BEST_MODEL:    process.env.OLLAMA_BEST_MODEL    || '',
                SHEIKHA_SERVER_URL:   'http://127.0.0.1:8080',
            },
            error_file: './logs/ollama-copilot-error.log',
            out_file:   './logs/ollama-copilot-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            max_restarts: 10,
            min_uptime: '5s',
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
