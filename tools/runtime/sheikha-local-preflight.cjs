'use strict';

// Local-only container harness. Never print request/response bodies or secrets.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const mode = process.argv[2];
const tokenPath = '/tmp/sheikha-preflight-admin.jwt';
const sourcePaths = [
  'server.js', 'runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js',
  'runtime/sheikha-natural-integration/v1/sheikha-natural-integration-model.js',
  'routes/sheikha-infinite-agent/sheikha-infinite-agent-routes.js',
  'middleware/auth.js', 'config/config.js', 'Dockerfile', 'package.json',
  'package-lock.json', '.dockerignore', '.gcloudignore'
];
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sourceHashes = root => Object.fromEntries(sourcePaths.map(name =>
  [name, sha256(fs.readFileSync(path.join(root, name)))]));

function exclusions(root) {
  let envFiles = 0;
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === '.env' || entry.name.startsWith('.env.')) envFiles++;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(path.join(directory, entry.name));
    }
  }
  walk(root);
  const privateAssetsAbsent = [
    'private', 'intellectual-property', 'public/workspace/engineering/natural-integration.html',
    'public/workspace/engineering/natural-integration.js'
  ].every(name => !fs.existsSync(path.join(root, name)));
  return { envFilesAbsent: envFiles === 0, privateAssetsAbsent };
}

function launch() {
  process.umask(0o077);
  const checks = exclusions('/app');
  assert.equal(checks.envFilesAbsent, true);
  assert.equal(checks.privateAssetsAbsent, true);
  // Values are generated only inside this disposable, network-isolated container.
  const env = { ...process.env, NODE_ENV: 'production', PORT: '8080', HOST: '0.0.0.0',
    SHEIKHA_ENABLE_ALL_ENGINES: 'false', SHEIKHA_LOCALMIND_BOOT: 'false',
    SHEIKHA_ENABLE_CRON: 'false' };
  for (const name of ['JWT_SECRET', 'PASSWORD_SALT', 'SESSION_SECRET', 'DATA_ENCRYPTION_KEY']) {
    env[name] = crypto.randomBytes(48).toString('hex');
  }
  const jwt = require('/app/node_modules/jsonwebtoken');
  const token = jwt.sign({ id: 'local-preflight-only', role: 'admin' }, env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '10m' });
  fs.writeFileSync(tokenPath, token, { mode: 0o600, flag: 'wx' });
  const child = spawn(process.execPath, ['server.js'], { cwd: '/app', env, stdio: 'inherit' });
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
  child.once('error', () => { fs.rmSync(tokenPath, { force: true }); process.exit(1); });
  child.once('exit', (code, signal) => {
    fs.rmSync(tokenPath, { force: true });
    process.exit(code ?? (signal ? 1 : 0));
  });
}

async function test() {
  const results = [];
  const checks = exclusions('/app');
  let imageHashes;
  try {
    assert.equal(checks.envFilesAbsent, true);
    assert.equal(checks.privateAssetsAbsent, true);
    imageHashes = sourceHashes('/app');
    const deadline = Date.now() + 120000;
    let ready = false;
    while (Date.now() < deadline) {
      try {
        const response = await fetch('http://127.0.0.1:8080/api/health', {
          signal: AbortSignal.timeout(Math.max(1, Math.min(1000, deadline - Date.now()))), redirect: 'manual'
        });
        await response.arrayBuffer();
        if (response.status === 200) { ready = true; break; }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, Math.max(0, Math.min(500, deadline - Date.now()))));
    }
    assert.equal(ready, true, 'ReadinessTimeout');
    const tokenInfo = fs.statSync(tokenPath);
    assert.equal(tokenInfo.mode & 0o777, 0o600);
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    async function request(method, urlPath, authenticated, body, expected, validate) {
      const headers = {};
      if (authenticated) headers.Authorization = 'Bearer ' + token;
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      const response = await fetch('http://127.0.0.1:8080' + urlPath, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(10000), redirect: 'manual'
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      const row = { method, path: urlPath, authenticated, status: response.status, passed: false };
      results.push(row);
      assert.ok(expected.includes(response.status), 'UnexpectedHTTPStatus');
      if (validate) validate(data, response);
      row.passed = true;
      return data;
    }
    await request('GET', '/api/health', false, undefined, [200]);
    await request('GET', '/api/status', false, undefined, [200]);
    for (const urlPath of ['/api/infinite-agent/', '/api/infinite-agent/status',
      '/api/sheikha-kernel/', '/api/sheikha-kernel/status']) {
      await request('GET', urlPath, false, undefined, [200], data => {
        assert.deepEqual(Object.keys(data).sort(), ['bounded', 'liveNeuralNetwork', 'localSimulation', 'schema', 'status', 'success'].sort());
        assert.equal(data.schema, 'LOCAL_DESCRIPTOR_MODEL');
        assert.equal(data.liveNeuralNetwork, false);
      });
    }
    for (const urlPath of ['/api/infinite-agent/design', '/api/infinite-agent/jannah',
      '/api/infinite-agent/arabia', '/api/cosmic-engineering/', '/api/cosmic-engineering/island',
      '/api/cosmic-engineering/rasul', '/api/cosmic/rasul', '/api/infinite-agent/spawn',
      '/api/infinite-agent/full', '/api/sheikha-kernel/full', '/api/cosmic/full',
      '/api/cosmic/water', '/api/cosmic/atoms']) {
      await request('GET', urlPath, false, undefined, [401, 403]);
    }
    await request('POST', '/api/infinite-agent/spawn', false, {}, [401, 403]);
    await request('POST', '/api/cosmic-engineering/simulate', false, { scenario: 'island' }, [401, 403]);
    for (const urlPath of ['/workspace/engineering/natural-integration.html',
      '/workspace/engineering/natural-integration.js', '/private/engineering/natural-integration.html']) {
      await request('GET', urlPath, false, undefined, [404]);
    }
    const before = await request('GET', '/api/infinite-agent/design', true, undefined, [200]);
    for (const urlPath of ['/api/infinite-agent/jannah', '/api/infinite-agent/arabia',
      '/api/cosmic-engineering/', '/api/cosmic-engineering/island',
      '/api/cosmic-engineering/rasul', '/api/cosmic/rasul']) {
      await request('GET', urlPath, true, undefined, [200]);
    }
    for (const urlPath of ['/api/infinite-agent/full', '/api/sheikha-kernel/full']) {
      await request('GET', urlPath, true, undefined, [200], data => {
        assert.equal(data.liveNeuralNetwork, false);
        assert.equal(data.externalExecution, false);
        assert.equal(data.seal, null);
        assert.equal(data.statistics.agents, before.statistics.agents);
      });
    }
    for (const urlPath of ['/api/cosmic/full', '/api/cosmic/water']) {
      await request('GET', urlPath, true, undefined, [200], data => {
        assert.equal(data.synthetic, true);
      });
    }
    for (const urlPath of ['/api/cosmic-engineering/simulate', '/api/infinite-agent/simulate']) {
      await request('POST', urlPath, true, { scenario: 'island', rainMm: 20 }, [200], data => {
        assert.equal(data.data.synthetic, true);
        assert.equal(data.data.water.conserved, true);
        assert.ok(Math.abs(data.data.water.balanceResidualMm) <= data.data.water.balanceToleranceMm);
        assert.equal(data.externalExecution, false);
      });
    }
    await request('POST', '/api/cosmic-engineering/simulate', true, { rainMm: -1 }, [400]);
    await request('GET', '/api/infinite-agent/spawn', true, undefined, [405], (_data, response) => {
      assert.equal(response.headers.get('allow'), 'POST');
    });
    const after = await request('GET', '/api/infinite-agent/design', true, undefined, [200]);
    assert.equal(before.statistics.agents, after.statistics.agents);
    // The compatibility route exists; it must explicitly decline atomic simulation.
    await request('GET', '/api/cosmic/atoms', true, undefined, [501], data => {
      assert.equal(data.success, false);
      assert.equal(data.error, 'ATOMIC_SIMULATION_NOT_IMPLEMENTED');
      assert.equal(data.executed, false);
    });
    process.stdout.write(JSON.stringify({ passed: true, ...checks, imageHashes, results }) + '\n');
  } catch (error) {
    process.stdout.write(JSON.stringify({ passed: false, errorType: error.name, ...checks, imageHashes, results }) + '\n');
    process.exitCode = 1;
  }
}

function hashContext() {
  const root = process.argv[3];
  const hash = crypto.createHash('sha256');
  let files = 0;
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const filename = path.join(directory, entry.name);
      assert.equal(entry.isSymbolicLink(), false);
      if (entry.isDirectory()) walk(filename);
      else {
        assert.equal(entry.isFile(), true);
        hash.update(path.relative(root, filename)); hash.update('\0');
        hash.update(sha256(fs.readFileSync(filename))); hash.update('\0');
        files++;
      }
    }
  }
  walk(root);
  process.stdout.write(JSON.stringify({ contextSha256: hash.digest('hex'), files, sourceHashes: sourceHashes(root) }) + '\n');
}

function receipt() {
  const [directory, image, container, stage, exitCode, cleanupOK, imageId] = process.argv.slice(3);
  function readJson(name) {
    try { return JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')); } catch { return null; }
  }
  const context = readJson('source.json');
  const http = readJson('http.json');
  let sameSources = false;
  if (http?.imageHashes && context?.sourceHashes) {
    sameSources = JSON.stringify(http.imageHashes) === JSON.stringify(context.sourceHashes);
  }
  const ignoreNow = fs.existsSync(process.argv[10]) ? sha256(fs.readFileSync(process.argv[10])) : null;
  const ignoreUnchanged = context?.sourceHashes?.['.dockerignore'] === ignoreNow;
  const passed = exitCode === '0' && cleanupOK === 'true' && http?.passed === true && sameSources && ignoreUnchanged;
  const report = { schema: 'SHEIKHA_LOCAL_PREFLIGHT_V1', timestamp: new Date().toISOString(),
    passed, localOnly: true, externalDeployment: false, image, imageId: imageId || null,
    containerName: container, stage, exitCode: Number(exitCode), cleanupOK: cleanupOK === 'true',
    contextSha256: context?.contextSha256 || null, contextFiles: context?.files || null,
    sourceHashes: context?.sourceHashes || null, imageSourcesMatchContext: sameSources,
    dockerignoreUnchanged: ignoreUnchanged, envFilesAbsent: http?.envFilesAbsent ?? null,
    privateAssetsAbsent: http?.privateAssetsAbsent ?? null,
    atomsImplemented: false, expectedAtomsStatus: 501,
    passedRequests: http?.results?.filter(row => row.passed).length || 0,
    totalRequests: http?.results?.length || 0, requests: http?.results || [],
    logsDirectory: directory };
  fs.writeFileSync(path.join(directory, 'receipt.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  process.stdout.write(`${passed ? 'PASS' : 'FAIL'}: ${report.passedRequests}/${report.totalRequests} local HTTP checks; no deployment.\nReceipt: ${directory}/receipt.json\n`);
  process.exitCode = passed ? 0 : 1;
}

if (mode === 'launch') launch();
else if (mode === 'test') test();
else if (mode === 'hash') hashContext();
else if (mode === 'receipt') receipt();
else { process.stderr.write('Unknown local preflight harness mode.\n'); process.exitCode = 2; }
