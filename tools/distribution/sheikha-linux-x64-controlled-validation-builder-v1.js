'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTRACT_PATH = path.join(
  ROOT,
  'runtime',
  'distribution',
  'v1',
  'sheikha-linux-x64-controlled-validation-build-contract-v1.json'
);
const EVIDENCE_TEMPLATE_PATH = path.join(
  ROOT,
  'runtime',
  'distribution',
  'v1',
  'sheikha-linux-x64-validation-artifact-evidence-v1.json'
);

function parseArgs(argv) {
  const command = argv[2] || 'status';
  const args = {};

  for (let index = 3; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];

    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument near: ${key || '<empty>'}`);
    }

    args[key.slice(2)] = value;
  }

  return { command, args };
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sourceCommit() {
  return execFileSync(
    'git',
    ['-C', ROOT, 'rev-parse', 'HEAD'],
    { encoding: 'utf8' }
  ).trim();
}

function sourceIsClean() {
  return execFileSync(
    'git',
    ['-C', ROOT, 'status', '--porcelain=v1', '-uall'],
    { encoding: 'utf8' }
  ).trim() === '';
}

function commandAvailable(command) {
  return spawnSync(
    'sh',
    ['-lc', `command -v ${command}`],
    { stdio: 'ignore' }
  ).status === 0;
}

function expandHome(value) {
  if (value === '$HOME') {
    return os.homedir();
  }

  if (value.startsWith('$HOME/')) {
    return path.join(os.homedir(), value.slice(6));
  }

  return value;
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== '' &&
    !relative.startsWith('..') &&
    !path.isAbsolute(relative);
}

function targetContext(product, architecture) {
  const contract = loadJson(CONTRACT_PATH);

  if (process.platform !== 'linux' || process.arch !== 'x64') {
    throw new Error(
      `NATIVE_PLATFORM_MISMATCH platform=${process.platform} arch=${process.arch}`
    );
  }

  if (architecture !== 'x64') {
    throw new Error(`UNSUPPORTED_ARCHITECTURE=${architecture}`);
  }

  const target = contract.targets.find(
    (item) => item.product === product
  );

  if (!target) {
    throw new Error(`UNSUPPORTED_PRODUCT=${product}`);
  }

  const commandStatus = Object.fromEntries(
    target.requiredCommands.map((command) => [
      command,
      commandAvailable(command)
    ])
  );

  return {
    contract,
    target,
    commandStatus,
    requiredCommandsAvailable:
      Object.values(commandStatus).every(Boolean)
  };
}

function validateOutputDirectory(rawOutput, contract) {
  if (!rawOutput) {
    throw new Error('EXPLICIT_OUTPUT_DIRECTORY_REQUIRED');
  }

  const output = path.resolve(expandHome(rawOutput));
  const allowedRoot = path.resolve(
    expandHome(contract.allowedOutputRoot)
  );

  if (isWithin(ROOT, output) || output === ROOT) {
    throw new Error('OUTPUT_DIRECTORY_INSIDE_REPOSITORY_REJECTED');
  }

  if (!isWithin(allowedRoot, output)) {
    throw new Error(
      `OUTPUT_DIRECTORY_OUTSIDE_ALLOWED_ROOT allowedRoot=${allowedRoot}`
    );
  }

  return { output, allowedRoot };
}

function status(product, architecture, rawOutput) {
  const context = targetContext(product, architecture);

  let outputStatus = {
    explicit: Boolean(rawOutput),
    valid: false,
    output: '',
    allowedRoot: '',
    reason: ''
  };

  try {
    const checked = validateOutputDirectory(
      rawOutput,
      context.contract
    );

    outputStatus = {
      explicit: true,
      valid: true,
      output: checked.output,
      allowedRoot: checked.allowedRoot,
      reason: ''
    };
  } catch (error) {
    outputStatus.reason = error.message;
  }

  const clean = sourceIsClean();

  return {
    system: 'SHEIKHA_LINUX_X64_CONTROLLED_VALIDATION_BUILD_STATUS_V1',
    sourceCommit: sourceCommit(),
    targetId: context.target.id,
    product,
    architecture,
    commandStatus: context.commandStatus,
    requiredCommandsAvailable:
      context.requiredCommandsAvailable,
    cleanSourceWorktree: clean,
    outputDirectory: outputStatus,
    readyForControlledValidationBuild:
      context.requiredCommandsAvailable &&
      clean &&
      outputStatus.valid,
    mode: 'NON_RELEASE_VALIDATION_ONLY',
    networkAccessRequired: false,
    packageInstallationAllowed: false,
    serviceControlAllowed: false,
    remoteMutationAllowed: false,
    productionPromotionAuthorized: false
  };
}

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    env: options.env || process.env,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe'
  });

  if (result.status !== 0) {
    const text = `${result.stdout || ''}${result.stderr || ''}`;
    throw new Error(
      `COMMAND_FAILED command=${command} rc=${result.status}\n${text}`
    );
  }

  return {
    command: [command, ...args],
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function packageName() {
  const packageJson = loadJson(path.join(ROOT, 'package.json'));
  const rawName = packageJson.name || 'sheikha';
  const rawVersion = packageJson.version || '0.0.0';

  return {
    name: rawName
      .toLowerCase()
      .replace(/[^a-z0-9.+-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'sheikha',
    version: rawVersion
      .replace(/[^0-9A-Za-z.+:~_-]+/g, '-') || '0.0.0'
  };
}

function buildTarGz(output, identity, commands) {
  const artifact = path.join(
    output,
    `${identity.name}-${identity.version}-linux-x64-validation.tar.gz`
  );

  commands.push(run(
    'git',
    [
      '-C',
      ROOT,
      'archive',
      '--format=tar.gz',
      `--prefix=${identity.name}-${identity.version}/`,
      `--output=${artifact}`,
      'HEAD'
    ]
  ));

  return artifact;
}

function buildCli(output, identity, commands) {
  const stage = path.join(output, 'cli-stage');
  fs.mkdirSync(stage, { recursive: true });

  const sourceTar = path.join(output, 'cli-source.tar');
  commands.push(run(
    'git',
    [
      '-C',
      ROOT,
      'archive',
      '--format=tar',
      `--output=${sourceTar}`,
      'HEAD'
    ]
  ));

  commands.push(run(
    'tar',
    ['-xf', sourceTar, '-C', stage]
  ));

  const launcherDir = path.join(stage, 'bin');
  fs.mkdirSync(launcherDir, { recursive: true });

  const launcher = path.join(launcherDir, 'sheikha');
  fs.writeFileSync(
    launcher,
    [
      '#!/usr/bin/env bash',
      'set -Eeuo pipefail',
      'ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"',
      'exec node "$ROOT/scripts/sheikha-cli.js" "$@"',
      ''
    ].join('\n'),
    { mode: 0o755 }
  );

  const artifact = path.join(
    output,
    `${identity.name}-cli-${identity.version}-linux-x64-validation.tar.gz`
  );

  commands.push(run(
    'tar',
    ['-czf', artifact, '-C', stage, '.']
  ));

  return artifact;
}

function buildDeb(output, identity, commands) {
  const packageRoot = path.join(output, 'deb-root');
  const controlDir = path.join(packageRoot, 'DEBIAN');
  const appDir = path.join(
    packageRoot,
    'opt',
    'sheikha',
    'current'
  );
  const binDir = path.join(
    packageRoot,
    'usr',
    'local',
    'bin'
  );

  fs.mkdirSync(controlDir, { recursive: true });
  fs.mkdirSync(appDir, { recursive: true });
  fs.mkdirSync(binDir, { recursive: true });

  const sourceTar = path.join(output, 'deb-source.tar');
  commands.push(run(
    'git',
    [
      '-C',
      ROOT,
      'archive',
      '--format=tar',
      `--output=${sourceTar}`,
      'HEAD'
    ]
  ));

  commands.push(run(
    'tar',
    ['-xf', sourceTar, '-C', appDir]
  ));

  fs.writeFileSync(
    path.join(controlDir, 'control'),
    [
      `Package: ${identity.name}`,
      `Version: ${identity.version}`,
      'Section: utils',
      'Priority: optional',
      'Architecture: amd64',
      'Maintainer: Salman Ahmed Salman Al-Rajeh',
      'Description: Sheikha Linux x64 non-release validation package',
      ''
    ].join('\n')
  );

  const launcher = path.join(binDir, 'sheikha');
  fs.writeFileSync(
    launcher,
    [
      '#!/usr/bin/env bash',
      'set -Eeuo pipefail',
      'exec node /opt/sheikha/current/scripts/sheikha-cli.js "$@"',
      ''
    ].join('\n'),
    { mode: 0o755 }
  );

  const artifact = path.join(
    output,
    `${identity.name}_${identity.version}_amd64_validation.deb`
  );

  commands.push(run(
    'dpkg-deb',
    ['--build', '--root-owner-group', packageRoot, artifact]
  ));

  return artifact;
}

function build(product, architecture, rawOutput) {
  const current = status(product, architecture, rawOutput);

  if (!current.readyForControlledValidationBuild) {
    throw new Error(
      `CONTROLLED_VALIDATION_BUILD_NOT_READY ${JSON.stringify(current)}`
    );
  }

  const output = current.outputDirectory.output;

  if (fs.existsSync(output)) {
    const entries = fs.readdirSync(output);
    if (entries.length > 0) {
      throw new Error('OUTPUT_DIRECTORY_MUST_BE_EMPTY');
    }
  } else {
    fs.mkdirSync(output, { recursive: true });
  }

  const evidence = loadJson(EVIDENCE_TEMPLATE_PATH);
  const identity = packageName();
  const commands = [];
  const startedAt = new Date().toISOString();

  let artifact;

  if (product === 'deb') {
    artifact = buildDeb(output, identity, commands);
  } else if (product === 'tar-gz') {
    artifact = buildTarGz(output, identity, commands);
  } else if (product === 'cli') {
    artifact = buildCli(output, identity, commands);
  } else {
    throw new Error(`UNSUPPORTED_PRODUCT=${product}`);
  }

  if (!fs.existsSync(artifact) || !fs.statSync(artifact).isFile()) {
    throw new Error('VALIDATION_ARTIFACT_NOT_CREATED');
  }

  const fileResult = run('file', ['-b', artifact]);

  evidence.sourceCommit = current.sourceCommit;
  evidence.targetId = current.targetId;
  evidence.product = product;
  evidence.artifact = {
    path: artifact,
    fileName: path.basename(artifact),
    sizeBytes: fs.statSync(artifact).size,
    sha256: sha256(artifact),
    fileDescription: fileResult.stdout.trim()
  };
  evidence.build = {
    startedAt,
    completedAt: new Date().toISOString(),
    commands: commands.map((item) => item.command),
    networkAccessUsed: false,
    packageInstallationPerformed: false,
    serviceControlPerformed: false,
    remoteMutationPerformed: false
  };
  evidence.gates.SOURCE_COMMIT_BOUND = true;
  evidence.gates.CLEAN_SOURCE_WORKTREE_VERIFIED = true;
  evidence.gates.CONTROLLED_OUTPUT_DIRECTORY_VERIFIED = true;
  evidence.gates.VALIDATION_ARTIFACT_CREATED = true;
  evidence.gates.SHA256_RECORDED = true;
  evidence.gates.ARTIFACT_TYPE_INSPECTED = true;

  const evidencePath = path.join(
    output,
    `${current.targetId}.evidence.json`
  );

  fs.writeFileSync(
    evidencePath,
    `${JSON.stringify(evidence, null, 2)}\n`
  );

  process.stdout.write(`${JSON.stringify({
    system: 'SHEIKHA_LINUX_X64_CONTROLLED_VALIDATION_BUILD_RESULT_V1',
    sourceCommit: current.sourceCommit,
    targetId: current.targetId,
    product,
    architecture,
    artifact,
    evidencePath,
    artifactSha256: evidence.artifact.sha256,
    releaseArtifactClaimed: false,
    productionPromotionAuthorized: false
  }, null, 2)}\n`);
}

function verifyFoundation() {
  const contract = loadJson(CONTRACT_PATH);
  const evidence = loadJson(EVIDENCE_TEMPLATE_PATH);
  const rules = contract.executionRules || {};

  const checks = {
    system:
      contract.system ===
      'SHEIKHA_LINUX_X64_CONTROLLED_VALIDATION_BUILD_CONTRACT_V1',
    targetCount:
      Array.isArray(contract.targets) &&
      contract.targets.length === 3,
    uniqueProducts:
      new Set(contract.targets.map((item) => item.product)).size === 3,
    mode:
      contract.mode === 'NON_RELEASE_VALIDATION_ONLY',
    cleanSourceRequired:
      rules.cleanSourceWorktreeRequired === true,
    explicitOutputRequired:
      rules.explicitOutputDirectoryRequired === true,
    outsideRepositoryRequired:
      rules.outputMustBeOutsideRepository === true,
    allowedRootRequired:
      rules.outputMustBeUnderAllowedRoot === true,
    noNetworkRequired:
      rules.networkAccessRequired === false,
    noPackageInstall:
      rules.packageInstallationAllowed === false,
    noServiceControl:
      rules.serviceControlAllowed === false,
    noRemoteMutation:
      rules.remoteMutationAllowed === false,
    noProduction:
      rules.productionDeploymentAllowed === false &&
      rules.artifactPromotionAllowed === false,
    evidenceClosed:
      evidence.releaseArtifactClaimed === false &&
      evidence.productionPromotionAuthorized === false &&
      Object.values(evidence.gates).every((value) => value === false)
  };

  return {
    system:
      'SHEIKHA_LINUX_X64_CONTROLLED_VALIDATION_BUILD_FOUNDATION_VERIFICATION_V1',
    verified: Object.values(checks).every(Boolean),
    checks
  };
}

function main() {
  const { command, args } = parseArgs(process.argv);

  if (command === 'verify') {
    const result = verifyFoundation();
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.verified ? 0 : 1;
    return;
  }

  const product = args.product;
  const architecture = args.arch || args.architecture || 'x64';
  const output = args['output-dir'] || process.env.SHEIKHA_OUTPUT_DIR || '';

  if (!product) {
    throw new Error('--product is required');
  }

  if (command === 'status') {
    process.stdout.write(
      `${JSON.stringify(status(product, architecture, output), null, 2)}\n`
    );
    return;
  }

  if (command === 'build') {
    build(product, architecture, output);
    return;
  }

  throw new Error(`Unsupported command: ${command}`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
