#!/usr/bin/env node
'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const { aggregate } = require('../../runtime/log-intelligence-v2/sheikha-log-intelligence-v2');

const ROOT = process.env.SHEIKHA_ROOT || process.cwd();
const OUT = path.join(ROOT, 'runtime/reports/log-intelligence-v2/latest.json');

function sh(cmd, timeout = 10000) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout }).trim();
  } catch (e) {
    return String(e.stdout || e.stderr || e.message || '').trim();
  }
}

function httpCode(url) {
  return sh(`curl -s -o /dev/null -w "%{http_code}" ${url} || true`, 8000);
}

const health = {
  localHealth: httpCode('http://127.0.0.1:8080/api/health'),
  publicHealth: httpCode('https://sheikha.top/api/health'),
  unifiedChatStatus: httpCode('https://sheikha.top/api/sheikha/unified-chat/status'),
  intelligentInspector: httpCode('https://sheikha.top/api/sheikha/intelligent-inspector/v1/status')
};

const logs = [
  sh('journalctl -u haproxy -n 200 --no-pager || true'),
  sh('journalctl -u sheikha-main -n 200 --no-pager || true'),
  sh('journalctl -u sheikha-runtime -n 100 --no-pager || true')
].join('\n');

const report = aggregate(logs.split('\n').filter(Boolean), health);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify(report, null, 2));
process.exit(report.decision === 'HEALTHY' ? 0 : 2);
