const fs = require('fs');

const vpsAppPath = '/opt/sheikha/current';
const resolvedAppCwd = process.env.SHEIKHA_APP_CWD
  || (fs.existsSync(`${vpsAppPath}/server.js`) ? vpsAppPath : __dirname);

module.exports = {
  apps: [
    {
      name: 'sheikha-main-portal',
      script: 'server.js',
      // Prefer the canonical VPS path when available to avoid stale release paths.
      cwd: resolvedAppCwd,
      env_file: '.env.runtime',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'development',
        PORT: 8080
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    }
  ]
};
