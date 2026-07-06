'use strict';

const {
  SheikhaUnifiedFIFOApplicationOrchestrator,
  FIFO_APPLICATIONS,
  FIFO_STATES
} = require('../runtime/sheikha-platform/fifo-orchestrator/sheikha-unified-fifo-application-orchestrator');

test('activates unified FIFO application orchestrator', () => {
  const fifo = new SheikhaUnifiedFIFOApplicationOrchestrator();
  const status = fifo.getStatus();

  expect(status.status).toBe('ACTIVE_UNIFIED_FIFO_APPLICATION_ORCHESTRATOR');
  expect(status.layerRank).toBe('ABOVE_ADAPTIVE_EXECUTION_PLANE');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.applications).toEqual(FIFO_APPLICATIONS);
  expect(status.states).toEqual(FIFO_STATES);
  expect(status.boundaries.fifoEnabled).toBe(true);
});

test('enqueues and preserves FIFO order', () => {
  const fifo = new SheikhaUnifiedFIFOApplicationOrchestrator();

  const first = fifo.enqueue({
    application: 'studio',
    goal: 'open-studio'
  });

  const second = fifo.enqueue({
    application: 'marketplace',
    goal: 'run-marketplace'
  });

  expect(fifo.peek().id).toBe(first.id);
  expect(fifo.dequeue().id).toBe(first.id);
  expect(fifo.dequeue().id).toBe(second.id);
});

test('processes FIFO item through adaptive execution plane', () => {
  const fifo = new SheikhaUnifiedFIFOApplicationOrchestrator();

  fifo.enqueue({
    application: 'materials',
    goal: 'inspect-material-entity',
    importance: 'high',
    priority: 'high',
    requestedPacks: ['core-runtime', 'governance', 'registry', 'observability']
  });

  const result = fifo.processNext();

  expect(result.status).toBe('FIFO_ITEM_PROCESSED');
  expect(result.item.status).toBe('completed');
  expect(result.plan.status).toBe('ADAPTIVE_EXECUTION_PLAN_READY');
  expect(result.boundaries.fifoOrderPreserved).toBe(true);
});

test('rejects invalid FIFO requests', () => {
  const fifo = new SheikhaUnifiedFIFOApplicationOrchestrator();

  expect(() => fifo.enqueue({ application: 'studio' }))
    .toThrow('Sheikha FIFO request requires goal');

  expect(() => fifo.enqueue({
    application: 'unknown-app',
    goal: 'bad'
  })).toThrow('Unsupported Sheikha FIFO application');
});
