#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const { renderSheikhaChatTemplate } = require(path.join(root, 'src/ui/sheikhaChatTemplate.js'));
const nonce = 'quick-action-fixture';
const tag = `<script nonce="${nonce}">`;
const bridge = `${tag}
window.__messages = [];
window.acquireVsCodeApi = () => ({getState: () => ({}), setState: () => {}, postMessage: m => window.__messages.push(m)});
</script>${tag}`;
const check = `${tag}
setTimeout(() => {
  const input = document.getElementById('input');
  const run = document.querySelector('[data-mode="engineering"]');
  const doc = document.querySelector('[data-mode="editorial"]');
  const result = {};
  input.value = 'SYNTHETIC_TASK'; run.click();
  result.preserved = input.value === run.dataset.prompt + '\\n\\nSYNTHETIC_TASK';
  run.click();
  result.noDuplicate = input.value === run.dataset.prompt + '\\n\\nSYNTHETIC_TASK';
  doc.click();
  result.switched = input.value === doc.dataset.prompt + '\\n\\nSYNTHETIC_TASK';
  result.noAutoSubmit = !window.__messages.some(m => m.command === 'ask');
  document.getElementById('send').click();
  const ask = window.__messages.find(m => m.command === 'ask');
  result.sentTask = Boolean(ask && ask.text === doc.dataset.prompt + '\\n\\nSYNTHETIC_TASK');
  result.correctMode = Boolean(ask && ask.mode === 'editorial');
  document.body.dataset.quickActionResults = JSON.stringify(result);
}, 50);
</script></body>`;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-quick-action-'));
fs.chmodSync(temp, 0o700);
const fixture = path.join(temp, 'chat.html');
fs.writeFileSync(fixture, renderSheikhaChatTemplate({ nonce, version: 'fixture' })
  .replace(tag, bridge).replace('</body>', check), { mode: 0o600 });
const run = spawnSync('/usr/bin/google-chrome', [
  '--headless=new', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run', '--disable-background-networking',
  `--user-data-dir=${path.join(temp, 'chrome')}`, '--virtual-time-budget=1500', '--dump-dom', `file://${fixture}`
], { encoding: 'utf8', timeout: 20000, maxBuffer: 4 * 1024 * 1024 });
const dom = run.stdout || '';
const match = dom.match(/data-quick-action-results="([^"]*)"/);
const checks = match ? JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')) : {};
const passed = run.status === 0 && Object.keys(checks).length === 6 && Object.values(checks).every(v => v === true);
console.log(JSON.stringify({ observedAt: new Date().toISOString(), extensionRoot: root, passed,
  exitCode: run.status, signal: run.signal, checks, fixture,
  domSha256: crypto.createHash('sha256').update(dom).digest('hex'),
  stderr: passed ? null : (run.stderr || '').slice(-2000),
  scope: 'SYNTHETIC_BROWSER_BRIDGE_NOT_VSCODE_EXTENSION_HOST' }, null, 2));
process.exitCode = passed ? 0 : 1;
