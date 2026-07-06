'use strict';

const HUMAN_DEVELOPMENT_CHAIN = Object.freeze([
  'Revelation-Guided Values',
  'Fitrah And Reason',
  'Family Formation',
  'Education',
  'Community Experience',
  'Scientific Method',
  'Professional Practice',
  'Ethical Reflection',
  'Human Decision',
  'Measured Impact',
  'Continuous Improvement'
]);

const STEWARDSHIP_LAYERS = Object.freeze([
  {
    layer: 'Tawhid And Worship Orientation',
    role: 'Keep purpose, humility, accountability, and worship of Allah as the highest frame.'
  },
  {
    layer: 'Human Dignity Layer',
    role: 'Preserve dignity, consent, privacy, justice, mercy, and responsible treatment of people.'
  },
  {
    layer: 'Knowledge Evidence Layer',
    role: 'Organize sources, evidence, uncertainty, provenance, and review status.'
  },
  {
    layer: 'Scientific And Domain Intelligence Layer',
    role: 'Support analysis across science, engineering, economy, society, medicine, and environment.'
  },
  {
    layer: 'Shariah Reference Governance Layer',
    role: 'Reference Quran, Sunnah, and guided scholarship with human scholarly review for rulings.'
  },
  {
    layer: 'Decision Support Layer',
    role: 'Generate options, risks, tradeoffs, and recommendations without replacing human authority.'
  },
  {
    layer: 'Execution Governance Layer',
    role: 'Require authorization, audit, and human approval for high-impact execution.'
  },
  {
    layer: 'Impact Measurement Layer',
    role: 'Measure benefit, harm prevention, fairness, operational outcomes, and community impact.'
  }
]);

const DOMAIN_REGISTRY = Object.freeze([
  {
    domain: 'Islamic Values And Shariah References',
    scope: ['Quran References', 'Sunnah References', 'Scholarly Review', 'Ethics'],
    automatedRulingsAllowed: false,
    humanScholarlyReviewRequired: true
  },
  {
    domain: 'Education And Human Development',
    scope: ['Learning', 'Skills', 'Mentorship', 'Family And Community Development'],
    automatedRulingsAllowed: false,
    humanScholarlyReviewRequired: false
  },
  {
    domain: 'Science And Research',
    scope: ['Evidence', 'Experiments', 'Peer Review', 'Research Reports'],
    automatedRulingsAllowed: false,
    humanScholarlyReviewRequired: false
  },
  {
    domain: 'Engineering And Operations',
    scope: ['Design', 'Safety', 'Quality', 'Reliability', 'Maintenance'],
    automatedRulingsAllowed: false,
    humanScholarlyReviewRequired: false
  },
  {
    domain: 'Economy And Commerce',
    scope: ['Markets', 'Contracts', 'Pricing', 'Revenue', 'Customer Value'],
    automatedRulingsAllowed: false,
    humanScholarlyReviewRequired: true
  },
  {
    domain: 'Society And Civilization Development',
    scope: ['Justice', 'Public Benefit', 'Community Issues', 'No Harm'],
    automatedRulingsAllowed: false,
    humanScholarlyReviewRequired: true
  }
]);

const DECISION_CYCLE = Object.freeze([
  'Ask',
  'Gather Context',
  'Classify Domain',
  'Retrieve Evidence',
  'Separate Facts From Assumptions',
  'Assess Benefit And Harm',
  'Generate Options',
  'Apply Governance',
  'Require Human Approval When High Impact',
  'Execute Only If Authorized',
  'Audit',
  'Measure Impact',
  'Improve Knowledge'
]);

const SAFETY_GUARDRAILS = Object.freeze([
  'No System Consciousness Claim',
  'No Human Replacement Claim',
  'No AGI Runtime Claim',
  'No ASI Runtime Claim',
  'No Automatic Religious Ruling',
  'No High Impact Action Without Human Approval',
  'No Hidden External Mutation',
  'No Harm',
  'Evidence Before Assertion',
  'Audit Before Expansion'
]);

function buildLayerReadiness() {
  return STEWARDSHIP_LAYERS.map((item, index) => ({
    id: `HCS-L${String(index + 1).padStart(2, '0')}`,
    ...item,
    status: 'ACTIVE',
    responsibility: 'SUPPORT_HUMAN_AWARENESS_AND_DECISION'
  }));
}

function validateHumanConsciousnessStewardshipReport(report) {
  const missingGuardrails = SAFETY_GUARDRAILS.filter((guardrail) =>
    !report.safetyGuardrails.includes(guardrail)
  );
  const invalidDomains = report.domainRegistry.filter((domain) =>
    domain.automatedRulingsAllowed === true
  );
  const requiredClaims = [
    report.claims.humanConsciousnessClaimed === false,
    report.claims.systemConsciousnessClaimed === false,
    report.claims.agiClaimed === false,
    report.claims.asiClaimed === false,
    report.authority.humanAuthority === true,
    report.authority.humanDecisionRequiredForHighImpact === true,
    report.authority.scholarReviewRequiredForReligiousRulings === true,
    report.governance.noHarm === true
  ];

  return {
    system: 'SHEIKHA_HUMAN_CONSCIOUSNESS_STEWARDSHIP_VALIDATOR_V1',
    status: missingGuardrails.length || invalidDomains.length || requiredClaims.includes(false)
      ? 'BLOCKED'
      : 'PASSED',
    stewardshipLayers: report.stewardshipLayers.length,
    developmentChainSteps: report.humanDevelopmentChain.length,
    domains: report.domainRegistry.length,
    decisionCycleSteps: report.decisionCycle.length,
    missingGuardrails,
    invalidDomains: invalidDomains.map((domain) => domain.domain)
  };
}

function buildHumanConsciousnessStewardshipReport(options = {}) {
  const stewardshipLayers = buildLayerReadiness();
  const report = {
    system: 'SHEIKHA_HUMAN_CONSCIOUSNESS_STEWARDSHIP_V1',
    status: 'ACTIVE',
    mode: 'HUMAN_STEWARDSHIP_SUPPORT_NOT_SYSTEM_CONSCIOUSNESS',
    purpose: 'Organize lawful knowledge, evidence, ethics, governance, and decision support for real human awareness and earth stewardship.',
    vision: 'Sheikha supports humans in learning, thinking, deciding, acting, measuring impact, and improving without claiming to possess human consciousness.',
    mission: [
      'Serve worship of Allah through lawful beneficial work.',
      'Support human dignity, justice, excellence, trust, truthfulness, and no harm.',
      'Help people and organizations organize knowledge and decisions for إعمار الأرض.',
      'Keep final responsibility with authorized humans.'
    ],
    claims: {
      humanConsciousnessClaimed: false,
      systemConsciousnessClaimed: false,
      agiClaimed: false,
      asiClaimed: false,
      sentienceClaimed: false,
      independentMoralAgencyClaimed: false
    },
    authority: {
      humanAuthority: true,
      humanDecisionRequiredForHighImpact: true,
      scholarReviewRequiredForReligiousRulings: true,
      automatedReligiousRulingsAllowed: false,
      automatedExternalExecutionAllowed: false,
      humanConsentRequiredForPersonalDataUse: true
    },
    humanDevelopmentChain: HUMAN_DEVELOPMENT_CHAIN,
    stewardshipLayers,
    domainRegistry: DOMAIN_REGISTRY,
    decisionCycle: DECISION_CYCLE,
    safetyGuardrails: SAFETY_GUARDRAILS,
    integrations: {
      enterpriseConstitution: 'SUPPORTED',
      enterpriseLifecycle: 'SUPPORTED',
      knowledgeGraph: 'SUPPORTED',
      governanceFabric: 'SUPPORTED',
      conversationEngine: 'SUPPORTED',
      inspector: 'SUPPORTED',
      extension: 'SUPPORTED_AS_CONTEXT_SOURCE'
    },
    outputs: {
      executiveReports: true,
      educationalGuidance: true,
      evidenceSummaries: true,
      riskAndImpactAnalysis: true,
      humanReviewPackets: true,
      auditRecords: true
    },
    readiness: {
      humanAwarenessSupportReady: true,
      knowledgeOrganizationReady: true,
      governanceReady: true,
      religiousRulingAutomationBlocked: true,
      highImpactHumanApprovalReady: true,
      noHarmGateReady: true,
      overall: 'HUMAN_CONSCIOUSNESS_STEWARDSHIP_READY'
    },
    governance: {
      readOnly: options.readOnly !== false,
      internalRegistryOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noGhaybClaims: true,
      noSystemConsciousnessClaim: true,
      noAutomaticFatwa: true,
      noHumanReplacement: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };

  return {
    ...report,
    validation: validateHumanConsciousnessStewardshipReport(report)
  };
}

module.exports = {
  HUMAN_DEVELOPMENT_CHAIN,
  STEWARDSHIP_LAYERS,
  DOMAIN_REGISTRY,
  DECISION_CYCLE,
  SAFETY_GUARDRAILS,
  buildLayerReadiness,
  validateHumanConsciousnessStewardshipReport,
  buildHumanConsciousnessStewardshipReport
};
