/**
 * اختبار أمان HTTP لخوادم MCP SDK / IDE
 */
'use strict';

const path = require('path');
const { spawn } = require('child_process');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

async function waitFor(url, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function startServer(file, env) {
  return spawn(process.execPath, [file], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, ...env },
    stdio: 'ignore'
  });
}

(async () => {
  console.log('\n[1] MCP SDK / IDE HTTP Security');

  const sdkPort = '32101';
  const idePort = '32102';
  const sdkToken = 'sdk-test-token';
  const ideToken = 'ide-test-token';

  const sdk = startServer('mcp-servers/sheikha-sdk-server.js', {
    SHEIKHA_SDK_PORT: sdkPort,
    SHEIKHA_SDK_HOST: '127.0.0.1',
    SHEIKHA_SDK_TOKEN: sdkToken
  });

  const ide = startServer('mcp-servers/sheikha-ide-server.js', {
    SHEIKHA_IDE_PORT: idePort,
    SHEIKHA_IDE_HOST: '127.0.0.1',
    SHEIKHA_IDE_TOKEN: ideToken
  });

  try {
    assert(await waitFor(`http://127.0.0.1:${sdkPort}/sdk/health`), 'SDK health starts successfully');
    assert(await waitFor(`http://127.0.0.1:${idePort}/ide/health`), 'IDE health starts successfully');

    const sdkHealth = await fetch(`http://127.0.0.1:${sdkPort}/sdk/health`);
    assert(sdkHealth.status === 200 || sdkHealth.status === 207, 'SDK health remains public');

    const sdkBlocked = await fetch(`http://127.0.0.1:${sdkPort}/sdk/docs`);
    assert(sdkBlocked.status === 401, 'SDK docs require bearer token');

    const sdkAllowed = await fetch(`http://127.0.0.1:${sdkPort}/sdk/docs`, {
      headers: { Authorization: `Bearer ${sdkToken}` }
    });
    assert(sdkAllowed.status === 200, 'SDK docs accept valid bearer token');

    const ideHealth = await fetch(`http://127.0.0.1:${idePort}/ide/health`);
    assert(ideHealth.status === 200, 'IDE health remains public');

    const ideBlocked = await fetch(`http://127.0.0.1:${idePort}/ide/docs`);
    assert(ideBlocked.status === 401, 'IDE docs require bearer token');

    const ideAllowed = await fetch(`http://127.0.0.1:${idePort}/ide/docs`, {
      headers: { Authorization: `Bearer ${ideToken}` }
    });
    assert(ideAllowed.status === 200, 'IDE docs accept valid bearer token');
  } finally {
    sdk.kill('SIGTERM');
    ide.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`\nPassed: ${passed} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
})();
