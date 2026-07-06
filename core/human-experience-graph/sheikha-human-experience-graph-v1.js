'use strict';

const {
  knowledgeDomains,
  buildHumanDevelopmentFramework
} = require('../human-development/sheikha-human-development-framework-v1');
const {
  buildHumanCenteredKnowledgeCivilizationPlatform
} = require(
  '../human-centered-knowledge-civilization-platform/sheikha-human-centered-knowledge-civilization-platform-v1'
);

const EXPERIENCE_TYPES = Object.freeze([
  'human-observation',
  'field-operation',
  'project-experience',
  'decision-record',
  'lesson-learned',
  'skill-practice',
  'customer-feedback',
  'research-note',
  'incident-learning',
  'community-need',
  'quality-finding',
  'innovation-hypothesis'
]);

const GOVERNANCE_CONTROLS = Object.freeze([
  'Consent And Privacy Review',
  'Evidence Validation',
  'Source Provenance',
  'Risk Classification',
  'Human Approval For High Impact',
  'Qualified Review For Sensitive Domains',
  'No Harm Gate',
  'Audit Trail'
]);

const IMPACT_METRICS = Object.freeze([
  'Learning Improvement',
  'Decision Quality',
  'Operational Benefit',
  'Risk Reduction',
  'Community Benefit',
  'Knowledge Reuse'
]);

const RELATION_TYPES = Object.freeze([
  'CLASSIFIED_AS',
  'GOVERNED_BY',
  'MEASURED_BY',
  'ENRICHES',
  'REQUIRES_REVIEW',
  'SUPPORTS_DECISION'
]);

function nodeId(prefix, value, index) {
  return `${prefix}-${String(index + 1).padStart(3, '0')}-${value.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
}

function buildExperienceNodes() {
  return EXPERIENCE_TYPES.map((type, index) => ({
    id: nodeId('experience', type, index),
    type: 'EXPERIENCE',
    label: type,
    status: 'ACTIVE',
    humanProvided: true,
    requiresConsentOrAuthority: true
  }));
}

function buildDomainNodes(domains = knowledgeDomains) {
  return domains.map((domain, index) => ({
    id: nodeId('domain', domain, index),
    type: 'DOMAIN',
    label: domain,
    status: 'ACTIVE',
    humanReviewRequiredForHighImpact: true
  }));
}

function buildGovernanceNodes() {
  return GOVERNANCE_CONTROLS.map((control, index) => ({
    id: nodeId('governance', control, index),
    type: 'GOVERNANCE_CONTROL',
    label: control,
    status: 'ACTIVE',
    mandatory: true
  }));
}

function buildImpactNodes() {
  return IMPACT_METRICS.map((metric, index) => ({
    id: nodeId('impact', metric, index),
    type: 'IMPACT_METRIC',
    label: metric,
    status: 'ACTIVE',
    measured: true
  }));
}

function buildExperienceGraphEdges(experienceNodes, domainNodes, governanceNodes, impactNodes) {
  const edges = [];

  experienceNodes.forEach((experience) => {
    domainNodes.forEach((domain) => {
      edges.push({
        from: experience.id,
        to: domain.id,
        type: 'CLASSIFIED_AS'
      });
    });

    governanceNodes.forEach((control) => {
      edges.push({
        from: experience.id,
        to: control.id,
        type: 'GOVERNED_BY'
      });
    });

    impactNodes.forEach((metric) => {
      edges.push({
        from: experience.id,
        to: metric.id,
        type: 'MEASURED_BY'
      });
    });
  });

  return edges;
}

function validateHumanExperienceGraph(report) {
  const nodeTypes = new Set(report.nodes.map((node) => node.type));
  const edgeTypes = new Set(report.edges.map((edge) => edge.type));
  const requiredNodeTypes = [
    'EXPERIENCE',
    'DOMAIN',
    'GOVERNANCE_CONTROL',
    'IMPACT_METRIC'
  ];
  const requiredEdgeTypes = [
    'CLASSIFIED_AS',
    'GOVERNED_BY',
    'MEASURED_BY'
  ];

  const missingNodeTypes = requiredNodeTypes.filter((type) => !nodeTypes.has(type));
  const missingEdgeTypes = requiredEdgeTypes.filter((type) => !edgeTypes.has(type));
  const blockedChecks = [
    report.status !== 'ACTIVE',
    report.governance.noHarm !== true,
    report.governance.humanApprovalRequiredForHighImpact !== true,
    report.governance.noMachineConsciousnessClaim !== true,
    report.claims.machineConsciousnessClaimed !== false,
    report.claims.agiClaimed !== false,
    report.claims.asiClaimed !== false,
    report.linkedLayers.humanDevelopmentFramework.status !== 'ACTIVE',
    report.linkedLayers.humanCenteredKnowledgeCivilizationPlatform.status !== 'ACTIVE',
    missingNodeTypes.length > 0,
    missingEdgeTypes.length > 0
  ].filter(Boolean).length;

  return {
    system: 'SHEIKHA_HUMAN_EXPERIENCE_GRAPH_VALIDATOR_V1',
    status: blockedChecks ? 'BLOCKED' : 'PASSED',
    nodes: report.nodes.length,
    edges: report.edges.length,
    experienceNodes: report.nodes.filter((node) => node.type === 'EXPERIENCE').length,
    domainNodes: report.nodes.filter((node) => node.type === 'DOMAIN').length,
    governanceNodes: report.nodes.filter((node) => node.type === 'GOVERNANCE_CONTROL').length,
    impactNodes: report.nodes.filter((node) => node.type === 'IMPACT_METRIC').length,
    relationTypes: Array.from(edgeTypes),
    missingNodeTypes,
    missingEdgeTypes,
    blockedChecks
  };
}

function buildHumanExperienceGraph(options = {}) {
  const humanDevelopmentFramework =
    options.humanDevelopmentFramework || buildHumanDevelopmentFramework({
      source: 'human_experience_graph',
      purpose: 'link_experience_to_domains_governance_and_impact'
    });
  const humanCenteredKnowledgeCivilizationPlatform =
    options.humanCenteredKnowledgeCivilizationPlatform ||
    buildHumanCenteredKnowledgeCivilizationPlatform({
      humanDevelopmentFramework
    });

  const experienceNodes = buildExperienceNodes();
  const domainNodes = buildDomainNodes(humanDevelopmentFramework.domains || knowledgeDomains);
  const governanceNodes = buildGovernanceNodes();
  const impactNodes = buildImpactNodes();
  const nodes = [
    ...experienceNodes,
    ...domainNodes,
    ...governanceNodes,
    ...impactNodes
  ];
  const edges = buildExperienceGraphEdges(
    experienceNodes,
    domainNodes,
    governanceNodes,
    impactNodes
  );

  const report = {
    system: 'SHEIKHA_HUMAN_EXPERIENCE_GRAPH_V1',
    status: 'ACTIVE',
    mode: 'GOVERNED_HUMAN_EXPERIENCE_GRAPH',
    decision: 'ACTIVE_EXPERIENCE_TO_DOMAIN_GOVERNANCE_IMPACT_GRAPH',
    purpose: 'Link human experiences to knowledge domains, governance controls, and impact metrics for reusable learning and safe decision support.',
    graph: {
      directed: true,
      readOnlyByDefault: true,
      relationTypes: RELATION_TYPES,
      experienceTypes: EXPERIENCE_TYPES,
      governanceControls: GOVERNANCE_CONTROLS,
      impactMetrics: IMPACT_METRICS
    },
    nodes,
    edges,
    linkedLayers: {
      humanDevelopmentFramework: {
        system: humanDevelopmentFramework.system,
        status: humanDevelopmentFramework.status,
        decision: humanDevelopmentFramework.decision
      },
      humanCenteredKnowledgeCivilizationPlatform: {
        system: humanCenteredKnowledgeCivilizationPlatform.system,
        status: humanCenteredKnowledgeCivilizationPlatform.status,
        validation: humanCenteredKnowledgeCivilizationPlatform.validation?.status,
        readiness: humanCenteredKnowledgeCivilizationPlatform.readiness?.overall
      }
    },
    claims: {
      machineConsciousnessClaimed: false,
      selfAwarenessClaimed: false,
      agiClaimed: false,
      asiClaimed: false,
      unseenKnowledgeClaimed: false
    },
    governance: {
      humanProvidedExperience: true,
      consentOrAuthorityRequired: true,
      noSensitiveDataByDefault: true,
      noExternalMutation: true,
      humanApprovalRequiredForHighImpact: true,
      qualifiedReviewRequiredForSensitiveDomains: true,
      noAutomaticReligiousRuling: true,
      auditRequired: true,
      noMachineConsciousnessClaim: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    readiness: {
      experienceCaptureReady: true,
      domainLinkingReady: true,
      governanceLinkingReady: true,
      impactMeasurementReady: true,
      knowledgeReuseReady: true,
      overall: 'HUMAN_EXPERIENCE_GRAPH_READY'
    },
    timestamp: new Date().toISOString()
  };

  return {
    ...report,
    validation: validateHumanExperienceGraph(report)
  };
}

module.exports = {
  EXPERIENCE_TYPES,
  GOVERNANCE_CONTROLS,
  IMPACT_METRICS,
  RELATION_TYPES,
  nodeId,
  buildExperienceNodes,
  buildDomainNodes,
  buildGovernanceNodes,
  buildImpactNodes,
  buildExperienceGraphEdges,
  validateHumanExperienceGraph,
  buildHumanExperienceGraph
};
