'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { planWorkforce } = require('../core/organization/sheikha-digital-workforce-v1.cjs');

for (const count of ['1', '100', '1000000', '100000000']) {
  test(`plans ${count} logical identities without starting or materializing workers`, () => {
    const result = planWorkforce({ requestedAgents: count, requestedConcurrency: 100 });
    assert.equal(result.requestedLogicalAgents, count);
    assert.ok(result.plannedConcurrentSlots <= 4);
    assert.equal(result.workersStarted, 0);
    assert.equal(result.logicalIdentitiesMaterialized, 0);
    assert.equal(result.status, 'SCALE_PLAN_ONLY');
    assert.ok(JSON.stringify(result).length < 2200);
  });
}
test('rejects infinite, malformed and out-of-budget populations', () => {
  for (const count of [Infinity, NaN, -1, 0, 1.5, 'infinite', '01', '100000001', '9'.repeat(100)])
    assert.throws(() => planWorkforce({ requestedAgents: count }));
});
test('applies queue backpressure without deleting tasks or scaling services', () => {
  const report = planWorkforce({ queuedTasks: 1001 });
  assert.equal(report.queue.admission, 'BACKPRESSURE_REQUIRED');
  assert.equal(report.queue.overflowTasks, 1);
  assert.equal(report.queue.tasksExecuted, 0);
  assert.equal(planWorkforce({ queuedTasks: 1000 }).queue.admission, 'BACKPRESSURE_REQUIRED');
  assert.equal(planWorkforce({ queuedTasks: 999 }).queue.admission, 'CAPACITY_AVAILABLE');
});
test('role names and user approval flags cannot escalate this planner', () => {
  for (const claim of [{ humanApproved: true }, { productionHold: false }, { role: 'owner' }, { command: 'deploy' }])
    assert.throws(() => planWorkforce(claim), /INPUT_DENIED/);
  const report = planWorkforce();
  assert.equal(report.constraints.productionHold, true);
  assert.equal(report.constraints.automaticReplicationAllowed, false);
  assert.equal(report.neuralIntegration.distributedClusterConnected, false);
});
test('capacity planning leaves the caller input unchanged and rejects invalid counters', () => {
  const input = Object.freeze({ requestedAgents: 100, requestedConcurrency: 2, queuedTasks: 3 });
  assert.equal(planWorkforce(input).plannedConcurrentSlots, 2);
  assert.deepEqual(input, { requestedAgents: 100, requestedConcurrency: 2, queuedTasks: 3 });
  for (const bad of [NaN, Infinity, -1, '4', 1.2])
    assert.throws(() => planWorkforce({ requestedConcurrency: bad }));
});
