const fs = require('fs');
const os = require('os');

const vpsAppPath = '/opt/sheikha/current';
const resolvedAppCwd = process.env.SHEIKHA_APP_CWD
  || (fs.existsSync(`${vpsAppPath}/server.js`) ? vpsAppPath : __dirname);
const cpuCores = Array.isArray(os.cpus()) ? os.cpus().length : 4;
const sheikhaCpuThreads = String(process.env.SHEIKHA_CORE_NUM_THREAD || Math.max(4, Math.min(20, cpuCores > 4 ? cpuCores - 2 : cpuCores)));
const sheikhaCpuBatch = String(process.env.SHEIKHA_CORE_NUM_BATCH || 512);

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
        PORT: 8082,
        SHEIKHA_RUNTIME_ROLE: 'api-runtime-companion',
        SHEIKHA_CORE_TIMEOUT_MS: process.env.SHEIKHA_CORE_TIMEOUT_MS || '90000',
        SHEIKHA_CORE_NUM_THREAD: sheikhaCpuThreads,
        SHEIKHA_CORE_NUM_BATCH: sheikhaCpuBatch,
        SHEIKHA_CORE_NUM_CTX: process.env.SHEIKHA_CORE_NUM_CTX || '2048',
        SHEIKHA_CORE_NUM_PREDICT: process.env.SHEIKHA_CORE_NUM_PREDICT || '256'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8082,
        SHEIKHA_RUNTIME_ROLE: 'api-runtime-companion',
        SHEIKHA_CORE_TIMEOUT_MS: process.env.SHEIKHA_CORE_TIMEOUT_MS || '90000',
        SHEIKHA_CORE_NUM_THREAD: sheikhaCpuThreads,
        SHEIKHA_CORE_NUM_BATCH: sheikhaCpuBatch,
        SHEIKHA_CORE_NUM_CTX: process.env.SHEIKHA_CORE_NUM_CTX || '2048',
        SHEIKHA_CORE_NUM_PREDICT: process.env.SHEIKHA_CORE_NUM_PREDICT || '256'
      }
    },
    {
      name: 'sheikha-ollama',
      script: process.env.OLLAMA_BIN || '/usr/local/bin/ollama',
      args: 'serve',
      interpreter: 'none',
      cwd: resolvedAppCwd,
      autorestart: true,
      watch: false,
      max_memory_restart: '12G',
      env: {
        OLLAMA_HOST: process.env.OLLAMA_BIND || '127.0.0.1:11434',
        OLLAMA_NUM_PARALLEL: process.env.OLLAMA_NUM_PARALLEL || '1',
        OLLAMA_MAX_LOADED_MODELS: process.env.OLLAMA_MAX_LOADED_MODELS || '1',
        OLLAMA_KEEP_ALIVE: process.env.OLLAMA_KEEP_ALIVE || '30m',
        OLLAMA_FLASH_ATTENTION: process.env.OLLAMA_FLASH_ATTENTION || '1',
        OLLAMA_SCHED_SPREAD: process.env.OLLAMA_SCHED_SPREAD || 'false'
      }
    }
  ]
};
