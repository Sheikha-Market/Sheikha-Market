'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const net = require('node:net');
const { spawn } = require('node:child_process');
const mode = process.argv[2];
const IMAGE_ID = '4d0bb4c274eaad02a4c7996afe1897280135ad846e19f5d539d496dc51998375';
const VERIFIED_SERVER_SHA256 = 'e96494a4af961d1378e0a12e77d3815c0d78b8851390cabc5093f507c87217f2';
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function prepare() {
  const [receiptPath, destination] = process.argv.slice(3);
  const info = fs.lstatSync(receiptPath);
  assert.equal(info.isFile(), true);
  assert.equal(info.isSymbolicLink(), false);
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  assert.equal(receipt.schema, 'SHEIKHA_LOCAL_PREFLIGHT_V1');
  assert.equal(receipt.passed, true);
  assert.equal(receipt.externalDeployment, false);
  assert.equal(receipt.imageId, IMAGE_ID);
  assert.equal(receipt.envFilesAbsent, true);
  assert.equal(receipt.privateAssetsAbsent, true);
  assert.equal(receipt.imageSourcesMatchContext, true);
  assert.equal(receipt.totalRequests, receipt.passedRequests);
  assert.ok(receipt.totalRequests >= 30);
  const files = receipt.sourceHashes;
  assert.equal(typeof files, 'object');
  assert.ok(Object.keys(files).length >= 10);
  for (const [name, hash] of Object.entries(files)) {
    assert.ok(!name.startsWith('/') && !name.split('/').includes('..'));
    assert.match(hash, /^[0-9a-f]{64}$/);
  }
  fs.writeFileSync(destination, JSON.stringify({ imageId: IMAGE_ID, sourceHashes: files }), { mode: 0o600, flag: 'wx' });
  process.stdout.write(IMAGE_ID + '\n');
}

function verifyImage() {
  const manifest = JSON.parse(fs.readFileSync('/tmp/sheikha-local-runtime-source.json', 'utf8'));
  assert.equal(manifest.imageId, IMAGE_ID);
  for (const [name, expected] of Object.entries(manifest.sourceHashes)) {
    assert.equal(sha256(fs.readFileSync(path.join('/app', name))), expected);
  }
  let envFiles = 0;
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === '.env' || entry.name.startsWith('.env.')) envFiles++;
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(path.join(directory, entry.name));
    }
  }
  walk('/app');
  assert.equal(envFiles, 0);
  for (const name of ['private', 'intellectual-property', 'public/workspace/engineering/natural-integration.html',
    'public/workspace/engineering/natural-integration.js']) {
    assert.equal(fs.existsSync(path.join('/app', name)), false);
  }
}

function launch() {
  process.umask(0o077);
  verifyImage();
  // Allowlist basic runtime metadata; no host/image provider credentials are inherited.
  const env = {};
  for (const name of ['PATH', 'HOME', 'LANG', 'TZ', 'HOSTNAME']) {
    if (process.env[name]) env[name] = process.env[name];
  }
  Object.assign(env, { NODE_ENV: 'production', PORT: '8080', HOST: '0.0.0.0',
    SECURITY_STRICT_SECRETS: 'true', SHEIKHA_ENABLE_ALL_ENGINES: 'false',
    SHEIKHA_LOCALMIND_BOOT: 'false', SHEIKHA_ENABLE_CRON: 'false',
    SHEIKHA_ENABLE_ANTHROPIC: 'false', SHEIKHA_AI_ROUTER_ENABLED: 'false',
    SHEIKHA_AI_ROUTER_UPSTREAM: 'sheikha', OLLAMA_ENABLED: 'false',
    OLLAMA_AUTO_UPDATE: 'false', OLLAMA_ALLOW_PULL: 'false', AI_MODE: 'local-first' });
  for (const name of ['JWT_SECRET', 'PASSWORD_SALT', 'SESSION_SECRET', 'DATA_ENCRYPTION_KEY']) {
    env[name] = crypto.randomBytes(name === 'DATA_ENCRYPTION_KEY' ? 32 : 48).toString('hex');
  }
  // No admin token is created or exported by this persistent local launcher.
  const child = spawn(process.execPath, ['server.js'], { cwd: '/app', env, stdio: 'inherit' });
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
  child.once('error', () => process.exit(1));
  child.once('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
}

async function choosePort() {
  for (let port = 19185; port <= 19195; port++) {
    const available = await new Promise(resolve => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.listen({ host: '127.0.0.1', port, exclusive: true }, () => server.close(() => resolve(true)));
    });
    if (available) { process.stdout.write(String(port) + '\n'); return; }
  }
  throw new Error('NoFreeLocalRuntimePort');
}

async function probe() {
  const [portText, resultPath] = process.argv.slice(3);
  const port = Number(portText);
  assert.ok(Number.isInteger(port) && port >= 19185 && port <= 19195);
  const base = 'http://127.0.0.1:' + port;
  const results = [];
  const deadline = Date.now() + 120000;
  let ready = false;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base + '/api/health', {
        signal: AbortSignal.timeout(Math.max(1, Math.min(1000, deadline - Date.now()))), redirect: 'manual'
      });
      await response.arrayBuffer();
      if (response.status === 200) { ready = true; break; }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, Math.max(0, Math.min(500, deadline - Date.now()))));
  }
  try {
    assert.equal(ready, true);
    for (const [urlPath, expected] of [['/api/health', 200], ['/api/status', 200],
      ['/api/infinite-agent/status', 200], ['/api/infinite-agent/design', 401]]) {
      const response = await fetch(base + urlPath, { signal: AbortSignal.timeout(5000), redirect: 'manual' });
      const body = await response.json();
      results.push({ method: 'GET', path: urlPath, status: response.status });
      assert.equal(response.status, expected);
      if (urlPath === '/api/infinite-agent/status') {
        assert.equal(body.schema, 'LOCAL_DESCRIPTOR_MODEL');
        assert.equal(body.bounded, true);
        assert.equal(body.liveNeuralNetwork, false);
      }
    }
    fs.writeFileSync(resultPath, JSON.stringify({ passed: true, requests: results }), { mode: 0o600, flag: 'wx' });
  } catch (error) {
    fs.writeFileSync(resultPath, JSON.stringify({ passed: false, errorType: error.name, requests: results }), { mode: 0o600, flag: 'wx' });
    throw error;
  }
}

function writeReceipt() {
  const [directory, action, state, portText, containerId] = process.argv.slice(3);
  let probe;
  try { probe = JSON.parse(fs.readFileSync(path.join(directory, 'probe.json'), 'utf8')); } catch { probe = null; }
  const port = portText ? Number(portText) : null;
  let workingTreeServerSha256 = null;
  try { workingTreeServerSha256 = sha256(fs.readFileSync(path.resolve(directory, '../../..', 'server.js'))); } catch {}
  const receipt = { schema: 'SHEIKHA_LOCAL_RUNTIME_V1', timestamp: new Date().toISOString(),
    action, state, containerName: 'sheikha-local-governed-v1', containerId: containerId || null,
    imageId: IMAGE_ID, loopbackUrl: port ? 'http://127.0.0.1:' + port : null,
    verifiedImageServerSha256: VERIFIED_SERVER_SHA256, workingTreeServerSha256,
    sourceDriftObserved: workingTreeServerSha256 !== null && workingTreeServerSha256 !== VERIFIED_SERVER_SHA256,
    localOnly: true, externalDeployment: false, cloudChanged: false, devicesChanged: false,
    hostVolumes: false, hostEnvironmentFiles: false, providerKeysInherited: false,
    aiExternalProvidersConfigured: false, allEngines: false, cron: false, localMindBoot: false,
    network: 'ROOTLESS_SLIRP4NETNS_LOOPBACK_PUBLICATION', egressFirewallEnforced: false,
    durableHostDataConfigured: false, adminTokenExported: false,
    ready: probe?.passed === true, requests: probe?.requests || [] };
  fs.writeFileSync(path.join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  process.stdout.write(`${state}${receipt.loopbackUrl ? ': ' + receipt.loopbackUrl : ''}\nReceipt: ${directory}/receipt.json\n`);
}

async function main() {
  if (mode === 'prepare') prepare();
  else if (mode === 'launch') launch();
  else if (mode === 'port') await choosePort();
  else if (mode === 'probe') await probe();
  else if (mode === 'receipt') writeReceipt();
  else throw new Error('UnknownLocalRuntimeCommand');
}
main().catch(error => { process.stderr.write('Local runtime operation failed: ' + error.name + '\n'); process.exitCode = 1; });
