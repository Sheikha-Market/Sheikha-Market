'use strict';

const express = require('express');
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const router = express.Router();
const { aggregate } = require('../../runtime/log-intelligence-v2/sheikha-log-intelligence-v2');

const ROOT = process.env.SHEIKHA_ROOT || process.cwd();
const CONTINUOUS_REPORT = path.join(ROOT, 'runtime/reports/continuous-inspector/latest.json');

function sh(cmd, timeout = 10000) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout }).trim();
  } catch (e) {
    return String(e.stdout || e.stderr || e.message || '').trim();
  }
}

function readCachedHealth() {
  try {
    const cached = JSON.parse(fs.readFileSync(CONTINUOUS_REPORT, 'utf8'));
    return {
      localHealth: cached.runtime?.localHealth || 'UNKNOWN',
      publicHealth: cached.runtime?.publicHealth || 'UNKNOWN',
      unifiedChatStatus: cached.runtime?.unifiedChatStatus || 'UNKNOWN',
      intelligentInspector: cached.runtime?.intelligentInspector || 'UNKNOWN',
      source: 'continuous-inspector-cache'
    };
  } catch (_) {
    return {
      localHealth: 'UNKNOWN',
      publicHealth: 'UNKNOWN',
      unifiedChatStatus: 'UNKNOWN',
      intelligentInspector: 'UNKNOWN',
      source: 'cache-missing'
    };
  }
}

router.get('/api/sheikha/log-intelligence/v2/status', (_req, res) => {
  const health = readCachedHealth();

  const logs = [
    sh('journalctl -u haproxy -n 120 --no-pager || true'),
    sh('journalctl -u sheikha-main -n 120 --no-pager || true')
  ].join('\n');

  res.json(aggregate(logs.split('\n').filter(Boolean), health));
});

module.exports = router;
