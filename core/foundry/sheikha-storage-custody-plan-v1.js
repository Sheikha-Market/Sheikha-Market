'use strict';

const crypto = require('node:crypto');
const {buildTrainingResultIndex} = require('./sheikha-foundry-evidence-v1');

const PARTIES = Object.freeze(['SHEIKHA', 'CUSTOMER', 'THIRD_PARTY']);
const OPERATIONS = Object.freeze(['READ_INDEX', 'VERIFY_ENCRYPTED_OBJECT', 'WRITE_NEW_VERSION', 'RESTORE_TO_OWNER', 'DELETE_AFTER_RETENTION']);

function obj(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !fields.includes(k))) throw new Error('INVALID_STORAGE_PLAN_FIELDS');
}
function ref(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(value)) throw new Error('STORAGE_REFERENCE_NOT_URL_PATH_OR_CREDENTIAL');
  return value;
}
function uint(value, max, min = 0) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error('INVALID_STORAGE_AMOUNT_OR_LIMIT');
  return value;
}
function choice(value, choices) {
  if (!choices.includes(value)) throw new Error('INVALID_STORAGE_CHOICE');
  return value;
}
function ceil(n, d) { return (n + d - 1n) / d; }

function storageCost(input, allocatedBytes) {
  obj(input, ['unitBytes', 'microSarPerUnitMonth', 'months', 'operationsHalala', 'retrievalHalala', 'transferHalala', 'keyManagementHalala', 'supportHalala', 'exitHalala', 'reserveBps', 'marginBps']);
  const unitBytes = choice(input.unitBytes, [1000000000, 1073741824]);
  const microSarPerUnitMonth = uint(input.microSarPerUnitMonth, 1000000000);
  const months = uint(input.months, 120, 1);
  const units = ceil(allocatedBytes, BigInt(unitBytes));
  const storageHalala = ceil(units * BigInt(microSarPerUnitMonth) * BigInt(months), 10000n);
  const extras = Object.fromEntries(['operationsHalala', 'retrievalHalala', 'transferHalala', 'keyManagementHalala', 'supportHalala', 'exitHalala'].map(k => [k, uint(input[k], 10000000000)]));
  const reserveBps = uint(input.reserveBps, 10000), marginBps = uint(input.marginBps, 9999);
  const direct = storageHalala + Object.values(extras).reduce((a, n) => a + BigInt(n), 0n);
  const reserved = ceil(direct * BigInt(10000 + reserveBps), 10000n);
  const proposed = ceil(reserved * 10000n, BigInt(10000 - marginBps));
  if (proposed > 10000000000n) throw new Error('STORAGE_QUOTE_OUT_OF_RANGE');
  return {currency: 'SAR', unit: 'HALALA', billingUnitBytes: unitBytes, billableUnits: units.toString(), months, storageHalala: Number(storageHalala), ...extras, directCostHalala: Number(direct), reservedCostHalala: Number(reserved), proposedPriceExTaxHalala: Number(proposed), tariffVerified: false, regionAvailabilityVerified: false, taxCalculated: false, spendingAuthorized: false};
}

function buildStorageCustodyPlan(input) {
  obj(input, ['index', 'storageOwner', 'location', 'providerRef', 'regionRef', 'locationRef', 'storageContractRef', 'keyCustodian', 'retentionDays', 'copies', 'artifactBytes', 'versionCount', 'capacityBytes', 'rpoHours', 'rtoHours', 'accessRequests', 'pricing']);
  const index = buildTrainingResultIndex(input.index);
  const location = choice(input.location, ['OWNER_LOCAL', 'CUSTOMER_SITE', 'CLOUD']);
  const storageOwner = choice(input.storageOwner, PARTIES);
  if (location === 'CUSTOMER_SITE' && storageOwner !== 'CUSTOMER') throw new Error('CUSTOMER_SITE_REQUIRES_CUSTOMER_STORAGE_OWNER');
  const providerRef = location === 'CLOUD' ? ref(input.providerRef) : null;
  if (location !== 'CLOUD' && input.providerRef !== undefined) throw new Error('LOCAL_STORAGE_HAS_NO_CLOUD_PROVIDER');
  const copies = uint(input.copies, 10, 1), versionCount = uint(input.versionCount, 1000, 1);
  const retentionDays = uint(input.retentionDays, 3650, 1);
  const artifactBytes = uint(input.artifactBytes, 32 * 1024 ** 4, 1);
  const capacityBytes = uint(input.capacityBytes, Number.MAX_SAFE_INTEGER, 1);
  const allocatedBytes = BigInt(artifactBytes) * BigInt(copies) * BigInt(versionCount);
  const access = input.accessRequests;
  if (!Array.isArray(access) || !access.length || access.length > 3) throw new Error('ONE_ACCESS_REQUEST_PER_PARTY_REQUIRED');
  const requestedAccess = access.map(entry => {
    obj(entry, ['party', 'operations']); choice(entry.party, PARTIES);
    if (!Array.isArray(entry.operations) || !entry.operations.length || entry.operations.length > OPERATIONS.length || new Set(entry.operations).size !== entry.operations.length) throw new Error('INVALID_STORAGE_OPERATIONS');
    entry.operations.forEach(op => choice(op, OPERATIONS));
    return {party: entry.party, operations: [...entry.operations], granted: false, tenantScope: index.tenantRef, artifactSha256Scope: index.artifactSha256};
  });
  if (new Set(requestedAccess.map(a => a.party)).size !== requestedAccess.length) throw new Error('DUPLICATE_STORAGE_PARTY');
  const blockers = [];
  if (allocatedBytes > BigInt(capacityBytes)) blockers.push('CAPACITY_INSUFFICIENT_FOR_VERSIONS_AND_COPIES');
  const costs = storageCost(input.pricing, allocatedBytes);
  if (!costs.directCostHalala) blockers.push('ALL_IN_STORAGE_COSTS_MISSING');
  const pricedCoverageDays = costs.months * 30;
  if (retentionDays > pricedCoverageDays) blockers.push('RETENTION_EXCEEDS_PRICED_PLANNING_PERIOD');
  const plan = {
    system: 'SHEIKHA_STORAGE_CUSTODY_CONTRACT_PLAN_V1', classification: 'CONFIDENTIAL_STUDY_ONLY', index,
    storageOwner, location, providerRef, regionRef: ref(input.regionRef), locationRef: ref(input.locationRef),
    storageContractRef: ref(input.storageContractRef), keyCustodian: choice(input.keyCustodian, PARTIES),
    artifactBytes, artifactSizeVerified: false, versionCount, copies, allocatedBytes: allocatedBytes.toString(), capacityBytes,
    retentionDays, pricedCoverageDays, coverageBasis: 'THIRTY_DAY_PLANNING_MONTH_NOT_VERIFIED_CALENDAR_CONTRACT',
    targets: {rpoHours: uint(input.rpoHours, 720, 1), rtoHours: uint(input.rtoHours, 720, 1), measured: false, independentCopyFailureDomainsVerified: false},
    requestedAccess, financials: costs, blockers,
    ownership: {weightsTransferredByStorage: false, platformOwnershipTransferred: false, clientDataReuseAllowed: false},
    controls: {
      privateByDefault: true, anonymousAccessAllowed: false, bearerDownloadLinksIssued: false,
      encryptionRequired: true, keySeparateFromObjectStoreRequired: true,
      writeNewVersionOnly: true, restoreRequiresIdentityAndDestinationApproval: true,
      deletionRequiresRetentionAndLegalHoldCheck: true, crossRegionReplicationRequiresIndependentApproval: true,
      automaticRetentionDeletionImplemented: false, cloudIamApplied: false, trainingAccessGranted: false,
    },
    requiredEvidence: ['SIGNED_CUSTODY_PROCESSING_AND_EXIT_CONTRACT', 'NAMED_OWNER_REGION_AND_TENANT_SCOPE', 'UPSTREAM_RIGHTS_AND_NO_IMPLIED_ASSIGNMENT', 'PROVIDER_IAM_AND_PRIVATE_ACCESS_TEST', 'ENCRYPTION_AND_KEY_RECOVERY_DRILL', 'VERSION_INTEGRITY_AND_RESTORE_ON_INDEPENDENT_STORAGE', 'RETENTION_LEGAL_HOLD_AND_DELETION_TEST', 'REAL_PRICE_BUDGET_AND_TRANSFER_APPROVAL'],
    status: blockers.length ? 'HOLD_STORAGE_FEASIBILITY' : 'STORAGE_DESIGN_REQUIRES_CONTRACT_AND_ACCESS_VERIFICATION',
    uploadExecuted: false, storageContractActivated: false, cloudProviderActivated: false, productionReady: false,
    integration: {localTool: 'tools/training/sheikha-artifact-custody-v1.js', localToolUploads: false, indexMethod: 'buildTrainingResultIndex', networkAdapterImplemented: false},
  };
  return {...plan, planSha256: crypto.createHash('sha256').update(JSON.stringify(plan)).digest('hex'), digestIsSignature: false};
}

module.exports = {OPERATIONS, buildStorageCustodyPlan};
