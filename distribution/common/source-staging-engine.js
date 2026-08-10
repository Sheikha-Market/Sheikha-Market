'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  ROOT,
  copyPath,
  resetGeneratedDir,
  setTreeTimestamp,
  writeJson
} = require('./distribution-utils');

const RUNTIME_DIRECTORIES = [
  'bin',
  'config',
  'core',
  'js',
  'knowledge',
  'lib',
  'middleware',
  'public',
  'routes',
  'runtime',
  'sdk',
  'sheikha-language'
];

const RUNTIME_FILES = [
  'server.js',
  'package.json',
  'package-lock.json',
  '.env.example',
  'LICENSE',
  'routes/pr-governance/status.routes.js',
  'routes/runtime/verification/status.routes.js',
  'runtime/distribution/v2/sheikha-universal-delivery-v2-status.js',
  'runtime/distribution/v3/sheikha-native-delivery-v3-status.js',
  'runtime/distribution/v3.1/sheikha-native-desktop-v31-status.js',
  'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json',
  'runtime/snapshots/sheikha-snapshot-engine.js',
  'tools/activation/sheikha-unified-apex-manifest-v1.json',
  'tools/foundational-closure/sheikha-activation-inventory-v1.js',
  'tools/sheikha-language-platform/sheikha-language-platform-v1.js',
  'tools/system-builder-fabric/sheikha-system-builder-platform-hierarchy-v1.js'
];

const EXCLUDED_SEGMENTS = new Set([
  '.git', '.pm2', 'artifacts', 'audit', 'backups', 'consolidation', 'coverage',
  'evidence', 'heartbeat', 'logs', 'master-activation', 'node_modules',
  'pm2-fabric', 'pr-governance', 'rag', 'snapshots', 'verification'
]);

const SECRET_PATTERNS = Object.freeze([
  ['private-key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/u],
  ['openai-key', /\bsk-[A-Za-z0-9_-]{20,}\b/u],
  ['github-token', /\bgh[opsu]_[A-Za-z0-9_]{20,}\b/u],
  ['aws-access-key', /\bAKIA[0-9A-Z]{16}\b/u],
  ['telegram-bot-token', /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/u]
]);

function sourceFilter(source) {
  const relative = path.relative(ROOT, source);
  const normalizedRelative = relative.split(path.sep).join('/');
  const segments = relative.split(path.sep);
  const name = path.basename(source);
  const explicitlyAllowed = RUNTIME_FILES.includes(normalizedRelative);
  if (!explicitlyAllowed &&
      (relative === 'runtime/distribution' || relative.startsWith(`runtime${path.sep}distribution${path.sep}`))) {
    return false;
  }
  if (!explicitlyAllowed && segments.some((segment) => EXCLUDED_SEGMENTS.has(segment))) return false;
  if (name !== '.env.example' && /^\.env(?:\.|$)/u.test(name)) return false;
  if (/\.(?:key|pem|p12|pfx|crt)$/iu.test(name)) return false;
  if (/(?:credential|private[-_]?key|secret|token)[-_]?(?:dump|snapshot|value)?\./iu.test(name)) {
    return false;
  }
  if (/(?:pm2-jlist|process(?:es)?-snapshot|environment-dump)/iu.test(name)) return false;
  if (!explicitlyAllowed && segments[0] === 'runtime' &&
      /(?:-report|report-|snapshot|dump)\.json$/iu.test(name)) {
    return false;
  }
  if (/\.(?:log|ndjson|sqlite|sqlite3|db)$/i.test(name)) return false;
  if (/^sheikha-master-.*\.json$/i.test(name)) return false;
  return true;
}

function listTrackedRuntimeFiles() {
  const scopes = [...RUNTIME_DIRECTORIES, ...RUNTIME_FILES];
  const result = spawnSync('git', ['-c', 'core.quotepath=false', 'ls-files', '-z', '--', ...scopes], {
    cwd: ROOT,
    encoding: null,
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(`git ls-files failed: ${String(result.stderr || '').trim()}`);
  }
  return Buffer.from(result.stdout || Buffer.alloc(0))
    .toString('utf8')
    .split('\0')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((relative) => sourceFilter(path.join(ROOT, relative)))
    .sort();
}

function copyTrackedFileFromHead(relative, stageRoot) {
  const result = spawnSync('git', ['show', `HEAD:${relative}`], {
    cwd: ROOT,
    encoding: null,
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(`git show HEAD:${relative} failed`);
  }
  const target = path.join(stageRoot, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, result.stdout);
  return target;
}

function scanStageForSecrets(stageRoot) {
  const findings = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      if (entry.isSymbolicLink() || fs.statSync(absolute).size > 8 * 1024 * 1024) continue;
      const content = fs.readFileSync(absolute, 'utf8');
      for (const [pattern, matcher] of SECRET_PATTERNS) {
        if (matcher.test(content)) {
          findings.push({ path: path.relative(stageRoot, absolute), pattern });
        }
      }
    }
  }
  if (fs.existsSync(stageRoot)) walk(stageRoot);
  return { passed: findings.length === 0, findings };
}

function assertStageContainsNoSecrets(stageRoot) {
  const scan = scanStageForSecrets(stageRoot);
  if (!scan.passed) {
    throw new Error(`Distribution stage secret scan failed: ${scan.findings.map((item) => `${item.path}:${item.pattern}`).join(', ')}`);
  }
  return scan;
}

function writeStageManifest(stageRoot, target, kind) {
  writeJson(path.join(stageRoot, 'distribution-manifest.json'), {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_UNIVERSAL_DISTRIBUTION_INSTALLER_FABRIC_V1',
    targetId: target.id,
    artifactName: target.artifactName,
    version: target.version || target.releaseVersion || '1.0.51',
    kind,
    sourceEntrypoints: {
      server: kind === 'server-source' ? 'server.js' : null,
      cli: 'bin/sheikha'
    },
    runtimeRequirements: {
      node: '20, 22, or 25',
      productionDependenciesBundled: false
    },
    claims: {
      desktopRuntimeIncluded: false,
      signed: false,
      notarized: false,
      nativeVerified: false
    }
  });
}

function stageCli(context, target) {
  const rootName = `sheikha-cli-${context.version}-linux-x86_64`;
  const parent = path.join(context.stagingRoot, target.id);
  const root = path.join(parent, rootName);
  resetGeneratedDir(parent);
  fs.mkdirSync(path.join(root, 'bin'), { recursive: true });
  copyPath(path.join(ROOT, 'bin', 'sheikha'), path.join(root, 'bin', 'sheikha'));
  fs.chmodSync(path.join(root, 'bin', 'sheikha'), 0o755);
  fs.writeFileSync(path.join(root, 'README.md'), [
    '# Sheikha CLI',
    '',
    'Requires Node.js 20, 22, or 25.',
    '',
    'Run: `node bin/sheikha help`',
    ''
  ].join('\n'));
  writeStageManifest(root, target, 'cli');
  assertStageContainsNoSecrets(root);
  setTreeTimestamp(root, 0);
  return { parent, root, rootName };
}

function stageRuntimeSource(context, target) {
  const rootName = `sheikha-${context.version}-linux-x86_64`;
  const parent = path.join(context.stagingRoot, target.id);
  const root = path.join(parent, rootName);
  resetGeneratedDir(parent);
  fs.mkdirSync(root, { recursive: true });

  const trackedFiles = listTrackedRuntimeFiles();
  trackedFiles.forEach((relative) => copyTrackedFileFromHead(relative, root));
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.mkdirSync(path.join(root, 'logs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'INSTALL.md'), [
    '# Sheikha Server Source Runtime',
    '',
    '1. Install Node.js 20, 22, or 25.',
    '2. Run `npm ci --omit=dev` in this directory.',
    '3. Configure environment values outside source control.',
    '4. Run `npm start`.',
    '',
    'Dependencies are not bundled. Confirm native verification in the matching release evidence.',
    ''
  ].join('\n'));
  writeStageManifest(root, target, 'server-source');
  if (fs.existsSync(path.join(root, 'bin', 'sheikha'))) {
    fs.chmodSync(path.join(root, 'bin', 'sheikha'), 0o755);
  }
  assertStageContainsNoSecrets(root);
  setTreeTimestamp(root, 0);
  return { parent, root, rootName };
}

module.exports = {
  RUNTIME_DIRECTORIES,
  RUNTIME_FILES,
  SECRET_PATTERNS,
  assertStageContainsNoSecrets,
  copyTrackedFileFromHead,
  listTrackedRuntimeFiles,
  scanStageForSecrets,
  sourceFilter,
  stageCli,
  stageRuntimeSource
};
