'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const http = require('node:http');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '../../..');
const REGISTRY = path.join(ROOT, 'config/sheikha-repository-integrations-v1.json');
const COMPONENTS = Object.freeze({
  SHEIKHA_GIT: ['runtime/sheikha-studio/git-lab/sheikha-git-lab-federation.js'],
  SHEIKHA_VISUAL: ['runtime/sheikha-visual-spatial-fabric-v1/server.js',
    'runtime/sheikha-visual-spatial-fabric-v1/drawing-policy-v2.js',
    'runtime/sheikha-visual-spatial-fabric-v1/dimension-engine-v1.js'],
  SHEIKHA_NODE: ['package.json', 'package-lock.json'],
  SHEIKHA_DOCKER: ['infra/docker/repository-integration-v1/Dockerfile',
    'infra/docker/repository-integration-v1/compose.yaml'],
  SHEIKHA_STUDIO: ['runtime/sheikha-studio/platform/sheikha-studio-platform.js'],
  SHEIKHA_MODEL_HUB: ['runtime/sheikha-ai-model-hub/v1/sheikha-ai-model-hub-v1.js'],
  SHEIKHA_FOUNDRY: ['core/foundry/sheikha-foundry-v3.js'],
  SHEIKHA_LANGUAGE: ['sheikha-language/compiler/sheikha-compiler.js'],
  SHEIKHA_SDK: ['sdk/sheikha-js/index.js', 'sdk/sheikha-api/index.js'],
  SHEIKHA_CLI: ['cli/sheikha/sheikha-cli.js'],
  SHEIKHA_MCP: ['mcp/sheikha/mcp-manifest.json'],
  SHEIKHA_COMMERCE: ['runtime/commercial-sales/v1/sheikha-commercial-sales-service-v1.js']
});

const ENV = Object.freeze({ PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C',
  GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_COUNT: '0',
  GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' });
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function command(binary, args, cwd) {
  try {
    return { ok: true, text: execFileSync(binary, args, { cwd, env: ENV,
      encoding: 'utf8', timeout: 3000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch {
    return { ok: false, text: null };
  }
}

function git(root, args) {
  return command('/usr/bin/git', ['--no-optional-locks', '-c', 'core.fsmonitor=false',
    '-c', 'core.hooksPath=/dev/null', '-C', root, ...args], root);
}

function privateRoot(root) {
  const resolved = path.resolve(root);
  if (!fs.lstatSync(resolved).isDirectory() || fs.realpathSync(resolved) !== resolved) {
    throw new Error('REPOSITORY_ROOT_NOT_CANONICAL');
  }
  return resolved;
}

function readBounded(root, relative, max = 5 * 1024 * 1024) {
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw new Error('SOURCE_SCOPE_ESCAPE');
  if (fs.realpathSync(target) !== target) throw new Error('SOURCE_SYMLINK_DENIED');
  if (!fs.lstatSync(target).isFile()) throw new Error('SOURCE_UNSUPPORTED');
  const fd = fs.openSync(target, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > max) throw new Error('SOURCE_UNSUPPORTED');
    const buffer = Buffer.alloc(max + 1);
    let length = 0;
    while (length < buffer.length) {
      const count = fs.readSync(fd, buffer, length, buffer.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length > max) throw new Error('SOURCE_TOO_LARGE');
    return buffer.subarray(0, length);
  } finally { fs.closeSync(fd); }
}

function sourceEvidence(root, relative) {
  try {
    const bytes = readBounded(root, relative);
    return { source: relative, state: 'SOURCE_PRESENT', bytes: bytes.length, sha256: digest(bytes) };
  } catch {
    return { source: relative, state: 'SOURCE_MISSING_OR_UNREADABLE', sha256: null };
  }
}

function worktreeCounts(output) {
  const counts = { changedEntries: 0, staged: 0, unstaged: 0, untrackedEntries: 0, conflicts: 0 };
  const entries = output.split('\0');
  for (let i = 0; i < entries.length; i++) {
    if (!entries[i]) continue;
    const status = entries[i].slice(0, 2);
    if (entries[i][2] !== ' ') throw new Error('UNEXPECTED_GIT_STATUS');
    counts.changedEntries++;
    if (status === '??') counts.untrackedEntries++;
    else {
      if (status[0] !== ' ') counts.staged++;
      if (status[1] !== ' ') counts.unstaged++;
      if (['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU'].includes(status)) counts.conflicts++;
      if (/[RC]/.test(status)) i++;
    }
  }
  return counts;
}

function inspectRepository(entry, workspaceRoot) {
  const result = { id: entry.id, state: 'UNAVAILABLE', git: null, components: [], nodeProject: null };
  let root;
  try { root = privateRoot(path.resolve(workspaceRoot, entry.root)); } catch { return result; }
  const bare = git(root, ['rev-parse', '--is-bare-repository']);
  const location = git(root, ['rev-parse', bare.text?.trim() === 'true' ? '--absolute-git-dir' : '--show-toplevel']);
  if (!bare.ok || !location.ok || path.resolve(location.text.trim()) !== root) return result;
  const head = git(root, ['rev-parse', '--verify', 'HEAD']);
  const headSha = head.ok && /^[a-f0-9]{40,64}$/.test(head.text.trim()) ? head.text.trim() : null;
  const status = bare.text.trim() === 'true' ? null : git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=normal']);
  let changes = null;
  try { if (status?.ok) changes = worktreeCounts(status.text); } catch { /* Unknown is not clean. */ }
  result.state = 'LOCAL_REPOSITORY_OBSERVED';
  result.git = { headSha, bare: bare.text.trim() === 'true', changes,
    clean: changes ? changes.changedEntries === 0 : null, remoteContacted: false };
  result.components = Object.entries(COMPONENTS).map(([id, files]) => {
    const evidence = files.map(file => sourceEvidence(root, file));
    return { id, state: evidence.every(item => item.sha256) ? 'SOURCES_PRESENT_NOT_RUNTIME_PROOF' : 'SOURCES_INCOMPLETE',
      evidence, runtimeVerified: false };
  });
  try {
    const pkg = JSON.parse(readBounded(root, 'package.json', 1024 * 1024));
    result.nodeProject = { declaredEngine: typeof pkg.engines?.node === 'string' ? pkg.engines.node.slice(0, 120) : null,
      lockfilePresent: result.components.find(item => item.id === 'SHEIKHA_NODE').evidence[1].sha256 !== null,
      engineCompatibilityVerified: false, scriptsExecuted: false };
  } catch { /* Repositories need not contain a Node project. */ }
  return result;
}

function loadRegistry(file = REGISTRY) {
  const resolved = path.resolve(file);
  const content = readBounded(path.dirname(resolved), path.basename(resolved), 64 * 1024);
  const registry = JSON.parse(content);
  if (registry.schemaVersion !== 1 || !Array.isArray(registry.repositories) ||
    registry.repositories.length < 1 || registry.repositories.length > 32) throw new Error('INVALID_REPOSITORY_REGISTRY');
  const ids = new Set();
  for (const entry of registry.repositories) {
    if (!entry || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(entry.id || '') || ids.has(entry.id) ||
      typeof entry.root !== 'string' || !entry.root || entry.root.length > 1024 || /[\0\r\n]/.test(entry.root)) {
      throw new Error('INVALID_REPOSITORY_REGISTRY');
    }
    ids.add(entry.id);
  }
  return registry;
}

function inspectIntegrations(options = {}) {
  const registry = loadRegistry(options.registryFile || REGISTRY);
  const workspaceRoot = path.resolve(options.workspaceRoot || ROOT);
  const gitVersion = command('/usr/bin/git', ['--version'], workspaceRoot);
  const docker = command('/usr/bin/docker', ['--version'], workspaceRoot);
  const repositories = registry.repositories.map(entry => inspectRepository(entry, workspaceRoot));
  const result = {
    system: 'SHEIKHA_REPOSITORY_INTEGRATION_V1', checkedAt: new Date().toISOString(),
    status: repositories.every(repo => repo.state === 'LOCAL_REPOSITORY_OBSERVED')
      ? 'REGISTERED_LOCAL_REPOSITORIES_INSPECTED' : 'REGISTERED_REPOSITORIES_INCOMPLETE',
    scope: 'OWNER_REGISTERED_REPOSITORIES_ONLY', registeredCount: repositories.length,
    snapshotConsistency: 'BEST_EFFORT_NOT_ATOMIC_RELEASE_ATTESTATION',
    repositories,
    tools: {
      sheikhaGit: { upstream: 'Git', clientVersion: gitVersion.ok ? gitVersion.text.trim().slice(0, 100) : null },
      sheikhaNode: { upstream: 'Node.js', currentVersion: process.version, ltsCodename: process.release.lts || null,
        productionLifecycleReviewRequired: true },
      sheikhaDocker: { upstream: 'Docker', clientVersion: docker.ok ? docker.text.trim().slice(0, 100) : null,
        daemonContacted: false, imageBuilt: false, containerStarted: false }
    },
    links: [
      ['SHEIKHA_GIT', 'SHEIKHA_VISUAL', 'SOURCE_REVISION_TO_DRAWING_COMPONENTS'],
      ['SHEIKHA_GIT', 'SHEIKHA_MODEL_HUB', 'SOURCE_REVISION_TO_MODEL_METADATA'],
      ['SHEIKHA_FOUNDRY', 'SHEIKHA_MODEL_HUB', 'TRAINING_ARTIFACT_PROVENANCE_REQUIRES_SEPARATE_VERIFICATION'],
      ['SHEIKHA_NODE', 'SHEIKHA_DOCKER', 'READ_ONLY_INSPECTOR_CONTAINER_PROFILE'],
      ['SHEIKHA_STUDIO', 'SHEIKHA_CLI', 'SHARED_LOCAL_INSPECTION_SERVICE']
    ].map(([from, to, purpose]) => ({ from, to, purpose, executableDeployment: false })),
    actions: { gitMutation: false, remoteFetchOrPush: false, externalDataSent: false,
      packageInstallation: false, serviceRestart: false, modelTraining: false },
    commercialProductionReady: false
  };
  return { ...result, evidenceSha256: digest(JSON.stringify(result)) };
}

function probeVisualRuntime() {
  // Fixed loopback endpoint only: caller input cannot select a host, file or redirect.
  return new Promise(resolve => {
    let completed = false;
    let timer;
    const finish = contractVerified => {
      if (completed) return;
      completed = true;
      clearTimeout(timer);
      resolve({ component: 'SHEIKHA_VISUAL', endpoint: 'http://127.0.0.1:8093/api/drawing/status',
        checkedAt: new Date().toISOString(), contractVerified,
        renderedOutputVerified: false, mutationExecuted: false, externalRequest: false });
    };
    const request = http.get({ hostname: '127.0.0.1', port: 8093, path: '/api/drawing/status',
      agent: false, headers: { Accept: 'application/json' } }, response => {
      if (response.statusCode !== 200 || !/^application\/json\b/.test(response.headers['content-type'] || '')) {
        response.destroy(); finish(false); return;
      }
      const chunks = []; let bytes = 0;
      response.on('data', chunk => {
        bytes += chunk.length;
        if (bytes > 32768) { response.destroy(); finish(false); } else chunks.push(chunk);
      });
      response.on('error', () => finish(false));
      response.on('aborted', () => finish(false));
      response.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          finish(body.system === 'SHEIKHA_DRAWING_MOTION_SPATIAL_FABRIC_V2'
            && body.status === 'ACTIVE_GOVERNED_DRAWING_MOTION_LAYER'
            && Array.isArray(body.supportedDimensions));
        } catch { finish(false); }
      });
    });
    request.on('error', () => finish(false));
    timer = setTimeout(() => { request.destroy(); finish(false); }, 1500);
  });
}
module.exports = { ROOT, REGISTRY, COMPONENTS, loadRegistry, inspectRepository, inspectIntegrations, worktreeCounts, probeVisualRuntime };
