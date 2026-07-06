#!/usr/bin/env node
'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const { summarize } = require('../../runtime/log-intelligence/sheikha-smart-log-governance-v1');

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'runtime/audit');
const REPORT = path.join(OUT_DIR, 'sheikha-smart-log-governance-latest.json');

function sh(cmd) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15000 });
  } catch (e) {
    return e.stdout || e.stderr || e.message;
  }
}

function safeWrite(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

const logs = [
  sh('journalctl -u haproxy -n 120 --no-pager || true'),
  sh('journalctl -u sheikha-main -n 120 --no-pager || true'),
  sh('journalctl -u sheikha-runtime -n 80 --no-pager || true')
].join('\n');

const lines = logs.split('\n').filter(Boolean);
const report = summarize(lines);

report.health = {
  local8080: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/health || true').trim(),
  unifiedChat: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/sheikha/unified-chat/status || true').trim(),
  publicHealth: sh('curl -s -o /dev/null -w "%{http_code}" https://sheikha.top/api/health || true').trim()
};

report.repairPlan = [];

if (report.counts.HAPROXY_HEALTH_CHECK > 0 && report.health.local8080 === '200') {
  report.repairPlan.push({
    id: 'HAPROXY_CHECK_TIMEOUT_TUNING',
    status: 'RECOMMENDED',
    safe: true,
    reason: 'Node health is 200 but HAProxy Layer7 checks time out around 2000ms.',
    action: 'Set HAProxy timeout check to 10s and validate config before reload.'
  });
}

safeWrite(REPORT, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify(report, null, 2));
