'use strict';

const express = require('express');
const cp = require('child_process');
const router = express.Router();
const { collectIntelligentInspector } = require('../../runtime/inspector-intelligence/sheikha-intelligent-inspector-v1');

function sh(cmd) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15000 });
  } catch (e) {
    return e.stdout || e.stderr || e.message;
  }
}

router.get('/api/sheikha/intelligent-inspector/v1/status', (_req, res) => {
  const logs = [
    sh('journalctl -u haproxy -n 80 --no-pager || true'),
    sh('journalctl -u sheikha-main -n 80 --no-pager || true')
  ].join('\n');

  res.json(collectIntelligentInspector(logs.split('\n').filter(Boolean)));
});

module.exports = router;
