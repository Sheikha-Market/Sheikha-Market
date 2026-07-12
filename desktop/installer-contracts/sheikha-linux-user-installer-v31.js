#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  createCapabilityBridge
} = require('../bridge/sheikha-desktop-capability-bridge-v1');
const {
  createDesktopProductCore
} = require('../core/sheikha-desktop-product-core-v1');

const VERSION = '1.0.51';
const RELEASE_LINE = 'v3.1';
const PRODUCT = 'sheikha-native-desktop';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  const descriptor = fs.openSync(temporaryPath, 'wx', 0o600);
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
  fs.renameSync(temporaryPath, filePath);
}

function appendAudit(filePath, evidence) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(evidence)}\n`, { encoding: 'utf8', mode: 0o600 });
}

function resolveLayout(homeDir = os.homedir()) {
  const productRoot = path.join(homeDir, '.local', 'opt', PRODUCT);
  return {
    homeDir,
    productRoot,
    installRoot: path.join(productRoot, VERSION),
    launcherPath: path.join(homeDir, '.local', 'bin', PRODUCT),
    desktopEntryPath: path.join(homeDir, '.local', 'share', 'applications', `${PRODUCT}.desktop`),
    iconPath: path.join(
      homeDir,
      '.local',
      'share',
      'icons',
      'hicolor',
      'scalable',
      'apps',
      'sheikha.svg'
    ),
    stateRoot: path.join(homeDir, '.local', 'state', 'sheikha', 'native-desktop')
  };
}

function defaultReleaseRoot(homeDir = os.homedir()) {
  return path.join(
    homeDir,
    'Sheikha-Local-Registry',
    'releases',
    RELEASE_LINE,
    VERSION
  );
}

function assertWithin(candidate, root, label) {
  const resolved = fs.realpathSync(candidate);
  const resolvedRoot = fs.realpathSync(root);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`${label} escaped its governed root.`);
  }
  return resolved;
}

function releaseArtifacts(releaseRoot) {
  const index = readJson(path.join(releaseRoot, 'release-index.json'));
  if (index.system !== 'SHEIKHA_LOCAL_RELEASE_INDEX_V31' ||
      index.releaseLine !== RELEASE_LINE || index.version !== VERSION ||
      index.localRegistryOnly !== true || index.githubRequired !== false) {
    throw new Error('Native desktop release index policy is invalid.');
  }
  const archive = index.artifacts.find((item) => item.artifactKind === 'USER_PORTABLE_TAR_GZ');
  const elf = index.artifacts.find((item) => item.artifactKind === 'ELF_NATIVE_EXECUTABLE');
  if (!archive || !elf || archive.nativeVerified !== true || elf.nativeVerified !== true) {
    throw new Error('Native verified archive and ELF artifacts are required.');
  }
  const archivePath = assertWithin(path.join(releaseRoot, archive.relativePath), releaseRoot, 'Archive');
  if (!fs.existsSync(archivePath) || sha256File(archivePath) !== archive.sha256) {
    throw new Error('Native desktop archive checksum verification failed.');
  }
  return { index, archive, elf, archivePath };
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 30000 });
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout || result.error?.message}`);
  }
  return String(result.stdout || '').trim();
}

function installationStatus(options = {}) {
  const layout = resolveLayout(options.homeDir);
  const binaryPath = path.join(layout.installRoot, 'bin', PRODUCT);
  const launcherStat = fs.lstatSync(layout.launcherPath, { throwIfNoEntry: false });
  const launcherTarget = launcherStat?.isSymbolicLink()
    ? fs.realpathSync(layout.launcherPath)
    : null;
  return {
    installed: fs.existsSync(binaryPath),
    version: VERSION,
    installRoot: layout.installRoot,
    binarySha256: fs.existsSync(binaryPath) ? sha256File(binaryPath) : null,
    launcherPresent: Boolean(launcherTarget),
    launcherTarget,
    desktopEntryPresent: fs.existsSync(layout.desktopEntryPath),
    iconPresent: fs.existsSync(layout.iconPath)
  };
}

function installUserLocal({ homeDir, releaseRoot }) {
  const layout = resolveLayout(homeDir);
  const governedReleaseRoot = assertWithin(
    releaseRoot,
    path.join(layout.homeDir, 'Sheikha-Local-Registry', 'releases', RELEASE_LINE),
    'Release root'
  );
  const { archive, elf, archivePath } = releaseArtifacts(governedReleaseRoot);
  for (const target of [layout.installRoot, layout.launcherPath, layout.desktopEntryPath, layout.iconPath]) {
    if (fs.existsSync(target) || fs.lstatSync(target, { throwIfNoEntry: false })) {
      throw new Error(`Refusing to overwrite existing installation path: ${target}`);
    }
  }

  fs.mkdirSync(layout.productRoot, { recursive: true });
  const stagingRoot = path.join(layout.productRoot, `.staging-${VERSION}-${process.pid}`);
  fs.mkdirSync(stagingRoot, { recursive: false, mode: 0o700 });
  let installRootCreated = false;
  let launcherCreated = false;
  let desktopEntryCreated = false;
  let iconCreated = false;
  try {
    const packageName = `sheikha-native-desktop-${VERSION}-linux-x86_64`;
    const archiveEntries = run('tar', ['-tzf', archivePath]).split('\n').filter(Boolean);
    if (!archiveEntries.length || !archiveEntries.every((entry) =>
      entry === `${packageName}/` || entry.startsWith(`${packageName}/`)
    )) {
      throw new Error('Native desktop archive contains an unsafe path.');
    }
    const archiveListing = run('tar', ['-tvzf', archivePath]).split('\n').filter(Boolean);
    if (!archiveListing.length || archiveListing.some((entry) => !['-', 'd'].includes(entry[0]))) {
      throw new Error('Native desktop archive contains a link or unsupported entry type.');
    }
    run('tar', ['-xzf', archivePath, '-C', stagingRoot]);
    const packageRoot = path.join(stagingRoot, packageName);
    const stagedBinary = path.join(packageRoot, 'bin', PRODUCT);
    if (!fs.existsSync(stagedBinary) || sha256File(stagedBinary) !== elf.sha256) {
      throw new Error('Installed ELF checksum does not match the release index.');
    }
    fs.renameSync(packageRoot, layout.installRoot);
    installRootCreated = true;
    fs.rmSync(stagingRoot, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(layout.launcherPath), { recursive: true });
    fs.symlinkSync(path.join(layout.installRoot, 'bin', PRODUCT), layout.launcherPath);
    launcherCreated = true;
    fs.mkdirSync(path.dirname(layout.desktopEntryPath), { recursive: true });
    const desktopEntry = fs.readFileSync(
      path.join(layout.installRoot, 'share', 'applications', `${PRODUCT}.desktop`),
      'utf8'
    ).replace(`Exec=${PRODUCT}`, `Exec=${layout.launcherPath}`);
    fs.writeFileSync(layout.desktopEntryPath, desktopEntry, { encoding: 'utf8', mode: 0o644 });
    desktopEntryCreated = true;
    fs.mkdirSync(path.dirname(layout.iconPath), { recursive: true });
    fs.copyFileSync(
      path.join(
        layout.installRoot,
        'share',
        'icons',
        'hicolor',
        'scalable',
        'apps',
        'sheikha.svg'
      ),
      layout.iconPath
    );
    iconCreated = true;
    const probe = run(layout.launcherPath, ['--probe']);
    const output = {
      status: 'INSTALLED',
      scope: 'current-user',
      version: VERSION,
      releaseIndexSha256: sha256File(path.join(governedReleaseRoot, 'release-index.json')),
      archiveSha256: archive.sha256,
      binarySha256: elf.sha256,
      probePassed: probe.includes('SHEIKHA_NATIVE_DESKTOP_PROBE_OK'),
      installRoot: layout.installRoot,
      launcherPath: layout.launcherPath,
      desktopEntryPath: layout.desktopEntryPath,
      iconPath: layout.iconPath,
      administratorUsed: false,
      githubRequired: false,
      externalPublishing: false
    };
    writeJsonAtomic(path.join(layout.stateRoot, 'installation-state-v31.json'), output);
    return output;
  } catch (error) {
    if (iconCreated && fs.existsSync(layout.iconPath)) fs.unlinkSync(layout.iconPath);
    if (desktopEntryCreated && fs.existsSync(layout.desktopEntryPath)) fs.unlinkSync(layout.desktopEntryPath);
    if (launcherCreated && fs.lstatSync(layout.launcherPath, { throwIfNoEntry: false })) {
      fs.unlinkSync(layout.launcherPath);
    }
    if (installRootCreated && fs.existsSync(layout.installRoot)) {
      fs.rmSync(layout.installRoot, { recursive: true, force: true });
    }
    if (fs.existsSync(stagingRoot)) fs.rmSync(stagingRoot, { recursive: true, force: true });
    throw error;
  }
}

function uninstallUserLocal({ homeDir }) {
  const layout = resolveLayout(homeDir);
  const status = installationStatus({ homeDir });
  if (!status.installed) throw new Error('Native desktop is not installed.');
  if (!status.launcherPresent || status.launcherTarget !== path.join(layout.installRoot, 'bin', PRODUCT)) {
    throw new Error('Launcher ownership verification failed.');
  }
  fs.unlinkSync(layout.launcherPath);
  if (fs.existsSync(layout.desktopEntryPath)) fs.unlinkSync(layout.desktopEntryPath);
  if (fs.existsSync(layout.iconPath)) fs.unlinkSync(layout.iconPath);
  fs.rmSync(layout.installRoot, { recursive: true, force: true });
  return {
    status: 'UNINSTALLED',
    scope: 'current-user',
    version: VERSION,
    productFilesRemoved: true,
    userDataDeleted: false,
    administratorUsed: false
  };
}

function createInstallerAdapters(options) {
  return {
    'installer.user.install': {
      id: 'SHEIKHA_LINUX_USER_INSTALL_ADAPTER_V31',
      execute: async () => installUserLocal(options)
    },
    'installer.user.uninstall': {
      id: 'SHEIKHA_LINUX_USER_UNINSTALL_ADAPTER_V31',
      execute: async () => uninstallUserLocal(options)
    }
  };
}

async function executeGoverned(action, options = {}) {
  const capability = action === 'install' ? 'installer.user.install' : 'installer.user.uninstall';
  const layout = resolveLayout(options.homeDir);
  const auditPath = path.join(layout.stateRoot, 'audit-v31.jsonl');
  const bridge = createCapabilityBridge({
    adapters: createInstallerAdapters({
      homeDir: layout.homeDir,
      releaseRoot: options.releaseRoot || defaultReleaseRoot(layout.homeDir)
    }),
    auditSink: async (evidence) => appendAudit(auditPath, evidence)
  });
  const core = createDesktopProductCore({ bridge });
  const result = await core.dispatch({
    requestId: options.requestId || crypto.randomUUID(),
    capability,
    actor: { id: options.actorId || os.userInfo().username, type: 'human' },
    payload: { installationScope: 'current-user' },
    humanApproval: {
      approved: true,
      approvedBy: options.actorId || os.userInfo().username,
      approvalId: options.approvalId
    }
  }, { grantedCapabilities: [capability] });
  if (!result.ok) throw new Error(`Governed ${action} failed: ${result.decision.reason}`);
  return { ...result.output, auditEvidenceSha256: result.evidence.evidenceSha256, auditPath };
}

function parseArguments(argv) {
  const action = argv[2] || 'status';
  const options = {};
  for (let index = 3; index < argv.length; index += 1) {
    if (argv[index] === '--approval-id' && argv[index + 1]) options.approvalId = argv[++index];
    else if (argv[index] === '--actor-id' && argv[index + 1]) options.actorId = argv[++index];
    else if (argv[index] === '--release-root' && argv[index + 1]) options.releaseRoot = argv[++index];
    else throw new Error(`Unknown installer argument: ${argv[index]}`);
  }
  return { action, options };
}

if (require.main === module) {
  (async () => {
    try {
      const { action, options } = parseArguments(process.argv);
      if (action === 'status') {
        console.log(JSON.stringify(installationStatus(), null, 2));
        return;
      }
      if (!['install', 'uninstall'].includes(action)) throw new Error(`Unknown installer action: ${action}`);
      if (!String(options.approvalId || '').trim()) throw new Error('Human approval ID is required.');
      console.log(JSON.stringify(await executeGoverned(action, options), null, 2));
    } catch (error) {
      console.error(JSON.stringify({ status: 'FAILED', error: error.message }, null, 2));
      process.exitCode = 1;
    }
  })();
}

module.exports = {
  VERSION,
  defaultReleaseRoot,
  executeGoverned,
  installUserLocal,
  installationStatus,
  resolveLayout,
  uninstallUserLocal
};
