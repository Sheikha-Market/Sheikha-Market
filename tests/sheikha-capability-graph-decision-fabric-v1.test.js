'use strict';

const {
  SheikhaCapabilityGraphDecisionFabric,
  LIFECYCLE_STAGES,
  DECISIONS
} = require('../runtime/sheikha-universal-production-integration/intelligence/sheikha-capability-graph-decision-fabric');

test('activates capability graph, dependency graph, lifecycle, and decision engine', () => {
  const fabric = new SheikhaCapabilityGraphDecisionFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_CAPABILITY_GRAPH_DECISION');
  expect(status.layerRank).toBe('ABOVE_CAPABILITY_SDK_MCP_FEDERATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);

  expect(status.capabilityGraph.nodes.length).toBeGreaterThan(20);
  expect(status.capabilityGraph.edges.length).toBeGreaterThan(20);
  expect(status.dependencyGraph.nodes).toContain('registry');
  expect(status.dependencyGraph.nodes).toContain('master-log');
  expect(status.dependencyGraph.nodes).toContain('inspector');

  expect(status.lifecycle.stages).toHaveLength(LIFECYCLE_STAGES.length);
  expect(status.lifecycle.stages.every((x) => x.governed)).toBe(true);

  expect(status.decisionEngine.supportedDecisions).toEqual(DECISIONS);
  expect(status.decisionEngine.sample.decision).toBe('ALLOW');
  expect(status.boundaries.noUngovernedDecision).toBe(true);
});

test('decision engine returns governed operational decisions', () => {
  const fabric = new SheikhaCapabilityGraphDecisionFabric();

  expect(fabric.decide({ governed: false }).decision).toBe('DENY');
  expect(fabric.decide({ governed: true, needsRecovery: true }).decision).toBe('RECOVER');
  expect(fabric.decide({ governed: true, needsUpgrade: true }).decision).toBe('UPGRADE');
  expect(fabric.decide({ governed: true, needsScale: true }).decision).toBe('SCALE');
  expect(fabric.decide({ governed: true }).decision).toBe('ALLOW');
});
