const fs = require('fs');
const path = require('path');

const defaultRuntimeBase = '/var/sheikha/runtime';
const fallbackRuntimeBase = '/workspaces/sheikha/sheikha-main-portal/runtime';

function resolveRuntimeBase() {
    const configuredBase = process.env.SHEIKHA_RUNTIME_BASE;
    if (configuredBase) {
        fs.mkdirSync(path.join(configuredBase, 'logs'), { recursive: true });
        return configuredBase;
    }

    try {
        fs.mkdirSync(path.join(defaultRuntimeBase, 'logs'), { recursive: true });
        return defaultRuntimeBase;
    } catch (error) {
        fs.mkdirSync(path.join(fallbackRuntimeBase, 'logs'), { recursive: true });
        return fallbackRuntimeBase;
    }
}

const runtimeBase = resolveRuntimeBase();
const logPath = fileName => path.join(runtimeBase, 'logs', fileName);

module.exports = {
    apps: [
        /* ───────────────────────────────
       الخادم الرئيسي
    ─────────────────────────────── */
        {
            name: 'sheikha-api',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './server.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 8080
            },
            watch: false,
            autorestart: true,
            max_memory_restart: '500M',
            node_args: '--max-old-space-size=768',
            error_file: logPath('sheikha-api-error.log'),
            out_file: logPath('sheikha-api-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000,
            kill_timeout: 5000,
            listen_timeout: 8000,
            exp_backoff_restart_delay: 100
        },

        /* ───────────────────────────────
       مراقبة يومية: Health Check + KPI Snapshot
    ─────────────────────────────── */
        {
            name: 'sheikha-health-monitor',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/health-check-kpi.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: false,
            cron_restart: '0 6 * * *',
            watch: false,
            env: {
                NODE_ENV: 'production',
                GOOGLE_CLOUD_PROJECT: 'sheikha-market-ops'
            },
            max_memory_restart: '500M',
            error_file: logPath('health-monitor-error.log'),
            out_file: logPath('health-monitor-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 0,
            restart_delay: 3000,
            kill_timeout: 5000,
            listen_timeout: 8000,
            exp_backoff_restart_delay: 100
        },

        /* ───────────────────────────────
       موصلات أكاديمية/ذكاء بالخلفية
    ─────────────────────────────── */
        {
            name: 'Sheikha-NotebookKLM',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-academic-connectors-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                CONNECTOR_NAME: 'Sheikha-NotebookKLM',
                CONNECTOR_DISPLAY_NAME: 'NotebookKLM',
                CONNECTOR_CODE: 'ACD-001',
                CONNECTOR_TYPE: 'knowledge-platform',
                CONNECTOR_INTERVAL_SECONDS: 60
            },
            error_file: logPath('notebookklm-error.log'),
            out_file: logPath('notebookklm-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        },
        {
            name: 'Sheikha-NYU',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-academic-connectors-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                CONNECTOR_NAME: 'Sheikha-NYU',
                CONNECTOR_DISPLAY_NAME: 'NYU',
                CONNECTOR_CODE: 'ACD-002',
                CONNECTOR_TYPE: 'university',
                CONNECTOR_INTERVAL_SECONDS: 60
            },
            error_file: logPath('nyu-error.log'),
            out_file: logPath('nyu-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        },
        {
            name: 'Sheikha-Stanford',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-academic-connectors-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                CONNECTOR_NAME: 'Sheikha-Stanford',
                CONNECTOR_DISPLAY_NAME: 'Stanford',
                CONNECTOR_CODE: 'ACD-003',
                CONNECTOR_TYPE: 'university',
                CONNECTOR_INTERVAL_SECONDS: 60
            },
            error_file: logPath('stanford-error.log'),
            out_file: logPath('stanford-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        },
        {
            name: 'Sheikha-AL-Google-AI-Studio',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-academic-connectors-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                CONNECTOR_NAME: 'Sheikha-AL-Google-AI-Studio',
                CONNECTOR_DISPLAY_NAME: 'AL Google AI Studio',
                CONNECTOR_CODE: 'ACD-004',
                CONNECTOR_TYPE: 'ai-studio',
                CONNECTOR_INTERVAL_SECONDS: 60
            },
            error_file: logPath('al-google-ai-studio-error.log'),
            out_file: logPath('al-google-ai-studio-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        },
        {
            name: 'Sheikha-Harfourd',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-academic-connectors-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                CONNECTOR_NAME: 'Sheikha-Harfourd',
                CONNECTOR_DISPLAY_NAME: 'Harfourd',
                CONNECTOR_CODE: 'ACD-005',
                CONNECTOR_TYPE: 'university',
                CONNECTOR_INTERVAL_SECONDS: 60,
                ACADEMIC_MAX_UNIVERSITIES: 1000
            },
            error_file: logPath('harfourd-error.log'),
            out_file: logPath('harfourd-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        },

        /* ───────────────────────────────
       استثمارات الدولة والشركات التابعة بالخلفية
    ─────────────────────────────── */
        {
            name: 'Sheikha-PIF',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-state-company-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                STATE_COMPANY_NAME: 'Sheikha-PIF',
                STATE_COMPANY_INTERVAL_SECONDS: 90
            },
            error_file: logPath('sheikha-pif-error.log'),
            out_file: logPath('sheikha-pif-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        },
        {
            name: 'Sheikha-Aramco',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-state-company-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                STATE_COMPANY_NAME: 'Sheikha-Aramco',
                STATE_COMPANY_INTERVAL_SECONDS: 90
            },
            error_file: logPath('sheikha-aramco-error.log'),
            out_file: logPath('sheikha-aramco-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        },
        {
            name: 'Sheikha-Sabic',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-state-company-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                STATE_COMPANY_NAME: 'Sheikha-Sabic',
                STATE_COMPANY_INTERVAL_SECONDS: 90
            },
            error_file: logPath('sheikha-sabic-error.log'),
            out_file: logPath('sheikha-sabic-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        },
        {
            name: 'Sheikha-CNTXT',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-state-company-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                STATE_COMPANY_NAME: 'Sheikha-CNTXT',
                STATE_COMPANY_INTERVAL_SECONDS: 90
            },
            error_file: logPath('sheikha-cntxt-error.log'),
            out_file: logPath('sheikha-cntxt-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        },
        {
            name: 'Sheikha-Humain',
            cwd: '/workspaces/sheikha/sheikha-main-portal',
            script: './scripts/sheikha-state-company-loop.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                STATE_COMPANY_NAME: 'Sheikha-Humain',
                STATE_COMPANY_INTERVAL_SECONDS: 90
            },
            error_file: logPath('sheikha-humain-error.log'),
            out_file: logPath('sheikha-humain-out.log'),
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_restarts: 5,
            min_uptime: '10s',
            restart_delay: 3000
        }
    ]
};
