'use strict';

const express = require('express');
const cp = require('child_process');
const router = express.Router();
const { aggregate } = require('../../runtime/log-intelligence-v2/sheikha-log-intelligence-v2');

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

router.get('/api/sheikha/log-intelligence/v2/status', (_req, res) => {
  const health = {
    localHealth: httpCode('http://127.0.0.1:8080/api/health'),
    publicHealth: httpCode('https://sheikha.top/api/health'),
    unifiedChatStatus: httpCode('https://sheikha.top/api/sheikha/unified-chat/status'),
    intelligentInspector: httpCode('https://sheikha.top/api/sheikha/intelligent-inspector/v1/status')
  };

  const logs = [
    sh('journalctl -u haproxy -n 120 --no-pager || true'),
    sh('journalctl -u sheikha-main -n 120 --no-pager || true')
  ].join('\n');

  res.json(aggregate(logs.split('\n').filter(Boolean), health));
});

module.exports = router;
