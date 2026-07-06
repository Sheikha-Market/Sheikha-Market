'use strict';

const PANELS = Object.freeze([
  'governance',
  'portfolio',
  'runtime',
  'saas',
  'cloud',
  'knowledge',
  'risk',
  'impact',
  'evidence',
  'executive-scorecard'
]);

function status() {
  return {
    system: 'SHEIKHA_EXECUTIVE_MISSION_CONTROL_V1',
    status: 'ACTIVE',
    level: 'EXECUTIVE_COMMAND_APEX',
    above: 'SHEIKHA_CIVILIZATION_GOVERNANCE_V2',
    integratedStewardshipApex: 'SHEIKHA_CIVILIZATION_STEWARDSHIP_APEX_V1',
    integratedIntelligencePlane: 'SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1',
    panels: PANELS,
    boundaries: {
      governanceBeforeCommand: true,
      noExecutionWithoutEvidence: true,
      noHighRiskActionWithoutHumanApproval: true,
      noFalseImpactClaim: true,
      auditEveryExecutiveDecision: true
    }
  };
}

function scorecard(input = {}) {
  const scores = {
    governanceScore: Number(input.governanceScore ?? 98),
    executionScore: Number(input.executionScore ?? 96),
    impactScore: Number(input.impactScore ?? 94),
    knowledgeScore: Number(input.knowledgeScore ?? 96),
    reliabilityScore: Number(input.reliabilityScore ?? 97),
    securityScore: Number(input.securityScore ?? 96),
    improvementScore: Number(input.improvementScore ?? 95)
  };

  const values = Object.values(scores).map((v) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0)));
  const executiveReadinessScore = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));

  return {
    engine: 'SHEIKHA_EXECUTIVE_SCORECARD_V1',
    status: 'ACTIVE',
    scores: { ...scores, executiveReadinessScore },
    decision:
      executiveReadinessScore >= 95 ? 'EXECUTIVE_READY'
      : executiveReadinessScore >= 85 ? 'READY_WITH_GOVERNED_IMPROVEMENT'
      : 'REQUIRES_EXECUTIVE_REVIEW'
  };
}

function evidence() {
  return {
    registry: 'SHEIKHA_UNIFIED_EVIDENCE_FABRIC_V1',
    status: 'ACTIVE',
    evidenceTypes: [
      'decisions',
      'approvals',
      'audit-events',
      'governance-decisions',
      'runtime-health',
      'test-results',
      'deployment-events',
      'impact-measurements'
    ]
  };
}

function portfolio() {
  return {
    registry: 'SHEIKHA_STRATEGIC_PORTFOLIO_INTELLIGENCE_V1',
    status: 'ACTIVE',
    portfolioObjects: [
      'programs',
      'projects',
      'initiatives',
      'roadmaps',
      'dependencies',
      'risks',
      'outcomes'
    ],
    states: ['on-track', 'at-risk', 'delayed', 'completed']
  };
}

module.exports = {
  status,
  scorecard,
  evidence,
  portfolio
};
