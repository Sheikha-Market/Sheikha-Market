'use strict';

const fs = require('node:fs');
const path = require('node:path');

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
  'lib',
  'middleware',
  'public',
  'routes',
  'runtime',
  'sdk'
];

const RUNTIME_FILES = [
  'server.js',
  'package.json',
  'package-lock.json',
  '.env.example',
  'LICENSE'
];

function sourceFilter(source) {
  const relative = path.relative(ROOT, source);
  const segments = relative.split(path.sep);
  const name = path.basename(source);
  if (relative === 'runtime/distribution' || relative.startsWith(`runtime${path.sep}distribution${path.sep}`)) {
    return false;
  }
  if (segments.includes('audit') || segments.includes('evidence')) return false;
  if (/\.(?:log|ndjson|sqlite|sqlite3|db)$/i.test(name)) return false;
  if (/^sheikha-master-.*\.json$/i.test(name)) return false;
  return true;
}

function writeStageManifest(stageRoot, target, kind) {
  writeJson(path.join(stageRoot, 'distribution-manifest.json'), {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_UNIVERSAL_DISTRIBUTION_INSTALLER_FABRIC_V1',
    targetId: target.id,
    artifactName: target.artifactName,
    version: '1.0.51',
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
  setTreeTimestamp(root, 0);
  return { parent, root, rootName };
}

function stageRuntimeSource(context, target) {
  const rootName = `sheikha-${context.version}-linux-x86_64`;
  const parent = path.join(context.stagingRoot, target.id);
  const root = path.join(parent, rootName);
  resetGeneratedDir(parent);
  fs.mkdirSync(root, { recursive: true });

  for (const directory of RUNTIME_DIRECTORIES) {
    copyPath(path.join(ROOT, directory), path.join(root, directory), { filter: sourceFilter });
  }
  for (const file of RUNTIME_FILES) {
    copyPath(path.join(ROOT, file), path.join(root, file));
  }
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
    'Dependencies are not bundled. This artifact is not native runtime verified.',
    ''
  ].join('\n'));
  writeStageManifest(root, target, 'server-source');
  if (fs.existsSync(path.join(root, 'bin', 'sheikha'))) {
    fs.chmodSync(path.join(root, 'bin', 'sheikha'), 0o755);
  }
  setTreeTimestamp(root, 0);
  return { parent, root, rootName };
}

module.exports = {
  RUNTIME_DIRECTORIES,
  stageCli,
  stageRuntimeSource
};
