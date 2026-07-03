'use strict';

const {
  buildFederatedSystemGraphV2,
  relationTypes,
  validateDirectedGraph
} = require('../core/federated-system-graph/sheikha-federated-system-graph-v2');

describe('Sheikha Federated System Graph V2', () => {
  test('builds a governed directed graph above all operating fabrics', () => {
    const report = buildFederatedSystemGraphV2();
    const nodeIds = report.graph.nodes.map((node) => node.id);
    const edgeTypes = new Set(report.graph.edges.map((edge) => edge.type));

    expect(report.system).toBe('SHEIKHA_FEDERATED_SYSTEM_GRAPH_V2');
    expect(report.status).toBe('ACTIVE');
    expect(report.mode).toBe('READ_ONLY_DIRECTED_FEDERATED_SYSTEM_GRAPH');
    expect(report.readiness.overall).toBe('FEDERATED_SYSTEM_GRAPH_V2_READY');

    expect(nodeIds).toContain('l00-physical-infrastructure');
    expect(nodeIds).toContain('l15-global-sovereign-federation');
    expect(nodeIds).toContain('linux-kernel-federation');
    expect(nodeIds).toContain('rtos-federation');
    expect(nodeIds).toContain('kubernetes');
    expect(nodeIds).toContain('nodejs');
    expect(nodeIds).toContain('knowledge-graph');
    expect(nodeIds).toContain('human-review');

    relationTypes.forEach((type) => {
      expect(edgeTypes.has(type)).toBe(true);
    });

    expect(report.summary.layerCount).toBe(16);
    expect(report.summary.kernelFamilyCount).toBe(5);
    expect(report.summary.nodeCount).toBeGreaterThan(60);
    expect(report.summary.edgeCount).toBeGreaterThan(120);
  });

  test('validates edges and preserves production safety gates', () => {
    const report = buildFederatedSystemGraphV2();
    const validation = validateDirectedGraph(report.graph);
    const governanceEdges = report.graph.edges.filter((edge) => (
      edge.from === 'l13-governance-federation' &&
      edge.type === 'GOVERNS'
    ));

    expect(validation.valid).toBe(true);
    expect(validation.orphanEdges).toEqual([]);
    expect(validation.missingRelationTypes).toEqual([]);

    expect(report.readiness.productionIntegrationReady).toBe(true);
    expect(report.sourceFabrics.productionIntegration.decision)
      .toBe('READY_FOR_CONTROLLED_PRODUCTION_INTEGRATION');
    expect(report.governance.noHighImpactActionAllowed).toBe(true);
    expect(report.governance.noExternalConnectionOpened).toBe(true);
    expect(report.governance.noHarm).toBe(true);
    expect(governanceEdges.length).toBeGreaterThan(20);
  });
});
