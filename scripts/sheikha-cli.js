#!/usr/bin/env node

const http = require('http');

const BASES = process.env.SHEIKHA_API
  ? [process.env.SHEIKHA_API]
  : ['http://127.0.0.1:8080', 'http://127.0.0.1:8082'];

function request(path, method = 'GET', body = null) {
  return requestFromBases(BASES, path, method, body);
}

async function requestFromBases(bases, path, method = 'GET', body = null) {
  let lastError;

  for (const base of bases) {
    try {
      return await requestFromBase(base, path, method, body);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

function requestFromBase(base, path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, base);
    const data = body ? JSON.stringify(body) : null;

    const req = http.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        try { resolve(JSON.parse(out)); }
        catch { resolve(out); }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function printJson(value) {
  if (typeof value === 'string') {
    console.log(value);
    return;
  }

  console.log(JSON.stringify(value, null, 2));
}

async function main() {
  const cmd = process.argv[2] || 'status';
  const arg = process.argv[3] || '';

  if (cmd === 'status') {
    printJson(await request('/api/root-control-plane/health'));
    return;
  }

  if (cmd === 'classify') {
    printJson(await request('/api/root-control-plane/classify', 'POST', { system: arg || 'unknown' }));
    return;
  }

  if (cmd === 'analyze') {
    printJson(await request('/api/root-control-plane/layers'));
    return;
  }

  if (cmd === 'ports' || cmd === 'unity') {
    printJson(await request('/api/root-control-plane/ports'));
    return;
  }

  if (cmd === 'expand') {
    printJson(await request('/api/root-control-plane/classify', 'POST', {
      system: arg || 'unknown',
      mode: 'expansion'
    }));
    return;
  }

  if (cmd === 'decision') {
    printJson(await request('/api/decision-flow/decide', 'POST', { system: arg || 'general', type: 'cli-check' }));
    return;
  }

  if (cmd === 'runtime') {
    printJson(await request('/api/runtime-root/health'));
    return;
  }

  if (cmd === 'rwp' || cmd === 'read-write-publish') {
    printJson(await request('/api/sheikha/read-write-publish/status'));
    return;
  }

  if (cmd === 'publish-plan') {
    printJson(await request('/api/sheikha/read-write-publish/plan', 'POST', {
      action: 'publish',
      target: arg || 'working-tree',
      platform: 'local-git',
      testsPassed: false,
      humanApproved: false
    }));
    return;
  }


  if (cmd === 'self-govern' || cmd === 'govern') {
    const { spawnSync } = require('child_process');
    const result = spawnSync(process.execPath, ['scripts/sheikha-self-governance.js', ...process.argv.slice(3)], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status === null ? 1 : result.status);
    return;
  }

  if (cmd === 'smoke') {
    printJson({
      health: await request('/api/health'),
      rootControlPlane: await request('/api/root-control-plane/health'),
      runtimeRoot: await request('/api/runtime-root/health'),
      decisionFlow: await request('/api/decision-flow/health')
    });
    return;
  }

  console.log(`
Sheikha CLI — شبكة شيخة الجذرية

الأوامر:
  sheikha status
  sheikha analyze
  sheikha ports
  sheikha classify payments
  sheikha expand ai-engine
  sheikha decision market
  sheikha runtime
  sheikha rwp
  sheikha publish-plan docs/architecture/file.md
  sheikha smoke
  sheikha self-govern
`);
}

main().catch(err => {
  console.error('SHEIKHA_CLI_ERROR:', err.message);
  process.exit(1);
});
