'use strict';

const PRINCIPLES = Object.freeze([
  'truth',
  'justice',
  'trust',
  'no_harm',
  'benefit',
  'accountability',
  'auditability',
  'human_responsibility'
]);

function status() {
  return {
    system: 'SHEIKHA_CIVILIZATION_GOVERNANCE_V2',
    status: 'ACTIVE',
    level: 'CIVILIZATION_GOVERNANCE_APEX',
    above: 'SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V1',
    enforcementApex: 'SHEIKHA_COVENANT_GOVERNANCE_APEX_V1',
    stewardshipApex: 'SHEIKHA_CIVILIZATION_STEWARDSHIP_APEX_V1',
    commandIntelligencePlane: 'SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1',
    principles: PRINCIPLES,
    registries: [
      'decision-registry',
      'initiative-registry',
      'stakeholder-registry',
      'impact-objectives',
      'governance-evidence'
    ],
    boundaries: {
      governanceBeforeInitiative: true,
      noAuthorityClaimWithoutMandate: true,
      noPublicImpactClaimWithoutEvidence: true,
      humanApprovalForHighRisk: true,
      auditEveryDecision: true
    }
  };
}

function decisionRegistry() {
  return {
    registry: 'SHEIKHA_CIVILIZATION_DECISION_REGISTRY_V1',
    status: 'ACTIVE',
    fields: [
      'decisionId',
      'scope',
      'principle',
      'riskLevel',
      'approvalRequired',
      'evidenceRequired',
      'auditTrail'
    ]
  };
}

function initiativeRegistry() {
  return {
    registry: 'SHEIKHA_CIVILIZATION_INITIATIVE_REGISTRY_V1',
    status: 'ACTIVE',
    lifecycle: [
      'proposal',
      'governance-review',
      'approval',
      'execution',
      'measurement',
      'audit',
      'improvement'
    ]
  };
}

function stakeholderRegistry() {
  return {
    registry: 'SHEIKHA_STAKEHOLDER_GOVERNANCE_REGISTRY_V1',
    status: 'ACTIVE',
    stakeholderTypes: [
      'individual',
      'family',
      'community',
      'organization',
      'market',
      'public-sector',
      'environment',
      'knowledge-sector'
    ]
  };
}

function impactObjectives() {
  return {
    registry: 'SHEIKHA_IMPACT_OBJECTIVES_REGISTRY_V1',
    status: 'ACTIVE',
    objectives: [
      'economic-benefit',
      'social-benefit',
      'knowledge-benefit',
      'operational-excellence',
      'environmental-responsibility',
      'risk-reduction',
      'continuous-improvement'
    ]
  };
}

module.exports = {
  status,
  decisionRegistry,
  initiativeRegistry,
  stakeholderRegistry,
  impactObjectives
};
