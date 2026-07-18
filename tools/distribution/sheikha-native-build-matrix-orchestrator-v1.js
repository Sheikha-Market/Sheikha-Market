'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  loadMatrix
} = require('../../core/distribution/sheikha-installer-distribution-governance-v1');
const {
  loadContract,
  loadEvidenceTemplate
} = require('../../core/distribution/sheikha-native-installer-build-execution-v1');

function parseArgs(argv) {
  const command = argv[2] || 'plan';
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

function repositoryHead(root) {
  return execFileSync(
    'git',
    ['-C', root, 'rev-parse', 'HEAD'],
    { encoding: 'utf8' }
  ).trim();
}

function groupTargets(targets) {
  const groups = new Map();

  for (const target of targets) {
    const list = groups.get(target.nativeRunner) || [];
    list.push(target);
    groups.set(target.nativeRunner, list);
  }

  return [...groups.entries()].map(([runner, items]) => ({
    runner,
    platform: items[0].platform,
    targetCount: items.length,
    targets: items.map((item) => item.id)
  }));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function plan(root, output) {
  const matrix = loadMatrix();
  const contract = loadContract();
  const head = repositoryHead(root);

  const result = {
    system: 'SHEIKHA_NATIVE_BUILD_MATRIX_EXECUTION_PLAN_V1',
    sourceCommit: head,
    targetCount: matrix.targets.length,
    runnerGroupCount: contract.runnerGroups.length,
    runnerGroups: groupTargets(matrix.targets),
    executionPolicy: {
      nativeOrApprovedCompatibleRunnerRequired: true,
      packageInstallationPerformedByOrchestrator: false,
      secretsRequiredInRepository: false,
      artifactPromotionAuthorized: false,
      humanReleaseApprovalRequired: true
    },
    platformScripts: {
      linux:
        'scripts/distribution/linux/build-sheikha-linux-installers-v1.sh',
      windows:
        'scripts/distribution/windows/build-sheikha-windows-installers-v1.ps1',
      macos:
        'scripts/distribution/macos/build-sheikha-macos-installers-v1.sh'
    }
  };

  writeJson(output, result);
  return result;
}

function prepareEvidence(root, outputDir) {
  const matrix = loadMatrix();
  const template = loadEvidenceTemplate();
  const head = repositoryHead(root);
  const outputs = [];

  fs.mkdirSync(outputDir, { recursive: true });

  for (const target of matrix.targets) {
    const evidence = structuredClone(template);
    evidence.targetId = target.id;
    evidence.sourceCommit = head;
    evidence.runner.platform = target.platform;
    evidence.runner.architecture = target.architecture;

    const output = path.join(outputDir, `${target.id}.json`);
    writeJson(output, evidence);
    outputs.push(output);
  }

  return {
    system: 'SHEIKHA_INSTALLER_EVIDENCE_TEMPLATE_PREPARATION_V1',
    sourceCommit: head,
    templateCount: outputs.length,
    outputDir,
    outputs
  };
}

function hostReadiness(root, output) {
  const packageJsonPath = path.join(root, 'package.json');
  const packageJson = fs.existsSync(packageJsonPath)
    ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    : {};
  const scripts = packageJson.scripts || {};

  const commands = [
    'git',
    'node',
    'npm',
    'tar',
    'sha256sum',
    'dpkg-deb',
    'rpmbuild',
    'snapcraft'
  ];

  const commandStatus = {};

  for (const command of commands) {
    try {
      execFileSync(
        'sh',
        ['-lc', `command -v ${command}`],
        { stdio: 'ignore' }
      );
      commandStatus[command] = true;
    } catch {
      commandStatus[command] = false;
    }
  }

  const relevantScripts = Object.keys(scripts)
    .filter((name) =>
      /(dist|build|package|installer|release).*(linux|win|mac|snap|cli)|((linux|win|mac|snap|cli).*(dist|build|package|installer|release))/i
        .test(name)
    )
    .sort();

  const result = {
    system: 'SHEIKHA_NATIVE_RUNNER_READINESS_V1',
    sourceCommit: repositoryHead(root),
    host: {
      platform: process.platform,
      architecture: process.arch,
      hostname: os.hostname()
    },
    commands: commandStatus,
    packageScriptCount: relevantScripts.length,
    packageScripts: relevantScripts,
    classification:
      relevantScripts.length > 0
        ? 'RUNNER_HAS_INSTALLER_RELATED_PACKAGE_SCRIPTS'
        : 'RUNNER_REQUIRES_PRODUCT_SPECIFIC_BUILD_SCRIPT_CONFIGURATION',
    nativeArtifactsBuilt: false
  };

  writeJson(output, result);
  return result;
}

function main() {
  const { command, args } = parseArgs(process.argv);
  const root = path.resolve(args.root || process.cwd());

  let result;

  if (command === 'plan') {
    if (!args.output) {
      throw new Error('--output is required for plan');
    }
    result = plan(root, path.resolve(args.output));
  } else if (command === 'prepare-evidence') {
    if (!args['output-dir']) {
      throw new Error('--output-dir is required for prepare-evidence');
    }
    result = prepareEvidence(root, path.resolve(args['output-dir']));
  } else if (command === 'host-readiness') {
    if (!args.output) {
      throw new Error('--output is required for host-readiness');
    }
    result = hostReadiness(root, path.resolve(args.output));
  } else {
    throw new Error(`Unsupported command: ${command}`);
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
