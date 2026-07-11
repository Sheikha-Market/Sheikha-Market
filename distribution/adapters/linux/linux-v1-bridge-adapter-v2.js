'use strict';

const path = require('node:path');

const v1 = require('../../scripts/sheikha-distribution-v1');
const { DISTRIBUTION_ROOT } = require('../../common/distribution-utils');

function createBridgeContext(v2Context) {
  const context = v1.createContext({
    host: v2Context.toolchain.host,
    tools: v2Context.toolchain.tools,
    available: v2Context.toolchain.available,
    missing: v2Context.toolchain.missing,
    constraints: v2Context.toolchain.constraints
  });
  context.matrix = {
    ...v2Context.matrix,
    targets: v2Context.matrix.targets.map((target) => ({
      ...target,
      packageFormat: target.format,
      nativeSmokeTestRequirement: target.nativeRunnerRequirement
    }))
  };
  context.version = v2Context.version;
  context.versionRoot = v2Context.releaseTree;
  context.artifactDir = path.join(context.versionRoot, 'artifacts');
  context.metadataDir = path.join(context.versionRoot, 'metadata');
  context.sbomDir = path.join(context.versionRoot, 'sbom');
  context.provenanceDir = path.join(context.versionRoot, 'provenance');
  context.verificationDir = path.join(context.versionRoot, 'verification');
  context.stagingRoot = path.join(DISTRIBUTION_ROOT, 'staging', 'v2', context.version);
  context.workingVerificationRoot = path.join(DISTRIBUTION_ROOT, 'verification', 'v2', context.version);
  return context;
}

function buildAvailableLinux(v2Context) {
  const bridge = createBridgeContext(v2Context);
  const results = v1.buildAvailable(bridge).map((result) => ({
    ...result,
    status: result.status === 'BUILD_FAILED' || result.status === 'INSPECTION_FAILED'
      ? 'FAILED'
      : result.status,
    bridge: 'SHEIKHA_V1_BUILD_ENGINE_REUSED_BY_V2'
  }));
  return { bridge, results };
}

module.exports = { buildAvailableLinux, createBridgeContext };
