#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  renderSheikhaChatTemplate
} = require('../src/ui/sheikhaChatTemplate');
const { version: EXTENSION_VERSION } = require('../package.json');

const ROOT = path.resolve(__dirname, '..', '..');
const NONCE = 'sheikha-send-click-test';
const MESSAGE = 'SHEIKHA_SEND_CLICK_DOM_OK';
const EVIDENCE = path.join(
  ROOT,
  'runtime/extension-experience-apex/v1/evidence/' +
    'sheikha-chat-send-dom-click-v1.json'
);

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(Buffer.from(String(value || ''), 'utf8'))
    .digest('hex');
}

function browserFixture() {
  const template = renderSheikhaChatTemplate({
    nonce: NONCE,
    version: EXTENSION_VERSION
  });
  const scriptTag = `<script nonce="${NONCE}">`;
  const bridge = `${scriptTag}
window.__sheikhaMessages = [];
window.acquireVsCodeApi = function () {
  return {
    getState: function () { return {}; },
    setState: function () {},
    postMessage: function (message) {
      window.__sheikhaMessages.push(message);
      return true;
    }
  };
};
</script>
${scriptTag}`;
  const click = `${scriptTag}
setTimeout(function () {
  const input = document.getElementById('input');
  const send = document.getElementById('send');
  input.value = '${MESSAGE}';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  document.body.dataset.sendDisabledBeforeClick = String(send.disabled);
  send.click();
  const ask = window.__sheikhaMessages.find(function (entry) {
    return entry.command === 'ask';
  });
  document.body.dataset.sendClickExecuted = 'true';
  document.body.dataset.askPosted = String(Boolean(ask));
  document.body.dataset.askTextMatched = String(
    Boolean(ask && ask.text === '${MESSAGE}')
  );
  document.body.dataset.sendDisabledAfterClick = String(send.disabled);
  const tools = Array.from(document.querySelectorAll('[data-tool-command]'));
  const statusTool = document.querySelector(
    '[data-tool-command="sheikha.showStatus"]'
  );
  if (statusTool) statusTool.click();
  const toolRequest = window.__sheikhaMessages.find(function (entry) {
    return entry.command === 'tool';
  });
  document.body.dataset.chatToolCount = String(tools.length);
  document.body.dataset.toolClickPosted = String(Boolean(toolRequest));
  document.body.dataset.toolIdMatched = String(
    Boolean(toolRequest && toolRequest.toolId === 'sheikha.showStatus')
  );
}, 50);
</script>
</body>`;
  return template
    .replace(scriptTag, bridge)
    .replace('</body>', click);
}

function writeJsonAtomic(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(
    temporary,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8'
  );
  fs.renameSync(temporary, target);
}

function execute() {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'sheikha-send-click-')
  );
  const fixture = path.join(temporaryDirectory, 'chat.html');
  fs.writeFileSync(fixture, browserFixture(), 'utf8');
  const result = spawnSync(
    '/usr/bin/google-chrome',
    [
      '--headless=new',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--user-data-dir=${path.join(temporaryDirectory, 'chrome')}`,
      '--virtual-time-budget=1500',
      '--dump-dom',
      `file://${fixture}`
    ],
    {
      encoding: 'utf8',
      timeout: 20000,
      maxBuffer: 4 * 1024 * 1024
    }
  );
  const dom = String(result.stdout || '');
  const checks = {
    chromeExecuted: result.status === 0,
    clickExecuted:
      dom.includes('data-send-click-executed="true"'),
    sendEnabledBeforeClick:
      dom.includes('data-send-disabled-before-click="false"'),
    askPosted:
      dom.includes('data-ask-posted="true"'),
    askTextMatched:
      dom.includes('data-ask-text-matched="true"'),
    composerLockedAfterAcceptedClick:
      dom.includes('data-send-disabled-after-click="true"'),
    allChatToolsRendered:
      dom.includes('data-chat-tool-count="39"'),
    governedToolClickPosted:
      dom.includes('data-tool-click-posted="true"'),
    governedToolIdMatched:
      dom.includes('data-tool-id-matched="true"')
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => passed !== true)
    .map(([id]) => id);
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_CHAT_SEND_DOM_CLICK_V1',
    generatedAt: new Date().toISOString(),
    status: failedChecks.length
      ? 'DOM_CLICK_FAILED'
      : 'DOM_CLICK_VERIFIED',
    passed: failedChecks.length === 0,
    browser: 'google-chrome-headless',
    extensionVersion: EXTENSION_VERSION,
    readyAckInjected: false,
    checks,
    failedChecks,
    observations: {
      exitCode: result.status,
      signal: result.signal,
      error: result.error?.message || null,
      domSha256: sha256(dom),
      stderrSha256: sha256(result.stderr),
      temporaryFixture: fixture
    },
    boundaries: {
      externalNetworkUsed: false,
      vscodeSettingsModified: false,
      shellCommandSentByChat: false,
      arbitraryVsCodeCommandAccepted: false,
      arbitraryFilesystemAccessGranted: false
    }
  };
  writeJsonAtomic(EVIDENCE, report);
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
  return report;
}

if (require.main === module) {
  execute();
}

module.exports = {
  browserFixture,
  execute
};
