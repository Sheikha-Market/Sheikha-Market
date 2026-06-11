'use strict';

const express = require('express');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();
router.use(express.json({ limit: '2mb' }));

const ROOT = '/opt/sheikha/current';

function run(cmd) {
  return cp.execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 15000
  }).trim();
}

router.get('/api/sheikha/cli/readonly/status', (req, res) => {
  const ok = fs.existsSync(path.join(ROOT, 'package.json')) && fs.existsSync(path.join(ROOT, 'server.js'));

  if (!ok) {
    return res.status(500).json({
      success: false,
      status: 'BLOCKED',
      reason: 'ROOT_NOT_VALID',
      root: ROOT
    });
  }

  res.json({
    success: true,
    status: 'ACTIVE',
    mode: 'READ_ONLY_REAL',
    root: ROOT,
    branch: run('git branch --show-current || true'),
    gitStatus: run('git status --short || true'),
    npmScripts: Object.keys(require(path.join(ROOT, 'package.json')).scripts || {})
  });
});

router.post('/api/sheikha/cli/readonly/run', (req, res) => {
  const allowed = {
    git_status: 'git status --short',
    git_branch: 'git branch --show-current',
    npm_scripts: 'node -e "console.log(Object.keys(require(\\"./package.json\\").scripts||{}).join(\\"\\n\\"))"',
    node_check_server: 'node --check server.js'
  };

  const action = req.body?.action;
  if (!allowed[action]) {
    return res.status(400).json({
      success: false,
      status: 'BLOCKED',
      reason: 'ACTION_NOT_ALLOWED',
      allowed: Object.keys(allowed)
    });
  }

  res.json({
    success: true,
    action,
    root: ROOT,
    output: run(allowed[action])
  });
});

module.exports = router;
