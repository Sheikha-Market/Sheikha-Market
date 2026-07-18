'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  loadMatrix,
  loadEvidenceContract,
  evaluateEvidence
} = require('../../core/distribution/sheikha-installer-distribution-governance-v1');

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument near: ${key || '<empty>'}`);
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function listRepositoryFiles(root) {
  const raw = execFileSync(
    'git',
    ['-C', root, 'ls-files', '-co', '--exclude-standard', '-z'],
    { encoding: 'buffer', maxBuffer: 128 * 1024 * 1024 }
  );

  return raw
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter((item) => !item.split('/').some((part) =>
      ['node_modules', '.git', '.venv', 'venv', 'coverage', '.cache']
        .includes(part)
    ));
}

function lower(value) {
  return String(value || '').toLowerCase();
}

function artifactNameMatches(target, relativePath) {
  const name = lower(relativePath);
  const architecturePatterns = {
    x64: ['x64', 'amd64', 'x86_64'],
    arm32: ['arm32', 'armhf', 'armv7'],
    arm64: ['arm64', 'aarch64'],
    universal: ['universal', 'universal2'],
    multi: ['snap', 'multi']
  };

  const productPatterns = {
    'user-installer': ['user', 'setup', 'installer'],
    'system-installer': ['system', 'machine', 'msi', 'setup'],
    zip: ['zip'],
    cli: ['cli', 'command'],
    deb: ['deb'],
    rpm: ['rpm'],
    'tar-gz': ['tar.gz', 'tgz'],
    snap: ['snap'],
    dmg: ['dmg']
  };

  const extensionMatch = target.artifactExtensions.some((extension) =>
    name.endsWith(extension)
  );
  const architectureMatch = (
    architecturePatterns[target.architecture] || []
  ).some((pattern) => name.includes(pattern));
  const productMatch = (
    productPatterns[target.product] || []
  ).some((pattern) => name.includes(pattern));

  return extensionMatch && architectureMatch && productMatch;
}

function isArtifactArea(relativePath) {
  const parts = lower(relativePath).split('/');
  return parts.some((part) =>
    ['dist', 'release', 'releases', 'artifacts', 'out', 'output', 'build', 'packages']
      .includes(part)
  );
}

function readConfigurationCorpus(root, files) {
  const patterns = [
    'package.json',
    'electron-builder',
    'electron-forge',
    'snapcraft',
    'workflow',
    'release',
    'packaging',
    'installer',
    'distribution',
    'wix',
    'nsis',
    'nfpm',
    'fpm'
  ];

  const corpus = [];

  for (const relativePath of files) {
    const lowerPath = lower(relativePath);
    if (!patterns.some((pattern) => lowerPath.includes(pattern))) {
      continue;
    }

    const absolutePath = path.join(root, relativePath);
    try {
      const stat = fs.statSync(absolutePath);
      if (!stat.isFile() || stat.size > 2_000_000) {
        continue;
      }
      corpus.push({
        path: relativePath,
        text: lower(fs.readFileSync(absolutePath, 'utf8'))
      });
    } catch {
      // A transient or unreadable file is omitted from evidence.
    }
  }

  return corpus;
}

function configurationMatches(target, record) {
  const combined = `${lower(record.path)}\n${record.text}`;

  const platformPatterns = {
    windows: ['windows', 'win32', 'nsis', 'wix', 'msi'],
    linux: ['linux', 'deb', 'rpm', 'snap', 'appimage'],
    macos: ['macos', 'darwin', 'dmg', 'notar']
  };

  const architecturePatterns = {
    x64: ['x64', 'amd64', 'x86_64'],
    arm32: ['arm32', 'armhf', 'armv7'],
    arm64: ['arm64', 'aarch64'],
    universal: ['universal', 'universal2'],
    multi: ['snap', 'multi']
  };

  const productPatterns = {
    'user-installer': ['user installer', 'nsis', 'peruser'],
    'system-installer': ['system installer', 'permachine', 'wix', 'msi'],
    zip: ['zip'],
    cli: ['cli', 'command-line', '"bin"', 'commander', 'yargs'],
    deb: ['deb', 'debian'],
    rpm: ['rpm', 'fedora', 'rhel'],
    'tar-gz': ['tar.gz', 'tgz'],
    snap: ['snapcraft', 'snap store', 'snap'],
    dmg: ['dmg']
  };

  const has = (patterns) => patterns.some((pattern) =>
    combined.includes(pattern)
  );

  return (
    has(platformPatterns[target.platform] || []) &&
    has(architecturePatterns[target.architecture] || []) &&
    has(productPatterns[target.product] || [])
  );
}

function loadEvidenceBundle(root, targetId) {
  const evidencePath = path.join(
    root,
    'evidence',
    'installers',
    `${targetId}.json`
  );

  if (!fs.existsSync(evidencePath)) {
    return {
      exists: false,
      path: path.relative(root, evidencePath),
      bundle: null
    };
  }

  try {
    return {
      exists: true,
      path: path.relative(root, evidencePath),
      bundle: JSON.parse(fs.readFileSync(evidencePath, 'utf8'))
    };
  } catch (error) {
    return {
      exists: true,
      path: path.relative(root, evidencePath),
      bundle: null,
      error: error.message
    };
  }
}

function main() {
  const args = parseArgs(process.argv);
  const scanRoot = path.resolve(args['scan-root'] || process.cwd());
  const output = path.resolve(args.output || 'installer-evidence-audit.json');

  const matrix = loadMatrix();
  const evidenceContract = loadEvidenceContract();
  const files = listRepositoryFiles(scanRoot);
  const artifactFiles = files.filter(isArtifactArea);
  const configurationCorpus = readConfigurationCorpus(scanRoot, files);

  const targets = matrix.targets.map((target) => {
    const artifacts = artifactFiles.filter((relativePath) =>
      artifactNameMatches(target, relativePath)
    );
    const configurations = configurationCorpus
      .filter((record) => configurationMatches(target, record))
      .map((record) => record.path);

    const evidence = loadEvidenceBundle(scanRoot, target.id);
    const evaluation = evaluateEvidence(
      target,
      evidence.bundle,
      evidenceContract
    );

    let status = 'GAP_CONFIRMED';

    if (evaluation.fullyEvidenced) {
      status = 'FULLY_EVIDENCED';
    } else if (artifacts.length > 0) {
      status = 'ARTIFACT_PRESENT_EVIDENCE_INCOMPLETE';
    } else if (configurations.length > 0) {
      status = 'BUILD_CONFIGURATION_PRESENT';
    }

    return {
      ...target,
      status,
      artifactEvidence: artifacts.slice(0, 20),
      configurationEvidence: [...new Set(configurations)].slice(0, 20),
      evidenceBundle: {
        exists: evidence.exists,
        path: evidence.path,
        parseError: evidence.error || null
      },
      gateEvaluation: evaluation
    };
  });

  const statusCounts = targets.reduce((counts, target) => {
    counts[target.status] = (counts[target.status] || 0) + 1;
    return counts;
  }, {});

  const result = {
    system: 'SHEIKHA_INSTALLER_LOCAL_EVIDENCE_AUDIT_V1',
    scanRoot,
    repositoryHead: execFileSync(
      'git',
      ['-C', scanRoot, 'rev-parse', 'HEAD'],
      { encoding: 'utf8' }
    ).trim(),
    targetCount: targets.length,
    statusCounts,
    fullyEvidenced:
      statusCounts.FULLY_EVIDENCED === targets.length,
    nativePlatformBuildsExecutedByThisAudit: false,
    installationTestsExecutedByThisAudit: false,
    storePublicationVerifiedByThisAudit: false,
    targets
  };

  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
