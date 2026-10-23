'use strict';

const crypto = require('node:crypto');
const {HARDWARE_TARGETS} = require('../../runtime/sheikha-ai-governor/v1/sheikha-composite-model-v1');

function object(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !fields.includes(k))) throw new Error('INVALID_CAPACITY_FIELDS');
}
function integer(value, max, min = 0) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error('INVALID_CAPACITY_LIMIT');
  return BigInt(value);
}
function ref(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(value)) throw new Error('INVALID_CAPACITY_REFERENCE');
  return value;
}
function ceil(n, d) { return (n + d - 1n) / d; }
function min(...values) { return values.reduce((a, b) => a < b ? a : b); }

function planFoundryCapacity(input) {
  object(input, ['projectRef', 'registry', 'compute', 'demand', 'pricing']);
  object(input.registry, ['modelCount', 'storedArtifacts', 'metadataBytesPerModel', 'metadataReplication', 'modelsPerShard', 'indexOverheadBps', 'artifactBytes', 'artifactCopies', 'retainedVersions']);
  object(input.compute, ['hardware', 'availableWorkers', 'workerMemoryBytes', 'memoryPerJobBytes', 'memoryReserveBps', 'slotsPerWorker', 'recipeRef', 'benchmarkRef']);
  object(input.demand, ['requestedConcurrentJobs', 'totalJobs', 'jobMinutes', 'budgetMinutes']);
  object(input.pricing, ['workerRateMicroSarPerHour', 'computeBudgetHalala', 'reserveBps', 'storageMicroSarPerGBMonth']);
  const r = input.registry, c = input.compute, d = input.demand, p = input.pricing;
  const modelCount = integer(r.modelCount, 1e12), storedArtifacts = integer(r.storedArtifacts, 1e12);
  if (storedArtifacts > modelCount) throw new Error('STORED_ARTIFACTS_EXCEED_REGISTRY');
  const metadata = modelCount * integer(r.metadataBytesPerModel, 1048576, 1) * integer(r.metadataReplication, 10, 1);
  const metadataBytes = ceil(metadata * (10000n + integer(r.indexOverheadBps, 30000)), 10000n);
  const shards = ceil(modelCount, integer(r.modelsPerShard, 1e7, 1));
  const artifactBytes = storedArtifacts * integer(r.artifactBytes, 32 * 1024 ** 4, 1) * integer(r.artifactCopies, 10, 1) * integer(r.retainedVersions, 1000, 1);
  if (!HARDWARE_TARGETS.includes(c.hardware)) throw new Error('INVALID_CAPACITY_HARDWARE');
  const workers = integer(c.availableWorkers, 1e6);
  const workerMemory = integer(c.workerMemoryBytes, Number.MAX_SAFE_INTEGER, 1);
  const usableMemory = workerMemory * (10000n - integer(c.memoryReserveBps, 9999)) / 10000n;
  const memoryPerJob = integer(c.memoryPerJobBytes, Number.MAX_SAFE_INTEGER, 1);
  const slots = min(integer(c.slotsPerWorker, 1024, 1), usableMemory / memoryPerJob);
  const requested = integer(d.requestedConcurrentJobs, 1e12), totalJobs = integer(d.totalJobs, 1e12);
  if (requested > totalJobs) throw new Error('CONCURRENCY_EXCEEDS_TOTAL_JOBS');
  const jobMinutes = integer(d.jobMinutes, 525600, 1), budgetMinutes = integer(d.budgetMinutes, 525600, 1);
  const workerRate = integer(p.workerRateMicroSarPerHour, 1e12);
  const budget = integer(p.computeBudgetHalala, 1e12);
  const reserve = integer(p.reserveBps, 10000);
  const storageRate = integer(p.storageMicroSarPerGBMonth, 1e9);
  // Reserve full workers for the entire budget window; all costs round up to a halala.
  const workerWindowCost = ceil(workerRate * budgetMinutes, 600000n);
  const reservedWorkerWindowCost = ceil(workerWindowCost * (10000n + reserve), 10000n);
  const affordableWorkers = reservedWorkerWindowCost ? min(workers, budget / reservedWorkerWindowCost) : 0n;
  const windowCanFinishJob = jobMinutes <= budgetMinutes;
  const plannedActiveJobs = windowCanFinishJob ? min(requested, affordableWorkers * slots) : 0n;
  const allocatedWorkers = slots ? ceil(plannedActiveJobs, slots) : 0n;
  const requiredWorkers = slots ? ceil(requested, slots) : null;
  const waves = plannedActiveJobs ? ceil(totalJobs, plannedActiveJobs) : null;
  const elapsedMinutes = waves === null ? null : waves * jobMinutes;
  const billableWindows = elapsedMinutes === null ? null : ceil(elapsedMinutes, budgetMinutes);
  const reservedWindowCost = allocatedWorkers * reservedWorkerWindowCost;
  const fullQueueCost = billableWindows === null ? null : reservedWindowCost * billableWindows;
  const flags = [];
  if (!workerRate && requested) flags.push('COMPUTE_PRICE_MISSING');
  if (!storageRate && artifactBytes) flags.push('STORAGE_PRICE_MISSING');
  if (!slots && requested) flags.push('JOB_MEMORY_DOES_NOT_FIT_WORKER');
  if (!windowCanFinishJob && requested) flags.push('JOB_EXCEEDS_BUDGET_WINDOW');
  if (requiredWorkers !== null && requiredWorkers > workers) flags.push('REQUESTED_CONCURRENCY_EXCEEDS_DECLARED_WORKERS');
  if (requiredWorkers !== null && requiredWorkers * reservedWorkerWindowCost > budget) flags.push('REQUESTED_CONCURRENCY_EXCEEDS_COMPUTE_BUDGET');
  if (elapsedMinutes !== null && elapsedMinutes > budgetMinutes) flags.push('QUEUE_REQUIRES_ADDITIONAL_BUDGET_WINDOWS');
  if (fullQueueCost !== null && fullQueueCost > budget) flags.push('TOTAL_QUEUE_EXCEEDS_COMPUTE_BUDGET');
  const result = {
    system: 'SHEIKHA_FOUNDRY_CAPACITY_STUDY_V1', classification: 'CONFIDENTIAL_STUDY_ONLY', projectRef: ref(input.projectRef),
    registry: {modelCount: modelCount.toString(), storedArtifacts: storedArtifacts.toString(), metadataBytes: metadataBytes.toString(), shardCount: shards.toString(), artifactBytesAllCopiesAndVersions: artifactBytes.toString(), logicalIdsAreNotTrainedModels: true},
    compute: {hardware: c.hardware, recipeRef: ref(c.recipeRef), benchmarkRef: ref(c.benchmarkRef), declaredWorkers: workers.toString(), usableMemoryBytesPerWorker: usableMemory.toString(), declaredPeakMemoryBytesPerJob: memoryPerJob.toString(), plannedSlotsPerWorker: slots.toString(), requiredWorkersForRequestedConcurrency: requiredWorkers?.toString() ?? null, allocatedWorkers: allocatedWorkers.toString(), plannedActiveJobs: plannedActiveJobs.toString(), requestedConcurrentJobs: requested.toString()},
    queue: {totalJobs: totalJobs.toString(), homogeneousWaves: waves?.toString() ?? null, estimatedMinutes: elapsedMinutes?.toString() ?? null, pricedWindowMinutes: budgetMinutes.toString(), fitsSingleBudgetWindow: elapsedMinutes !== null && elapsedMinutes <= budgetMinutes},
    financials: {currency: 'SAR', unit: 'HALALA', computeBudgetHalala: budget.toString(), reservedCostPerWorkerWindowHalala: reservedWorkerWindowCost.toString(), reservedAllocatedWindowCostHalala: reservedWindowCost.toString(), fullQueueReservationCostHalala: fullQueueCost?.toString() ?? null, fullQueueFitsBudget: fullQueueCost !== null && fullQueueCost <= budget, requestedConcurrencyWindowCostHalala: requiredWorkers === null ? null : (requiredWorkers * reservedWorkerWindowCost).toString(), artifactStorageOnlyMonthlyHalala: ceil(ceil(artifactBytes, 1000000000n) * storageRate, 10000n).toString(), metadataDatabaseAndOperationsPriced: false, networkTrainingAndRecoveryOverheadsPriced: false},
    flags, status: flags.length ? 'CAPACITY_OR_PRICE_REVIEW_REQUIRED' : 'DECLARED_CAPACITY_FITS_PENDING_BENCHMARK_AND_CONTRACT',
    assumptions: {homogeneousSingleWorkerJobsOnly: true, cpuWorkerUsesRamAndAcceleratorWorkerUsesDeviceMemory: true, crossWorkerTensorParallelismModeled: false, slotsAndMemoryAreUnverifiedDeclarations: true, storageUsesDecimalGB: true, bulkDiscountsAssumed: false},
    provisioningExecuted: false, schedulerActivated: false, concurrentModelsVerified: false, commercialProductionReady: false,
  };
  return {...result, planSha256: crypto.createHash('sha256').update(JSON.stringify(result)).digest('hex'), digestIsSignature: false};
}

module.exports = {planFoundryCapacity};
