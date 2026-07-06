'use strict';

const {
  buildHumanConsciousnessStewardshipReport
} = require('../human-consciousness-stewardship/sheikha-human-consciousness-stewardship-v1');
const {
  buildHumanDevelopmentFramework
} = require('../human-development/sheikha-human-development-framework-v1');
const {
  buildCivilizationalOperatingPlatform
} = require('../civilizational-operating-platform/sheikha-civilizational-operating-platform-v1');

const PLATFORM_PILLARS = Object.freeze([
  {
    pillar: 'Human Development',
    purpose: 'Support learning, systematic thinking, skill acquisition, cooperation, creativity, and leadership.'
  },
  {
    pillar: 'Knowledge Organization',
    purpose: 'Organize multi-domain knowledge so it is searchable, reviewable, reusable, and connected.'
  },
  {
    pillar: 'Experience Reuse',
    purpose: 'Transform practical experience and lessons learned into reusable institutional knowledge.'
  },
  {
    pillar: 'Governed Decision Support',
    purpose: 'Analyze evidence, options, risks, tradeoffs, and impact without replacing human responsibility.'
  },
  {
    pillar: 'Approved Execution',
    purpose: 'Connect approved decisions to Runtime, Federation, Enterprise Platform, Marketplace, APIs, and Automation.'
  },
  {
    pillar: 'Continuous Improvement',
    purpose: 'Measure outcomes, update knowledge, and improve work through governed feedback loops.'
  }
]);

const PLATFORM_SEQUENCE = Object.freeze([
  'Knowledge Platform',
  'Decision Support Platform',
  'Enterprise Platform',
  'Commercial Platform',
  'Development Platform',
  'Civilizational Platform'
]);

const GOVERNED_RECOMMENDATION_FLOW = Object.freeze([
  'Collect',
  'Validate',
  'Analyze',
  'Review',
  'Human Approval',
  'Execute',
  'Audit',
  'Improve'
]);

const EXECUTION_INTEGRATIONS = Object.freeze([
  'Runtime',
  'Federation',
  'Enterprise Platform',
  'Engine Registry',
  'Production Platform',
  'Marketplace',
  'APIs',
  'Automation'
]);

function buildPillarRegistry() {
  return PLATFORM_PILLARS.map((item, index) => ({
    id: `HCKC-P${String(index + 1).padStart(2, '0')}`,
    ...item,
    status: 'ACTIVE',
    humanCentered: true
  }));
}

function validateHumanCenteredKnowledgeCivilizationPlatform(report) {
  const requiredBoundaries = [
    report.status === 'ACTIVE',
    report.claims.machineConsciousnessClaimed === false,
    report.claims.selfAwarenessClaimed === false,
    report.claims.agiClaimed === false,
    report.claims.asiClaimed === false,
    report.governance.humanApprovalRequiredForHighImpact === true,
    report.governance.noAutomaticReligiousRuling === true,
    report.governance.noHarm === true,
    report.linkedLayers.humanDevelopmentFramework.status === 'ACTIVE',
    report.linkedLayers.humanConsciousnessStewardship.status === 'ACTIVE',
    report.linkedLayers.civilizationalOperatingPlatform.status === 'ACTIVE'
  ];

  const blockedChecks = requiredBoundaries.filter((passed) => !passed).length;

  return {
    system: 'SHEIKHA_HUMAN_CENTERED_KNOWLEDGE_CIVILIZATION_PLATFORM_VALIDATOR_V1',
    status: blockedChecks ? 'BLOCKED' : 'PASSED',
    pillars: report.pillars.length,
    platformStages: report.platformSequence.length,
    recommendationFlowSteps: report.governedRecommendationFlow.length,
    executionIntegrations: report.executionIntegrations.length,
    blockedChecks
  };
}

function buildHumanCenteredKnowledgeCivilizationPlatform(options = {}) {
  const humanDevelopmentFramework =
    options.humanDevelopmentFramework || buildHumanDevelopmentFramework({
      source: 'human_civilizational_knowledge',
      purpose: 'earth_development_and_beneficial_decision_support'
    });
  const humanConsciousnessStewardship =
    options.humanConsciousnessStewardship || buildHumanConsciousnessStewardshipReport();
  const civilizationalOperatingPlatform =
    options.civilizationalOperatingPlatform || buildCivilizationalOperatingPlatform({
      humanConsciousnessStewardship,
      humanDevelopmentFramework
    });

  const report = {
    system: 'SHEIKHA_HUMAN_CENTERED_KNOWLEDGE_CIVILIZATION_PLATFORM_V1',
    status: 'ACTIVE',
    mode: 'HUMAN_CENTERED_KNOWLEDGE_CIVILIZATION_PLATFORM',
    decision: 'ACTIVE_GOVERNED_HUMAN_KNOWLEDGE_CIVILIZATION_INTEGRATION',
    covenant: 'Sheikha is a human-centered platform that uses software to organize knowledge, experience, decision support, cooperation, and beneficial execution. It does not claim human consciousness or self-awareness.',
    pillars: buildPillarRegistry(),
    platformSequence: PLATFORM_SEQUENCE,
    governedRecommendationFlow: GOVERNED_RECOMMENDATION_FLOW,
    executionIntegrations: EXECUTION_INTEGRATIONS.map((integration) => ({
      integration,
      status: 'SUPPORTED',
      externalMutationAllowedByDefault: false,
      humanApprovalRequiredForHighImpact: true
    })),
    linkedLayers: {
      humanDevelopmentFramework: {
        system: humanDevelopmentFramework.system,
        status: humanDevelopmentFramework.status,
        decision: humanDevelopmentFramework.decision
      },
      humanConsciousnessStewardship: {
        system: humanConsciousnessStewardship.system,
        status: humanConsciousnessStewardship.status,
        validation: humanConsciousnessStewardship.validation?.status
      },
      civilizationalOperatingPlatform: {
        system: civilizationalOperatingPlatform.system,
        status: civilizationalOperatingPlatform.status,
        validation: civilizationalOperatingPlatform.validation?.status,
        readiness: civilizationalOperatingPlatform.readiness?.overall
      }
    },
    claims: {
      machineConsciousnessClaimed: false,
      selfAwarenessClaimed: false,
      humanConsciousnessCreatedInsideSystem: false,
      agiClaimed: false,
      asiClaimed: false,
      infallibilityClaimed: false,
      unseenKnowledgeClaimed: false
    },
    governance: {
      humanConsciousnessOwner: 'human',
      systemRole: 'tool',
      humanApprovalRequiredForHighImpact: true,
      noAutomaticReligiousRuling: true,
      religiousRulingsRequireQualifiedScholars: true,
      medicalAdviceRequiresQualifiedHuman: true,
      legalAdviceRequiresQualifiedHuman: true,
      commercialExecutionRequiresApproval: true,
      externalMutationDisabledByDefault: true,
      auditRequired: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    readiness: {
      humanCenteredKnowledgePlatformReady: true,
      governedDecisionSupportReady: true,
      enterpriseExecutionBridgeReady: true,
      continuousImprovementReady: true,
      overall: 'HUMAN_CENTERED_KNOWLEDGE_CIVILIZATION_PLATFORM_READY'
    },
    timestamp: new Date().toISOString()
  };

  return {
    ...report,
    validation: validateHumanCenteredKnowledgeCivilizationPlatform(report)
  };
}

module.exports = {
  PLATFORM_PILLARS,
  PLATFORM_SEQUENCE,
  GOVERNED_RECOMMENDATION_FLOW,
  EXECUTION_INTEGRATIONS,
  buildPillarRegistry,
  validateHumanCenteredKnowledgeCivilizationPlatform,
  buildHumanCenteredKnowledgeCivilizationPlatform
};
