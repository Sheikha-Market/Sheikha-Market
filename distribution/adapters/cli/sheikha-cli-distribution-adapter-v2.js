'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { ROOT } = require('../../common/distribution-utils');

class SheikhaCliDistributionAdapter {
  constructor(target) {
    this.target = target;
  }

  inspectSource() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const launcherPath = path.join(ROOT, 'bin', 'sheikha');
    const launcher = fs.readFileSync(launcherPath, 'utf8');
    const requiresNode = /^#!\/usr\/bin\/env node\b/u.test(launcher) || /^#!\/usr\/bin\/node\b/u.test(launcher);
    return {
      system: 'SHEIKHA_CLI_DISTRIBUTION_ADAPTER_V2',
      targetId: this.target.id,
      launcher: 'bin/sheikha',
      launcherExists: fs.existsSync(launcherPath),
      launcherExecutable: (fs.statSync(launcherPath).mode & 0o111) !== 0,
      runtimePayload: 'external-node-runtime',
      configuration: 'external-environment-and-config-files',
      licenses: fs.existsSync(path.join(ROOT, 'LICENSE')) ? ['LICENSE'] : [],
      manifests: ['package.json', 'distribution-manifest.json'],
      checksumsRequired: true,
      requiresExternalNodeRuntime: requiresNode,
      standalone: !requiresNode,
      declaredNodeVersions: packageJson.engines?.node || null,
      nativeExecutable: false,
      nativeArchitectureClaimAllowed: false,
      limitation: requiresNode
        ? 'The CLI launcher is JavaScript and requires a compatible external Node.js runtime.'
        : null
    };
  }
}

module.exports = { SheikhaCliDistributionAdapter };
