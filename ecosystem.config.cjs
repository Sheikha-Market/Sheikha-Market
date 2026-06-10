const fs = require('fs');

function loadEnvFile(path) {
  const env = {};
  if (!fs.existsSync(path)) return env;

  for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const i = t.indexOf('=');
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }

  return env;
}

const runtimeEnv = loadEnvFile('/etc/sheikha/runtime.env');

module.exports = {
  apps: [{
    name: 'sheikha-main-portal',
    script: '/opt/sheikha/current/server.js',
    cwd: '/opt/sheikha/current',
    interpreter: 'node',
    node_args: '--max-old-space-size=4096',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      ...runtimeEnv
    }
  }]
};
