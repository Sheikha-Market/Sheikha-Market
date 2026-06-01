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
        APP_ENV: 'development',
        PORT: 8082,
        SHEIKHA_RUNTIME_ROLE: 'api-runtime-companion'
      },
      env_local: {
        NODE_ENV: 'development',
        APP_ENV: 'local',
        HOST: '127.0.0.1',
        PORT: 8082,
        SHEIKHA_RUNTIME_ROLE: 'api-runtime-companion'
      },
      env_development: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
        PORT: 8082,
        SHEIKHA_RUNTIME_ROLE: 'api-runtime-companion'
      },
      env_staging: {
        NODE_ENV: 'production',
        APP_ENV: 'staging',
        PORT: 8082,
        SHEIKHA_RUNTIME_ROLE: 'api-runtime-companion'
      },
      env_production: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
        PORT: 8082,
        SHEIKHA_RUNTIME_ROLE: 'api-runtime-companion'
      }
    }
  ]
};
