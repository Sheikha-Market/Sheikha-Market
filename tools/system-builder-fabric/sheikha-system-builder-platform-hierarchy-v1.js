'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

const FILES = Object.freeze({
  hierarchy: path.join(
    ROOT,
    'runtime/system-builder-fabric/v1/' +
      'sheikha-system-builder-platform-hierarchy-v1.json'
  ),
  fabric: path.join(
    ROOT,
    'runtime/system-builder-fabric/v1/' +
      'sheikha-system-builder-fabric-v1.json'
  ),
  tools: path.join(
    ROOT,
    'runtime/system-builder-fabric/v1/' +
      'sheikha-system-builder-tool-registry-v1.json'
  ),
  matrix: path.join(
    ROOT,
    'runtime/system-builder-fabric/v1/' +
      'sheikha-system-builder-capability-matrix-v1.json'
  ),
});

function readJson(filePath) {
  return JSON.parse(
    fs.readFileSync(filePath, 'utf8')
  );
}

function getSystemBuilderPlatformStatus() {
  const hierarchy = readJson(FILES.hierarchy);
  const fabric = readJson(FILES.fabric);
  const tools = readJson(FILES.tools);
  const matrix = readJson(FILES.matrix);

  const architecture = hierarchy.architecture;

  const checks = {
    hierarchyActive:
      hierarchy.status === 'ACTIVE',

    systemBuilderIsFoundation:
      architecture.foundation.role ===
        'PRIMARY_SYSTEM_AND_SYSTEM_BUILDING_FOUNDATION',

    fabricIsRequired:
      architecture.coreFabric.required === true,

    websiteIsNotFoundation:
      architecture.website.isFoundation === false,

    websiteIsPrimaryProductSurface:
      architecture.website.isPrimaryProductSurface === true,

    websiteDoesNotOwnCoreExecution:
      architecture.website.requiredForCoreFabricExecution === false,

    vscodeIsOptional:
      architecture.vscode.requiredForProduction === false &&
      architecture.vscode.requiredForSystemBuilderRuntime === false,

    codexIsOptional:
      architecture.codex.requiredForProduction === false &&
      architecture.codex.requiredForSystemBuilderRuntime === false,

    defaultDeny:
      hierarchy.governance.defaultExecutionAuthorization === 'DENY',

    fabricPresent:
      Boolean(fabric && typeof fabric === 'object'),

    toolRegistryPresent:
      Boolean(tools && typeof tools === 'object'),

    capabilityMatrixPresent:
      Boolean(matrix && typeof matrix === 'object'),

    lifecycleComplete:
      Array.isArray(hierarchy.systemBuildingLifecycle) &&
      hierarchy.systemBuildingLifecycle.length >= 10,
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    system: hierarchy.system,
    status: hierarchy.status,
    foundation: architecture.foundation,
    coreFabric: architecture.coreFabric,
    productSurface: architecture.website,
    developmentPlatform: architecture.developmentPlatform,
    optionalAdapters: {
      vscode: architecture.vscode,
      codex: architecture.codex,
    },
    systemBuildingLifecycle:
      hierarchy.systemBuildingLifecycle,
    governance: hierarchy.governance,
    checks,
    failedChecks,
    passed: failedChecks.length === 0,
  };
}

if (require.main === module) {
  const result = getSystemBuilderPlatformStatus();

  process.stdout.write(
    JSON.stringify(result, null, 2) + '\n'
  );

  if (!result.passed) {
    process.exitCode = 1;
  }
}

module.exports = {
  FILES,
  getSystemBuilderPlatformStatus,
};
