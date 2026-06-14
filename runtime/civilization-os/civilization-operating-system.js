'use strict';

const REGISTRIES = Object.freeze({
  vision: { status: 'ACTIVE', fields: ['vision', 'purpose', 'impact', 'priority'] },
  impact: { status: 'ACTIVE', fields: ['economic', 'social', 'knowledge', 'operational', 'environmental'] },
  resources: { status: 'ACTIVE', fields: ['human', 'financial', 'knowledge', 'technical', 'operational'] },
  risks: { status: 'ACTIVE', fields: ['operational', 'security', 'legal', 'technical', 'commercial'] },
  policies: { status: 'ACTIVE', fields: ['policy-as-code', 'compliance-as-code', 'governance-as-code'] },
  knowledge: { status: 'ACTIVE', fields: ['memory', 'store', 'graph', 'vector', 'postgresql'] },
  improvement: { status: 'ACTIVE', fields: ['lessons-learned', 'optimization', 'corrective-actions', 'preventive-actions'] }
});

function status() {
  return {
    system: 'SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V1',
    status: 'ACTIVE',
    level: 'CIVILIZATION_APEX',
    above: 'SHEIKHA_GLOBAL_CONTROL_PLANE_V1',
    purpose: 'governed lifecycle for development, impact, resources, risk, knowledge, and continuous improvement',
    registries: REGISTRIES,
    boundaries: {
      governanceBeforeExecution: true,
      noHarm: true,
      justice: true,
      auditEveryDecision: true,
      humanApprovalForHighRisk: true,
      noFalseAuthorityClaim: true
    }
  };
}

function registries() {
  return {
    registry: 'SHEIKHA_CIVILIZATION_REGISTRY_FABRIC_V1',
    status: 'ACTIVE',
    registries: REGISTRIES
  };
}

function lifecycle() {
  return {
    system: 'SHEIKHA_CIVILIZATION_LIFECYCLE_V1',
    status: 'ACTIVE',
    stages: [
      'vision',
      'planning',
      'governance-review',
      'execution-approval',
      'execution',
      'measurement',
      'audit',
      'improvement',
      'knowledge-update'
    ]
  };
}

function score(input = {}) {
  const values = [
    Number(input.executionScore ?? 95),
    Number(input.governanceScore ?? 98),
    Number(input.knowledgeScore ?? 95),
    Number(input.reliabilityScore ?? 97),
    Number(input.impactScore ?? 90),
    Number(input.improvementScore ?? 92)
  ];

  const normalized = values.map((v) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0)));
  const total = normalized.reduce((a, b) => a + b, 0);
  const civilizationReadinessScore = Number((total / normalized.length).toFixed(2));

  return {
    engine: 'SHEIKHA_CIVILIZATION_SCORE_ENGINE_V1',
    status: 'ACTIVE',
    scores: {
      executionScore: normalized[0],
      governanceScore: normalized[1],
      knowledgeScore: normalized[2],
      reliabilityScore: normalized[3],
      impactScore: normalized[4],
      improvementScore: normalized[5],
      civilizationReadinessScore
    },
    decision:
      civilizationReadinessScore >= 95 ? 'APEX_READY'
      : civilizationReadinessScore >= 85 ? 'READY_WITH_IMPROVEMENT'
      : 'REQUIRES_GOVERNED_IMPROVEMENT'
  };
}

module.exports = {
  status,
  registries,
  lifecycle,
  score
};
