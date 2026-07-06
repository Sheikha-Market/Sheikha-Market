'use strict';

const knowledgeDomains = Object.freeze([
  'islamic-governance',
  'arabic-language',
  'medicine',
  'psychology',
  'education',
  'economics',
  'commerce',
  'engineering',
  'technology',
  'sustainability',
  'society',
  'enterprise'
]);

function buildHumanDevelopmentFramework(input = {}) {
  return {
    system: 'SHEIKHA_HUMAN_DEVELOPMENT_FRAMEWORK_V1',
    status: 'ACTIVE',
    mode: 'HUMAN_CENTERED_KNOWLEDGE_ORGANIZATION',
    principle: {
      creator: 'الله سبحانه وتعالى',
      humanConsciousnessOwner: 'human',
      systemRole: 'tool',
      noClaimOfMachineConsciousness: true,
      noClaimOfInfallibility: true,
      noClaimOfUnseenKnowledge: true,
      noHarm: true
    },
    mission: {
      humanDevelopment: true,
      knowledgeOrganization: true,
      experienceDocumentation: true,
      decisionSupport: true,
      earthDevelopment: true,
      sustainableBenefit: true
    },
    domains: knowledgeDomains,
    pipeline: [
      'human_observation',
      'knowledge_capture',
      'evidence_validation',
      'domain_classification',
      'governance_review',
      'multi_domain_analysis',
      'alternatives_generation',
      'human_approval',
      'execution_support',
      'impact_measurement',
      'knowledge_improvement'
    ],
    governance: {
      humanReviewRequiredForHighImpact: true,
      externalMutationDisabledByDefault: true,
      medicalAdviceRequiresQualifiedHuman: true,
      legalAdviceRequiresQualifiedHuman: true,
      religiousRulingsRequireQualifiedScholars: true,
      commercialExecutionRequiresApproval: true
    },
    integration: {
      runtime: true,
      governance: true,
      knowledgeGraph: true,
      engineRegistry: true,
      eventBus: true,
      audit: true,
      enterprisePlatform: true
    },
    input: {
      source: input.source || 'human_experience',
      purpose: input.purpose || 'beneficial_decision_support'
    },
    decision: 'READY_FOR_GOVERNED_HUMAN_KNOWLEDGE_INTEGRATION'
  };
}

module.exports = {
  knowledgeDomains,
  buildHumanDevelopmentFramework
};
