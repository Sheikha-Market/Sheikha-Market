'use strict';

const {
  relationshipDictionary,
  buildExpansionPlan,
  governedRegisterFederation,
  buildUniversalRegistryGraphV2,
  buildDynamicFederationRegistryV2Report,
  evaluatePolicy
} = require('../core/dynamic-federation-registry/sheikha-dynamic-federation-registry-v2');

describe('Sheikha Dynamic Federation Registry V2', () => {
  test('expands a federation through all governed registry layers', () => {
    const result = governedRegisterFederation({
      type: 'OPERATING_SYSTEM',
      name: 'Haiku',
      familyName: 'BSD',
      actor: 'test-suite',
      reason: 'governed expansion test'
    });

    expect(result.system).toBe('SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_V2');
    expect(result.status).toBe('ACTIVE');
    expect(result.decision).toBe('APPROVED');
    expect(result.record.federation.status).toBe('REGISTERED');
    expect(result.record.governance.internalRegistryWriteAllowed).toBe(true);
    expect(result.record.governance.externalSystemWriteAllowed).toBe(false);

    expect(result.record.expansion.industrialClusters.length).toBeGreaterThan(5);
    expect(result.record.expansion.capabilityClusters.length).toBeGreaterThan(1);
    expect(result.record.expansion.apiClusters.length).toBeGreaterThan(1);
    expect(result.record.expansion.sdkClusters.length).toBeGreaterThan(1);
    expect(result.record.expansion.runtimeClusters.length).toBeGreaterThan(1);
    expect(result.record.expansion.aiClusters.length).toBeGreaterThan(1);
    expect(result.record.expansion.knowledgeClusters.length).toBeGreaterThan(1);
    expect(result.record.expansion.governanceClusters.length).toBeGreaterThan(1);
    expect(result.record.expansion.inspectorClusters.length).toBeGreaterThan(1);

    expect(result.record.events[0].action).toBe('FEDERATION_REGISTRATION_APPROVED');
    expect(result.pipeline.map((stage) => stage.stage)).toEqual([
      'READ',
      'VALIDATE',
      'POLICY_EVALUATION',
      'HUMAN_REVIEW',
      'APPROVE',
      'WRITE',
      'AUDIT',
      'PUBLISH_EVENT'
    ]);
  });

  test('blocks direct writes to real systems and keeps them outside registry writes', () => {
    const policy = evaluatePolicy({
      type: 'OPERATING_SYSTEM',
      name: 'UnsafeOS',
      directSystemWrite: true
    });
    const result = governedRegisterFederation({
      type: 'OPERATING_SYSTEM',
      name: 'UnsafeOS',
      directSystemWrite: true
    });

    expect(policy.decision).toBe('BLOCKED');
    expect(policy.allowedToWriteRegistry).toBe(false);
    expect(result.status).toBe('BLOCKED');
    expect(result.pipeline.find((stage) => stage.stage === 'WRITE').status).toBe('SKIPPED');
    expect(result.audit[0].payload.validation.errors).toContain('DIRECT_SYSTEM_WRITE_FORBIDDEN');
  });

  test('requires approval for high impact internal registry writes', () => {
    const review = governedRegisterFederation({
      type: 'CLOUD_PLATFORM',
      name: 'ReviewOnlyCloud',
      highImpactAction: true
    });
    const approved = governedRegisterFederation({
      type: 'CLOUD_PLATFORM',
      name: 'ApprovedCloud',
      highImpactAction: true,
      approvedByHuman: true
    });

    expect(review.status).toBe('REVIEW_REQUIRED');
    expect(review.pipeline.find((stage) => stage.stage === 'HUMAN_REVIEW').status).toBe('REQUIRED');
    expect(approved.status).toBe('ACTIVE');
    expect(approved.pipeline.find((stage) => stage.stage === 'HUMAN_REVIEW').status).toBe('APPROVED');
  });

  test('builds universal graph and relationship dictionary coverage', () => {
    const plan = buildExpansionPlan({
      type: 'AI_FRAMEWORK',
      name: 'SheikhaAgenticAI'
    });
    const graph = buildUniversalRegistryGraphV2();
    const report = buildDynamicFederationRegistryV2Report();

    expect(plan.federation.blueprint).toBe('blueprint-ai-framework');
    expect(plan.graph.nodes.length).toBeGreaterThan(20);
    expect(relationshipDictionary).toContain('ISOLATED_FROM');
    expect(relationshipDictionary).toContain('SUBSCRIBES');
    expect(graph.system).toBe('SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_GRAPH_V2');
    expect(graph.summary.records).toBeGreaterThanOrEqual(2);
    expect(report.governance.externalSystemWriteAllowed).toBe(false);
    expect(report.governance.internalRegistryWriteAllowedAfterGovernance).toBe(true);
  });
});
