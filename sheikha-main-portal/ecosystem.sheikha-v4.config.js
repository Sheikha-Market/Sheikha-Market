// بسم الله الرحمن الرحيم
// المالك: سلمان أحمد سلمان الراجح
// منظومة شيخة — أول منظومة اقتصادية إسلامية رقمية للمعادن والسكراب
const path = require('path');

module.exports = {
    apps: [
        {
            name: 'sheikha-v4',
            script: path.join(__dirname, 'sheikha-v4.js'),
            cwd: __dirname,
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
            restart_delay: 2000,
            max_restarts: 10,
            min_uptime: '10s',
            env: {
                NODE_ENV: 'production',
                PORT: 8090,
                SHEIKHA_OWNER_USER: process.env.SHEIKHA_OWNER_USER || 'salman',
                SHEIKHA_OWNER_PASSWORD: process.env.SHEIKHA_OWNER_PASSWORD || '',
                SHEIKHA_JWT_SECRET: process.env.SHEIKHA_JWT_SECRET || ''
            },
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: path.join(__dirname, 'logs/sheikha-v4-error.log'),
            out_file: path.join(__dirname, 'logs/sheikha-v4-out.log'),
            merge_logs: true,
            kill_timeout: 5000,
            listen_timeout: 3000,
            node_args: '--max-old-space-size=256'
        }
    ]
};
