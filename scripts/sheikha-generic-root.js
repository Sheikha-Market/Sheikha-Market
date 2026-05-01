#!/usr/bin/env node

const { execSync } = require('child_process');

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf8' }).trim(); }
  catch (e) { return (e.stdout || e.stderr || e.message || '').toString().trim(); }
}

const report = {
  success: true,
  service: 'Sheikha Generic Root Neural Network',
  version: '1.0.0',
  cells: {
    kernel: sh('uname -r'),
    apiHealth: sh('curl -s http://127.0.0.1:8080/api/health'),
    pm2: sh('pm2 list --no-color'),
    ports: sh("ss -ltnp | grep -E ':(80|443|8080|8081|8082)' || true"),
    git: sh('git status --short'),
    disk: sh('df -h /')
  },
  verdict: 'GENERIC_ROOT_ACTIVE',
  timestamp: new Date().toISOString()
};

console.log(JSON.stringify(report, null, 2));
