'use strict';

const {
  buildHumanConsciousnessStewardshipReport
} = require('../human-consciousness-stewardship/sheikha-human-consciousness-stewardship-v1');
const {
  buildHumanDevelopmentFramework
} = require('../human-development/sheikha-human-development-framework-v1');

const CIVILIZATIONAL_ARCHITECTURE = Object.freeze([
  {
    level: 'L01',
    layer: 'Human Layer',
    scope: ['Faith And Values', 'Knowledge', 'Reason', 'Experience', 'Skill', 'Responsibility'],
    authority: 'HUMAN'
  },
  {
    level: 'L02',
    layer: 'Human Knowledge Layer',
    scope: ['Knowledge', 'Experience', 'Best Practices', 'Lessons Learned', 'Mental Models'],
    authority: 'HUMAN_WITH_SYSTEM_SUPPORT'
  },
  {
    level: 'L03',
    layer: 'Human Cognitive Modeling Layer',
    scope: ['Knowledge Modeling', 'Experience Modeling', 'Decision Modeling', 'Process Modeling', 'Enterprise Modeling'],
    authority: 'SYSTEM_MODELING_ONLY'
  },
  {
    level: 'L04',
    layer: 'Governance And Policy Layer',
    scope: ['Governance', 'Policies', 'Risk Management', 'Compliance', 'Audit'],
    authority: 'GOVERNED_HUMAN_REVIEW'
  },
  {
    level: 'L05',
    layer: 'Decision Support Layer',
    scope: ['Analysis', 'Reasoning Support', 'Comparison', 'Alternatives', 'Impact Measurement'],
    authority: 'SUPPORT_ONLY'
  },
  {
    level: 'L06',
    layer: 'Enterprise Execution Platform',
    scope: ['Automation', 'Workflow', 'Marketplace', 'ERP', 'CRM', 'SCM', 'Knowledge', 'AI Services'],
    authority: 'APPROVED_EXECUTION'
  },
  {
    level: 'L07',
    layer: 'Infrastructure And Runtime',
    scope: ['Kernel', 'Runtime', 'Registry', 'Engine Registry', 'Federation', 'Observability', 'Security', 'APIs'],
    authority: 'CONTROLLED_RUNTIME'
  }
]);

const CIVILIZATIONAL_DOMAINS = Object.freeze([
  'islamic-sciences-and-governance',
  'arabic-language',
  'medicine',
  'psychology',
  'education',
  'management',
  'economics',
  'commerce',
  'industry',
  'agriculture',
  'energy',
  'technology',
  'software',
  'cybersecurity',
  'quality',
  'innovation',
  'sustainability',
  'society',
  'enterprise-operations'
]);

const CIVILIZATIONAL_LIFECYCLE = Object.freeze([
  'Observe Reality',
  'Capture Human Knowledge',
  'Validate Evidence',
  'Organize Knowledge',
  'Connect Domains',
  'Run Multi-Domain Analysis',
  'Generate Alternatives',
  'Apply Governance',
  'Require Human Approval',
  'Support Execution',
  'Measure Outcomes',
  'Enrich Knowledge Base'
]);

const CIVILIZATIONAL_PRINCIPLES = Object.freeze([
  'Worship Allah Alone',
  'Serve Human Dignity',
  'No Harm',
  'Justice',
  'Trustworthiness',
  'Truthfulness',
  'Excellence',
  'Transparency',
  'Reviewability',
  'Human Responsibility'
]);

function buildDomainMap() {
  return CIVILIZATIONAL_DOMAINS.map((domain, index) => ({
    id: `CIV-DOM-${String(index + 1).padStart(3, '0')}`,
    domain,
    status: 'ACTIVE',
    requirements: [
      'Knowledge Model',
      'Governance Policy',
      'Evidence Standard',
      'Impact Metrics',
      'Cross Domain Relations'
    ],
    highImpactHumanReviewRequired: true
  }));
}

function buildCivilizationalRelations() {
  return CIVILIZATIONAL_ARCHITECTURE.flatMap((layer, index) => {
    if (index === CIVILIZATIONAL_ARCHITECTURE.length - 1) {
      return [];
    }

    return [{
      from: layer.level,
      to: CIVILIZATIONAL_ARCHITECTURE[index + 1].level,
      type: 'GOVERNS_AND_ENABLES',
      reversible: false
    }];
  });
}

function validateCivilizationalOperatingPlatform(report) {
  const missingCoreClaims = [
    report.claims.systemConsciousnessClaimed === false,
    report.claims.machineConsciousnessClaimed === false,
    report.claims.agiClaimed === false,
    report.claims.asiClaimed === false,
    report.governance.noAutomaticReligiousRuling === true,
    report.governance.humanApprovalRequiredForHighImpact === true,
    report.governance.noHarm === true,
    report.linkedLayers.humanConsciousnessStewardship.status === 'ACTIVE',
    report.linkedLayers.humanDevelopmentFramework.status === 'ACTIVE'
  ].filter((passed) => !passed);

  return {
    system: 'SHEIKHA_CIVILIZATIONAL_OPERATING_PLATFORM_VALIDATOR_V1',
    status: missingCoreClaims.length ? 'BLOCKED' : 'PASSED',
    architectureLayers: report.architecture.length,
    domains: report.domainMap.length,
    lifecycleSteps: report.lifecycle.length,
    relations: report.relations.length,
    principles: report.principles.length,
    blockedChecks: missingCoreClaims.length
  };
}

function buildCivilizationalOperatingPlatform(options = {}) {
  const humanConsciousnessStewardship =
    options.humanConsciousnessStewardship || buildHumanConsciousnessStewardshipReport();
  const humanDevelopmentFramework =
    options.humanDevelopmentFramework || buildHumanDevelopmentFramework({
      source: 'human_civilizational_knowledge',
      purpose: 'earth_development_and_beneficial_decision_support'
    });

  const report = {
    system: 'SHEIKHA_CIVILIZATIONAL_OPERATING_PLATFORM_V1',
    status: 'ACTIVE',
    mode: 'HUMAN_CENTERED_CIVILIZATIONAL_OPERATING_PLATFORM',
    purpose: 'Unify human knowledge, experience, governance, decision support, enterprise execution, and impact measurement for beneficial civilization development.',
    charter: 'Sheikha is a human-centered platform that organizes knowledge and experience, supports learning and decision making, and converts governed knowledge into beneficial work without claiming machine consciousness.',
    principles: CIVILIZATIONAL_PRINCIPLES,
    architecture: CIVILIZATIONAL_ARCHITECTURE,
    domainMap: buildDomainMap(),
    lifecycle: CIVILIZATIONAL_LIFECYCLE,
    relations: buildCivilizationalRelations(),
    linkedLayers: {
      humanConsciousnessStewardship: {
        system: humanConsciousnessStewardship.system,
        status: humanConsciousnessStewardship.status,
        validation: humanConsciousnessStewardship.validation?.status,
        readiness: humanConsciousnessStewardship.readiness?.overall
      },
      humanDevelopmentFramework: {
        system: humanDevelopmentFramework.system,
        status: humanDevelopmentFramework.status,
        decision: humanDevelopmentFramework.decision,
        mode: humanDevelopmentFramework.mode
      },
      enterpriseRuntime: 'SUPPORTED',
      governanceFabric: 'SUPPORTED',
      engineRegistry: 'SUPPORTED',
      knowledgeGraph: 'SUPPORTED',
      eventBus: 'SUPPORTED',
      audit: 'SUPPORTED',
      marketplace: 'SUPPORTED'
    },
    claims: {
      systemConsciousnessClaimed: false,
      machineConsciousnessClaimed: false,
      humanConsciousnessCreatedInsideSystem: false,
      agiClaimed: false,
      asiClaimed: false,
      infallibilityClaimed: false,
      unseenKnowledgeClaimed: false
    },
    governance: {
      readOnlyByDefault: true,
      noExternalMutation: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noAutomaticReligiousRuling: true,
      religiousRulingsRequireQualifiedScholars: true,
      medicalAdviceRequiresQualifiedHuman: true,
      legalAdviceRequiresQualifiedHuman: true,
      commercialExecutionRequiresApproval: true,
      humanApprovalRequiredForHighImpact: true,
      auditRequired: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    outputs: {
      knowledgeMaps: true,
      experienceModels: true,
      decisionSupportPackets: true,
      governanceReviewPackets: true,
      impactReports: true,
      improvementBacklog: true
    },
    readiness: {
      humanCenteredPlatformReady: true,
      civilizationalKnowledgeIntegrationReady: true,
      governanceIntegrationReady: true,
      enterpriseExecutionIntegrationReady: true,
      impactMeasurementReady: true,
      overall: 'CIVILIZATIONAL_OPERATING_PLATFORM_READY'
    },
    timestamp: new Date().toISOString()
  };

  return {
    ...report,
    validation: validateCivilizationalOperatingPlatform(report)
  };
}

module.exports = {
  CIVILIZATIONAL_ARCHITECTURE,
  CIVILIZATIONAL_DOMAINS,
  CIVILIZATIONAL_LIFECYCLE,
  CIVILIZATIONAL_PRINCIPLES,
  buildDomainMap,
  buildCivilizationalRelations,
  validateCivilizationalOperatingPlatform,
  buildCivilizationalOperatingPlatform
};
