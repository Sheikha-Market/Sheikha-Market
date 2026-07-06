'use strict';

const DOMAINS = Object.freeze([
  'executive-board',
  'project-management',
  'operations-management',
  'asset-management',
  'support-management',
  'risk-management',
  'contract-management',
  'knowledge-management',
  'governance-management',
  'audit-management',
  'ai-management',
  'enterprise-analytics'
]);

const GOVERNANCE = Object.freeze({
  reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
  noSecretExposure: true,
  evidenceBeforeDecision: true,
  governanceBeforeExecution: true,
  humanApprovalForHighRisk: true,
  auditEverySensitiveAction: true,
  noClaimOfUnseenKnowledge: true,
  noReligiousFatwaAutomation: true,
  noAutonomousBindingDecision: true
});

function status() {
  return {
    system: 'SHEIKHA_ENTERPRISE_MANAGEMENT_OS_V1',
    status: 'ACTIVE',
    level: 'INTEGRATED_ENTERPRISE_OPERATING_SYSTEM',
    above: 'SHEIKHA_HUB_V1',
    domains: DOMAINS,
    connectsTo: [
      'SHEIKHA_HUB_V1',
      'SHEIKHA_COMMAND_CENTER_V1',
      'SHEIKHA_MASTER_LOG_CENTER_V1',
      'SHEIKHA_MASTER_GRAPH_V1',
      'SHEIKHA_LAYER_GOVERNANCE_PROMOTION_OS_V1',
      'SHEIKHA_COVENANT_GOVERNANCE_APEX_V1',
      'SHEIKHA_PROJECT_LIFECYCLE_OS_V1',
      'SHEIKHA_SUPPLY_CHAIN_CONTROL_TOWER_V2',
      'SHEIKHA_ENTERPRISE_INSPECTOR_V3'
    ],
    governance: GOVERNANCE
  };
}

function registry() {
  return {
    registry: 'SHEIKHA_ENTERPRISE_REGISTRY_V1',
    status: 'ACTIVE',
    objects: [
      'organizations',
      'departments',
      'programs',
      'projects',
      'workstreams',
      'tasks',
      'assets',
      'people',
      'suppliers',
      'customers',
      'partners',
      'contracts',
      'risks',
      'policies',
      'decisions',
      'evidence',
      'audits'
    ]
  };
}

function portfolio(input = {}) {
  const highRisk = Number(input.highRisk ?? 0);
  return {
    engine: 'SHEIKHA_ENTERPRISE_PORTFOLIO_ENGINE_V1',
    status: 'ACTIVE',
    portfolio: {
      programs: Number(input.programs ?? 0),
      projects: Number(input.projects ?? 0),
      tasks: Number(input.tasks ?? 0),
      milestones: Number(input.milestones ?? 0),
      highRisk
    },
    governance: {
      requiresHumanReview: highRisk > 0,
      decision: highRisk > 0 ? 'HUMAN_REVIEW_REQUIRED' : 'GOVERNED_PORTFOLIO_VIEW'
    }
  };
}

function operations(input = {}) {
  return {
    engine: 'SHEIKHA_ENTERPRISE_OPERATIONS_ENGINE_V1',
    status: 'ACTIVE',
    operations: {
      runtimeHealth: input.runtimeHealth || 'UNKNOWN',
      incidents: Number(input.incidents ?? 0),
      changes: Number(input.changes ?? 0),
      deployments: Number(input.deployments ?? 0),
      supportTickets: Number(input.supportTickets ?? 0)
    },
    rule: 'Operations are measured, logged, governed, and traceable.'
  };
}

function assets(input = {}) {
  return {
    engine: 'SHEIKHA_ENTERPRISE_ASSET_ENGINE_V1',
    status: 'ACTIVE',
    assetClasses: [
      'servers',
      'applications',
      'databases',
      'ai-models',
      'repositories',
      'domains',
      'licenses',
      'contracts',
      'equipment'
    ],
    summary: {
      totalAssets: Number(input.totalAssets ?? 0),
      criticalAssets: Number(input.criticalAssets ?? 0),
      ungovernedAssets: Number(input.ungovernedAssets ?? 0)
    },
    governance: {
      decision: Number(input.ungovernedAssets ?? 0) > 0
        ? 'GOVERNANCE_REVIEW_REQUIRED'
        : 'GOVERNED_ASSET_VIEW'
    }
  };
}

function executiveTwin(input = {}) {
  const riskScore = Number(input.riskScore ?? 0);
  return {
    engine: 'SHEIKHA_EXECUTIVE_DIGITAL_TWIN_V1',
    status: 'ACTIVE',
    state: {
      enterprise: input.enterprise || 'ACTIVE_REFERENCE',
      projects: input.projects || 'UNKNOWN',
      operations: input.operations || 'UNKNOWN',
      financial: input.financial || 'NOT_CONNECTED',
      knowledge: input.knowledge || 'ACTIVE_REFERENCE',
      riskScore
    },
    decision: riskScore >= 70 ? 'EXECUTIVE_REVIEW_REQUIRED' : 'GOVERNED_EXECUTIVE_VIEW'
  };
}

function aiAdvisory(input = {}) {
  return {
    engine: 'SHEIKHA_ENTERPRISE_AI_ADVISORY_ENGINE_V1',
    status: 'ACTIVE',
    modes: [
      'generative-summary',
      'agentic-analysis',
      'risk-hints',
      'project-prioritization',
      'knowledge-reuse',
      'operations-recommendation'
    ],
    advisory: {
      request: String(input.request || '').slice(0, 300),
      recommendation: 'ADVISORY_ONLY_REQUIRES_EVIDENCE_AND_HUMAN_APPROVAL',
      executionAllowed: false
    },
    boundaries: {
      noAutonomousBindingDecision: true,
      noUnseenClaim: true,
      noSecretDisclosure: true,
      humanApprovalForExecution: true
    }
  };
}

module.exports = {
  status,
  registry,
  portfolio,
  operations,
  assets,
  executiveTwin,
  aiAdvisory
};
