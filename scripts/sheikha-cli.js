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

async function main() {
  const cmd = process.argv[2] || 'status';
  const arg = process.argv[3] || '';

  if (cmd === 'status') {
    console.log(await request('/api/root-control-plane/health'));
    return;
  }

  if (cmd === 'classify') {
    console.log(await request('/api/root-control-plane/classify', 'POST', { system: arg || 'unknown' }));
    return;
  }

  if (cmd === 'analyze') {
    console.log(await request('/api/root-control-plane/layers'));
    return;
  }

  if (cmd === 'ports' || cmd === 'unity') {
    console.log(await request('/api/root-control-plane/ports'));
    return;
  }

  if (cmd === 'expand') {
    console.log(await request('/api/root-control-plane/classify', 'POST', {
      system: arg || 'unknown',
      mode: 'expansion'
    }));
    return;
  }

  if (cmd === 'decision') {
    console.log(await request('/api/decision-flow/decide', 'POST', { system: arg || 'general', type: 'cli-check' }));
    return;
  }

  if (cmd === 'runtime') {
    console.log(await request('/api/runtime-root/health'));
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
    console.log(await request('/api/health'));
    console.log(await request('/api/root-control-plane/health'));
    console.log(await request('/api/runtime-root/health'));
    console.log(await request('/api/decision-flow/health'));
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
  sheikha smoke
  sheikha self-govern
`);
}

main().catch(err => {
  console.error('SHEIKHA_CLI_ERROR:', err.message);
  process.exit(1);
});
