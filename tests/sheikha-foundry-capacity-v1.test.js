'use strict';

const {planFoundryCapacity} = require('../core/foundry/sheikha-foundry-capacity-v1');
const {capacityInput} = require('./fixtures/sheikha-foundry-sourcing-v1');

test('prices actual workers and retained versions separately from registry IDs', () => {
  const plan = planFoundryCapacity(capacityInput());
  expect(plan.registry.metadataBytes).toBe('9216000');
  expect(plan.registry.artifactBytesAllCopiesAndVersions).toBe('768000000000');
  expect(plan.compute.plannedActiveJobs).toBe('2');
  expect(plan.financials.reservedCostPerWorkerWindowHalala).toBe('657');
  expect(plan.financials.artifactStorageOnlyMonthlyHalala).toBe('4320');
  expect(plan.queue.estimatedMinutes).toBe('240');
  expect(plan.financials.fullQueueReservationCostHalala).toBe('5256');
  expect(plan.flags).toContain('QUEUE_REQUIRES_ADDITIONAL_BUDGET_WINDOWS');
  expect(plan.provisioningExecuted).toBe(false);
});
test('a billion registry entries does not allocate a billion workers or claim trained weights', () => {
  const input = capacityInput(); input.registry.modelCount = 1e9; input.demand.requestedConcurrentJobs = 1e9; input.demand.totalJobs = 1e9;
  const p = planFoundryCapacity(input);
  expect(p.registry.shardCount).toBe('1000');
  expect(p.registry.storedArtifacts).toBe('1000');
  expect(p.compute.plannedActiveJobs).toBe('2');
  expect(p.compute.requiredWorkersForRequestedConcurrency).toBe('1000000000');
  expect(p.financials.requestedConcurrencyWindowCostHalala).toBe('657000000000');
  expect(p.flags).toContain('REQUESTED_CONCURRENCY_EXCEEDS_COMPUTE_BUDGET');
  expect(p.concurrentModelsVerified).toBe(false);
});
test('memory overhead and budget independently bound active slots', () => {
  const input = capacityInput(); input.compute.slotsPerWorker = 8;
  expect(planFoundryCapacity(input).compute.plannedSlotsPerWorker).toBe('1');
  input.pricing.computeBudgetHalala = 657;
  const p = planFoundryCapacity(input);
  expect(p.compute.plannedActiveJobs).toBe('1');
  expect(p.flags).toContain('TOTAL_QUEUE_EXCEEDS_COMPUTE_BUDGET');
  input.compute.memoryPerJobBytes = 32 * 1024 ** 3;
  const noMemory = planFoundryCapacity(input);
  expect(noMemory.compute.plannedActiveJobs).toBe('0');
  expect(noMemory.queue.estimatedMinutes).toBe(null);
});
test.each(['CPU', 'ROCM', 'TPU', 'TRAINIUM', 'CEREBRAS'])('hardware %s is a planning option, not a provisioned provider', hardware => {
  const p = planFoundryCapacity({...capacityInput(), compute: {...capacityInput().compute, hardware}});
  expect(p.schedulerActivated).toBe(false);
  expect(p.commercialProductionReady).toBe(false);
});
test('large byte totals remain exact decimal strings beyond Number safe range', () => {
  const input = capacityInput(); input.registry.modelCount = 1e12; input.registry.storedArtifacts = 1e12;
  const p = planFoundryCapacity(input);
  expect(p.registry.artifactBytesAllCopiesAndVersions).toBe('768000000000000000000');
  expect(JSON.parse(JSON.stringify(p)).registry.artifactBytesAllCopiesAndVersions).toBe('768000000000000000000');
});
test('unpriced computation, zero cash and overlong jobs cannot create executable slots', () => {
  const input = capacityInput(); input.pricing.workerRateMicroSarPerHour = 0;
  expect(planFoundryCapacity(input).compute.plannedActiveJobs).toBe('0');
  input.pricing.workerRateMicroSarPerHour = 5962500; input.pricing.computeBudgetHalala = 0;
  expect(planFoundryCapacity(input).compute.plannedActiveJobs).toBe('0');
  input.pricing.computeBudgetHalala = 200000; input.demand.jobMinutes = 61;
  expect(planFoundryCapacity(input).flags).toContain('JOB_EXCEEDS_BUDGET_WINDOW');
});
test.each([{modelCount: -1}, {modelCount: 1.2}, {modelCount: 1e13}, {storedArtifacts: 1001}, {modelsPerShard: 0}, {artifactCopies: 0}])('rejects invalid registry bounds %j', patch => {
  expect(() => planFoundryCapacity({...capacityInput(), registry: {...capacityInput().registry, ...patch}})).toThrow();
});
test('no activation, URL credentials or false throughput claims accepted', () => {
  expect(() => planFoundryCapacity({...capacityInput(), activateNow: true})).toThrow();
  expect(() => planFoundryCapacity({...capacityInput(), projectRef: 'https://private/token'})).toThrow();
  const input = capacityInput(); input.demand.requestedConcurrentJobs = 9;
  expect(() => planFoundryCapacity(input)).toThrow('CONCURRENCY_EXCEEDS_TOTAL_JOBS');
});
