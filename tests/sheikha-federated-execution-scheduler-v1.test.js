'use strict';

const {
  SheikhaFederatedExecutionScheduler,
  SCHEDULER_QUEUES,
  SCHEDULER_POLICIES,
  TASK_STATES
} = require('../runtime/sheikha-platform/federated-scheduler/sheikha-federated-execution-scheduler');

test('activates federated execution scheduler above FIFO orchestrator', () => {
  const scheduler = new SheikhaFederatedExecutionScheduler();
  const status = scheduler.getStatus();

  expect(status.status).toBe('ACTIVE_FEDERATED_EXECUTION_SCHEDULER');
  expect(status.layerRank).toBe('ABOVE_UNIFIED_FIFO_APPLICATION_ORCHESTRATOR');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.queues).toEqual(SCHEDULER_QUEUES);
  expect(status.policies).toEqual(SCHEDULER_POLICIES);
  expect(status.taskStates).toEqual(TASK_STATES);
  expect(status.boundaries.fifoWithinQueue).toBe(true);
});

test('classifies tasks into federated queues', () => {
  const scheduler = new SheikhaFederatedExecutionScheduler();

  expect(scheduler.classifyTask({ goal: 'recover', recovery: true })).toBe('recovery');
  expect(scheduler.classifyTask({ goal: 'live', realtime: true })).toBe('realtime');
  expect(scheduler.classifyTask({ goal: 'batch', batch: true })).toBe('batch');
  expect(scheduler.classifyTask({ goal: 'bg', background: true })).toBe('background');
  expect(scheduler.classifyTask({ goal: 'maint', maintenance: true })).toBe('maintenance');
  expect(scheduler.classifyTask({ goal: 'interactive' })).toBe('interactive');
});

test('schedules higher order queues before normal interactive tasks', () => {
  const scheduler = new SheikhaFederatedExecutionScheduler();

  scheduler.submit({
    application: 'studio',
    goal: 'open-studio'
  });

  scheduler.submit({
    application: 'runtime',
    goal: 'recover-runtime',
    recovery: true
  });

  const result = scheduler.scheduleNext();

  expect(result.status).toBe('FEDERATED_TASK_SCHEDULED');
  expect(result.queue).toBe('recovery');
  expect(result.processed.status).toBe('FIFO_ITEM_PROCESSED');
  expect(result.boundaries.fifoPreservedWithinQueue).toBe(true);
});

test('returns empty status when no tasks exist and rejects invalid task', () => {
  const scheduler = new SheikhaFederatedExecutionScheduler();

  expect(scheduler.scheduleNext().status).toBe('FEDERATED_SCHEDULER_EMPTY');

  expect(() => scheduler.submit({}))
    .toThrow('Sheikha federated scheduler task requires goal');
});
