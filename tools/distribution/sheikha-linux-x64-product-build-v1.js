'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTRACT_PATH = path.join(
  ROOT,
  'runtime',
  'distribution',
  'v1',
  'sheikha-linux-x64-product-build-contract-v1.json'
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

function commandAvailable(command) {
  const result = spawnSync(
    'sh',
    ['-lc', `command -v ${command}`],
    { stdio: 'ignore' }
  );

  return result.status === 0;
}

function loadContext(product, architecture) {
  const contract = loadJson(CONTRACT_PATH);
  const packageJson = loadJson(path.join(ROOT, 'package.json'));

  const target = contract.targets.find(
    (item) =>
      item.product === product &&
      contract.architecture === architecture
  );

  if (!target) {
    throw new Error(
      `Unsupported Linux target: product=${product} architecture=${architecture}`
    );
  }

  const packageScripts = packageJson.scripts || {};
  const exactScriptConfigured =
    typeof packageScripts[target.packageScript] === 'string';
  const delegateConfigured =
    typeof packageScripts[target.delegateScript] === 'string';

  const commandStatus = Object.fromEntries(
    target.requiredCommands.map((command) => [
      command,
      commandAvailable(command)
    ])
  );

  const requiredCommandsAvailable =
    Object.values(commandStatus).every(Boolean);

  return {
    contract,
    packageJson,
    target,
    packageScripts,
    exactScriptConfigured,
    delegateConfigured,
    commandStatus,
    requiredCommandsAvailable
  };
}

function status(product, architecture) {
  const context = loadContext(product, architecture);

  const interfaceReady =
    context.exactScriptConfigured &&
    context.delegateConfigured;

  const result = {
    system: 'SHEIKHA_LINUX_X64_PRODUCT_BUILD_STATUS_V1',
    targetId: context.target.id,
    product,
    architecture,
    packageScript: context.target.packageScript,
    delegateScript: context.target.delegateScript,
    exactScriptConfigured: context.exactScriptConfigured,
    delegateConfigured: context.delegateConfigured,
    commandStatus: context.commandStatus,
    requiredCommandsAvailable:
      context.requiredCommandsAvailable,
    interfaceReady,
    readyForControlledBuildAttempt:
      interfaceReady &&
      context.requiredCommandsAvailable,
    delegateExecutionValidationRequired:
      context.target.delegateExecutionValidationRequired,
    artifactBuilt: false,
    nativeInstallTestExecuted: false,
    humanReleaseApproval: false
  };

  return result;
}

function build(product, architecture, outputDir) {
  const context = loadContext(product, architecture);
  const currentStatus = status(product, architecture);

  if (!currentStatus.interfaceReady) {
    throw new Error(
      `PACKAGE_SCRIPT_INTERFACE_NOT_READY target=${context.target.id}`
    );
  }

  if (!currentStatus.requiredCommandsAvailable) {
    const missing = Object.entries(currentStatus.commandStatus)
      .filter(([, available]) => !available)
      .map(([command]) => command);

    throw new Error(
      `REQUIRED_COMMANDS_MISSING target=${context.target.id} commands=${missing.join(',')}`
    );
  }

  const resolvedOutput = path.resolve(
    outputDir ||
    path.join(
      ROOT,
      'dist',
      'native-build',
      'linux',
      `${product}-${architecture}`
    )
  );

  fs.mkdirSync(resolvedOutput, { recursive: true });

  const environment = {
    ...process.env,
    SHEIKHA_TARGET_PLATFORM: 'linux',
    SHEIKHA_TARGET_PRODUCT: product,
    SHEIKHA_TARGET_ARCH: architecture,
    SHEIKHA_OUTPUT_DIR: resolvedOutput
  };

  const result = spawnSync(
    'npm',
    ['run', context.target.delegateScript],
    {
      cwd: ROOT,
      env: environment,
      stdio: 'inherit'
    }
  );

  process.stdout.write(
    `DELEGATE_EXECUTION_COMPLETED=true\n` +
    `TARGET_ID=${context.target.id}\n` +
    `DELEGATE_SCRIPT=${context.target.delegateScript}\n` +
    `OUTPUT_DIR=${resolvedOutput}\n` +
    `ARTIFACT_INSPECTION_REQUIRED=true\n` +
    `NATIVE_INSTALL_TEST_REQUIRED=true\n`
  );

  process.exitCode =
    typeof result.status === 'number'
      ? result.status
      : 1;
}

function main() {
  const { command, args } = parseArgs(process.argv);
  const product = args.product;
  const architecture = args.arch || args.architecture || 'x64';

  if (!product) {
    throw new Error('--product is required');
  }

  if (command === 'status') {
    process.stdout.write(
      `${JSON.stringify(status(product, architecture), null, 2)}\n`
    );
    return;
  }

  if (command === 'build') {
    build(product, architecture, args['output-dir']);
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
