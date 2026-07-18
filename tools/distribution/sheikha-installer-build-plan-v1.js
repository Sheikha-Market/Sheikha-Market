'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  loadMatrix,
  loadEvidenceContract
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

function main() {
  const args = parseArgs(process.argv);
  const auditPath = path.resolve(args.audit);
  const outputPath = path.resolve(args.output);

  const matrix = loadMatrix();
  const evidence = loadEvidenceContract();
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  const auditedById = new Map(
    audit.targets.map((target) => [target.id, target])
  );

  const buildGroups = new Map();

  for (const target of matrix.targets) {
    const group = buildGroups.get(target.nativeRunner) || [];
    group.push(target.id);
    buildGroups.set(target.nativeRunner, group);
  }

  const plan = {
    system: 'SHEIKHA_INSTALLER_NATIVE_BUILD_PLAN_V1',
    sourceCommit: audit.repositoryHead,
    targetCount: matrix.targets.length,
    requiredEvidenceGates: evidence.requiredGates,
    conditionalEvidenceGates: evidence.conditionalGates,
    buildGroups: [...buildGroups.entries()].map(([runner, targets]) => ({
      runner,
      targets
    })),
    targets: matrix.targets.map((target) => {
      const audited = auditedById.get(target.id);
      return {
        targetId: target.id,
        platform: target.platform,
        product: target.product,
        architecture: target.architecture,
        nativeRunner: target.nativeRunner,
        currentStatus: audited?.status || 'GAP_CONFIRMED',
        action:
          audited?.status === 'FULLY_EVIDENCED'
            ? 'VERIFY_AND_RETAIN'
            : 'BUILD_TEST_AND_COLLECT_EVIDENCE',
        outputExtensions: target.artifactExtensions,
        evidenceFile:
          `evidence/installers/${target.id}.json`,
        humanReleaseApprovalRequired: true
      };
    }),
    productionScope: {
      includeSourceGovernance: true,
      includeInstallerArtifactsOnlyAfterFullEvidence: true,
      includeEvidenceBundles: true,
      includeChecksums: true,
      includeSbom: true,
      includeProvenance: true,
      includeUnsignedArtifactAsPublicRelease: false,
      productionPromotionAuthorized: false
    }
  };

  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(plan, null, 2)}\n`
  );
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
