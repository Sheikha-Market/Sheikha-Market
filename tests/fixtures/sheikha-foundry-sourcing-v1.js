'use strict';

// Fictional parties, prices and digests for arithmetic and authorization-boundary tests only.
function sourcingInput() {
  const pricing = {gpuMinutes: 120, gpuRateHalalaPerHour: 600, laborMinutes: 1200, laborRateHalalaPerHour: 10000, storageHalala: 10000, evaluationHalala: 20000, rightsReviewHalala: 30000, deliveryHalala: 10000, reserveBps: 1000, marginBps: 3000};
  const managed = {id: 'SHEIKHA_MANAGED_EXAMPLE', execution: 'SHEIKHA_MANAGED', computeOwner: 'SHEIKHA', hardware: 'CUDA', memoryGiB: 24, requiredMemoryGiB: 16, operatorSkill: 'EXPERT', recipeRef: 'ILLUSTRATIVE_LORA_NOT_BENCHMARKED', deliveryDays: 10, priceExTaxHalala: 450000, customerOtherCostHalala: 0, thirdPartyFeeHalala: 0, exitReserveHalala: 0, rightsFeeHalala: 0, royaltyBps: 0, pricing};
  return {
    projectRef: 'EXAMPLE_NOT_A_CUSTOMER_CONTRACT', objectiveRef: 'ONE_SPECIALIZED_TASK', evaluationRef: 'SAME_HOLDOUT_REVIEW_REQUIRED',
    parties: {sheikhaRef: 'EXAMPLE_PARTY_1', customerRef: 'EXAMPLE_PARTY_2', thirdPartyRef: 'EXAMPLE_PARTY_3'},
    model: {supplier: 'SHEIKHA', modelRef: 'ILLUSTRATIVE_4B', licenseRef: 'NOT_A_LICENSE_GRANT', baseSha256: 'a'.repeat(64), rightsBasis: 'ORIGINAL_TITLE_CLAIM', parameterCount: 4000000000, weightBits: 16, storedWeightBytes: 8000000000, newArtifactKind: 'ADAPTER'},
    economics: {purpose: 'COMMERCIAL', customerBudgetHalala: 600000, availableProjectCashHalala: 500000, dedicatedBenefitBudgetHalala: 0, minimumMarginBps: 3000, costStressBps: 2000, maximumDeliveryDays: 14},
    options: [managed,
      {...managed, id: 'CUSTOMER_SELF_EXAMPLE', execution: 'CUSTOMER_SELF', computeOwner: 'CUSTOMER', priceExTaxHalala: 250000, customerOtherCostHalala: 60000, pricing: {...pricing, gpuMinutes: 0, gpuRateHalalaPerHour: 0, laborMinutes: 480}},
      {...managed, id: 'THIRD_PARTY_MANAGED_EXAMPLE', execution: 'THIRD_PARTY_MANAGED', computeOwner: 'THIRD_PARTY', thirdPartyFeeHalala: 300000, exitReserveHalala: 30000, rightsFeeHalala: 50000, pricing: {...pricing, gpuMinutes: 0, gpuRateHalalaPerHour: 0, laborMinutes: 360}},
    ],
  };
}
function exitInput() {
  return {projectRef: 'EXAMPLE_ONLY', contractRef: 'UNVERIFIED_REFERENCE', stage: 'RUNNING', exitClauseRef: 'NEGOTIATED_EXIT_CLAUSE_TO_REVIEW', remainingRevenueHalala: 400000, avoidableRemainingCostHalala: 550000, acceptedWorkPayableHalala: 60000, otherUnavoidableLiabilitiesHalala: 20000, customerRefundDueHalala: 30000, estimatedExitFeeHalala: 20000, approvedExitCapHalala: 150000};
}
function storageInput() {
  const index = {runId: 'EXAMPLE_RUN', tenantRef: 'EXAMPLE_TENANT', modelRef: 'EXAMPLE_ARTIFACT', objective: 'EXAMPLE_ONLY', contractRef: 'UNSIGNED', licenseRef: 'UNREVIEWED'};
  for (const key of ['artifactSha256', 'baseSha256', 'tokenizerSha256', 'recipeSha256', 'datasetManifestSha256', 'evaluationSha256']) index[key] = 'a'.repeat(64);
  return {
    index, storageOwner: 'CUSTOMER', location: 'CLOUD', providerRef: 'EXAMPLE_PROVIDER_NOT_ACTIVATED', regionRef: 'REGION_TO_REVIEW', locationRef: 'PRIVATE_CONTAINER_REFERENCE', storageContractRef: 'UNSIGNED_STORAGE_DRAFT', keyCustodian: 'CUSTOMER', retentionDays: 90,
    copies: 2, artifactBytes: 100000000000, versionCount: 3, capacityBytes: 2000000000000, rpoHours: 24, rtoHours: 8,
    accessRequests: [{party: 'SHEIKHA', operations: ['READ_INDEX', 'VERIFY_ENCRYPTED_OBJECT']}, {party: 'CUSTOMER', operations: ['READ_INDEX', 'WRITE_NEW_VERSION', 'RESTORE_TO_OWNER', 'DELETE_AFTER_RETENTION']}],
    pricing: {unitBytes: 1000000000, microSarPerUnitMonth: 56250, months: 3, operationsHalala: 50, retrievalHalala: 100, transferHalala: 200, keyManagementHalala: 300, supportHalala: 10000, exitHalala: 500, reserveBps: 1000, marginBps: 3000},
  };
}
function capacityInput() {
  return {
    projectRef: 'ILLUSTRATIVE_CAPACITY_NOT_PROVISIONED',
    registry: {modelCount: 1000, storedArtifacts: 1000, metadataBytesPerModel: 2048, metadataReplication: 3, modelsPerShard: 1000000, indexOverheadBps: 5000, artifactBytes: 128000000, artifactCopies: 2, retainedVersions: 3},
    compute: {hardware: 'CUDA', availableWorkers: 2, workerMemoryBytes: 24 * 1024 ** 3, memoryPerJobBytes: 12 * 1024 ** 3, memoryReserveBps: 2000, slotsPerWorker: 1, recipeRef: 'EXAMPLE_JOB_NOT_BENCHMARKED', benchmarkRef: 'MISSING_REAL_MEASUREMENT'},
    demand: {requestedConcurrentJobs: 4, totalJobs: 8, jobMinutes: 60, budgetMinutes: 60},
    pricing: {workerRateMicroSarPerHour: 5962500, computeBudgetHalala: 200000, reserveBps: 1000, storageMicroSarPerGBMonth: 56250},
  };
}
function platformInput() {
  return {
    releaseRef: 'SHEIKHA_NATIVE_CANDIDATE_V1', channel: 'PILOT', architecture: 'X86_64', boardRef: 'MSI_TEST_BOARD',
    firmware: {vendorRef: 'VENDOR_TO_VERIFY', versionRef: 'VERSION_TO_VERIFY', artifactSha256: 'a'.repeat(64), signatureVerified: true, readbackBackupVerified: true},
    uefi: {specificationRef: 'UEFI_2_11', bootArtifactSha256: 'b'.repeat(64), gptEspVerified: true, exitBootServicesVerified: true},
    secureBoot: {enabled: true, setupMode: false, pkPresent: true, kekPresent: true, dbPresent: true, dbxPresent: true, bootSignerAllowed: true, bootArtifactRevoked: false, dbxCompatibilityChecked: true, dbxSnapshotSha256: 'c'.repeat(64)},
    verification: {qemuBootVerified: true, physicalBootVerified: true, recoveryBootVerified: true, tpmQuoteVerified: true, measuredBootVerified: true, sbomVerified: true, provenanceVerified: true},
  };
}
module.exports = {sourcingInput, exitInput, storageInput, capacityInput, platformInput};
