#!/usr/bin/env node
'use strict';

const cp = require('child_process');
const { collectIntelligentInspector } = require('../../runtime/inspector-intelligence/sheikha-intelligent-inspector-v1');

function sh(cmd) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15000 });
  } catch (e) {
    return e.stdout || e.stderr || e.message;
  }
}

const logs = [
  sh('journalctl -u haproxy -n 120 --no-pager || true'),
  sh('journalctl -u sheikha-main -n 120 --no-pager || true'),
  sh('journalctl -u sheikha-runtime -n 80 --no-pager || true')
].join('\n');

console.log(JSON.stringify(
  collectIntelligentInspector(logs.split('\n').filter(Boolean)),
  null,
  2
));
