'use strict';

const crypto = require('node:crypto');
const {buildTrainingResultIndex} = require('./sheikha-foundry-evidence-v1');

function object(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !fields.includes(k))) throw new Error('INVALID_BYOC_FIELDS');
}
function ref(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/.test(value)) throw new Error('INVALID_BYOC_REFERENCE');
  return value;
}
function integer(value, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error('INVALID_BYOC_LIMIT');
  return value;
}
function choice(value, values) {
  if (!values.includes(value)) throw new Error('INVALID_BYOC_CHOICE');
  return value;
}

function buildByocPlan(input) {
  object(input, ['index', 'venue', 'hardware', 'deviceRef', 'providerRef', 'regionRef', 'maxMinutes', 'checkpointEverySteps', 'maxArtifactGiB', 'retentionDays', 'custodyProposal', 'custodyContractRef']);
  const index = buildTrainingResultIndex(input.index);
  const venue = choice(input.venue, ['OWNER_LOCAL', 'CUSTOMER_DEVICE', 'EXTERNAL_PROVIDER']);
  const custodyProposal = choice(input.custodyProposal, ['OWNER_LOCAL_ONLY', 'SHEIKHA_BACKUP_ONLY', 'SEPARATE_RIGHTS_NEGOTIATION']);
  const plan = {
    system: 'SHEIKHA_BYOC_TRAINING_AND_CUSTODY_PLAN_V1', classification: 'CONFIDENTIAL_DRAFT',
    index, venue, hardware: choice(input.hardware, ['CPU', 'CUDA', 'ROCM', 'TPU', 'TRAINIUM', 'CEREBRAS']),
    deviceRef: ref(input.deviceRef),
    providerRef: venue === 'EXTERNAL_PROVIDER' ? ref(input.providerRef) : null,
    regionRef: venue === 'EXTERNAL_PROVIDER' ? ref(input.regionRef) : null,
    limits: {
      maxMinutes: integer(input.maxMinutes, 1, 43200), checkpointEverySteps: integer(input.checkpointEverySteps, 1, 100000),
      maxArtifactGiB: integer(input.maxArtifactGiB, 1, 1024), retentionDays: integer(input.retentionDays, 1, 3650),
      simultaneousJobsPerDeviceUntilBenchmarked: 1,
    },
    custody: {
      proposed: custodyProposal,
      contractRef: custodyProposal === 'OWNER_LOCAL_ONLY' ? null : ref(input.custodyContractRef),
      backupIsOwnershipTransfer: false, backupIsTrainingPermission: false,
      sheikhaCopyAuthorized: false, externalTransferAuthorized: false,
      customerDataReuseAllowed: false, upstreamRightsPreserved: true,
      sheikhaOriginalPlatformRightsRetained: true,
    },
    stages: ['VERIFY_DEVICE_OWNER_AND_SIGNED_SCOPE', 'VERIFY_BASE_DATA_AND_RECIPE_DIGESTS', 'BENCHMARK_AND_RESERVE_DEVICE', 'TRAIN_OFFLINE_WITH_CHECKPOINTS', 'EVALUATE_WITHOUT_PROMOTING', 'EXPORT_ALLOWLISTED_FILES', 'ENCRYPT_AND_INDEX', 'VERIFY_AND_RESTORE_IN_NEW_DIRECTORY', 'REVIEW_SEPARATE_CUSTODY_TRANSFER', 'SIGNED_ACCEPTANCE'],
    requiredEvidence: ['DEVICE_ACCESS_AND_RESOURCE_APPROVAL', 'LICENSE_AND_DATA_RIGHTS', 'PINNED_RECIPE_AND_DEPENDENCIES', 'QUALITY_AND_PRIVACY_EVALUATION', 'KEY_RECOVERY_AND_RESTORE_DRILL', 'SIGNED_CUSTOMER_ACCEPTANCE'],
    status: 'PLAN_ONLY_EXECUTION_APPROVAL_REQUIRED', trainingExecuted: false, providerActivated: false,
    commercialProductionReady: false, networkTransferImplemented: false,
  };
  if (custodyProposal !== 'OWNER_LOCAL_ONLY') plan.requiredEvidence.push('SCOPED_SIGNED_CUSTODY_AND_RETENTION_CONTRACT');
  if (custodyProposal === 'SEPARATE_RIGHTS_NEGOTIATION') plan.requiredEvidence.push('SEPARATE_COMPENSATED_ARTIFACT_REUSE_OR_ASSIGNMENT_AGREEMENT');
  if (venue === 'EXTERNAL_PROVIDER') plan.requiredEvidence.push('PROVIDER_CONTRACT_REGION_BUDGET_AND_EGRESS_APPROVAL');
  if (venue !== 'EXTERNAL_PROVIDER' && (input.providerRef !== undefined || input.regionRef !== undefined)) throw new Error('UNEXPECTED_EXTERNAL_PROVIDER');
  if (custodyProposal === 'OWNER_LOCAL_ONLY' && input.custodyContractRef !== undefined) throw new Error('UNEXPECTED_CUSTODY_CONTRACT');
  return {...plan, planSha256: crypto.createHash('sha256').update(JSON.stringify(plan)).digest('hex'), digestIsSignature: false};
}

module.exports = {buildByocPlan};
