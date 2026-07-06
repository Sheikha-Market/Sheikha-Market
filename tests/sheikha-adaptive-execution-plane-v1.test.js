'use strict';

const {
  SheikhaAdaptiveExecutionPlane,
  EXECUTION_ENGINES,
  EXECUTION_STAGES,
  EXECUTION_OUTCOMES
} = require('../runtime/sheikha-platform/adaptive-execution/sheikha-adaptive-execution-plane');

test('activates adaptive execution plane above adaptive runtime composition', () => {
  const plane = new SheikhaAdaptiveExecutionPlane();
  const status = plane.getStatus();

  expect(status.status).toBe('ACTIVE_ADAPTIVE_EXECUTION_PLANE');
  expect(status.layerRank).toBe('ABOVE_ADAPTIVE_RUNTIME_COMPOSITION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.engines).toEqual(EXECUTION_ENGINES);
  expect(status.stages).toEqual(EXECUTION_STAGES);
  expect(status.outcomes).toEqual(EXECUTION_OUTCOMES);

  expect(status.samplePlan.status).toBe('ADAPTIVE_EXECUTION_PLAN_READY');
  expect(status.sampleReadiness.status).toBe('EXECUTION_READINESS_EVALUATED');
  expect(status.boundaries.noUngovernedExecution).toBe(true);
});

test('builds governed execution plan from intent', () => {
  const plane = new SheikhaAdaptiveExecutionPlane();

  const plan = plane.buildExecutionPlan({
    goal: 'run-marketplace-operation',
    userRole: 'merchant',
    domain: 'marketplace',
    importance: 'high',
    requestedPacks: ['core-runtime', 'marketplace', 'observability']
  });

  expect(plan.status).toBe('ADAPTIVE_EXECUTION_PLAN_READY');
  expect(plan.analyzedIntent.goal).toBe('run-marketplace-operation');
  expect(plan.runtime.status).toBe('ADAPTIVE_RUNTIME_COMPOSED');
  expect(plan.boundaries.noOverActivation).toBe(true);
});

test('evaluates readiness without allowing production promotion by default', () => {
  const plane = new SheikhaAdaptiveExecutionPlane();

  const plan = plane.buildExecutionPlan({
    goal: 'test-safe-execution'
  });

  const readiness = plane.evaluateExecutionReadiness(plan);

  expect(readiness.status).toBe('EXECUTION_READINESS_EVALUATED');
  expect(readiness.readyForControlledExecution).toBe(true);
  expect(readiness.readyForProductionPromotion).toBe(false);
  expect(readiness.checks).toContain('human-approval-required-for-promotion');
});

test('rejects missing intent goal', () => {
  const plane = new SheikhaAdaptiveExecutionPlane();

  expect(() => plane.analyzeIntent({}))
    .toThrow('Sheikha adaptive execution requires intent.goal');
});
