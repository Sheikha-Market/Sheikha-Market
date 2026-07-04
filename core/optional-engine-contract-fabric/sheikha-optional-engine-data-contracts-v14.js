'use strict';

const requestedEngineAliases = Object.freeze([
  'AS',
  'TNH',
  'LG',
  'MB',
  'LR',
  'OD',
  'AE',
  'GPE',
  'LME',
  'MSE',
  'RCE',
  'WPE',
  'MIE',
  'MME',
  'LE',
  'QSE',
  'WFE',
  'QJE',
  'SLE',
  'WBE',
  'TLE',
  'AAE'
]);

const inferredRuntimeAliases = Object.freeze([
  'LSC',
  'ACE',
  'TAE'
]);

const optionalEngineDefinitions = Object.freeze({
  AS: { label: 'Auto Salvage', domain: 'salvage', contract: 'market' },
  TNH: { label: 'Trade Networks History', domain: 'trade-history', contract: 'knowledge' },
  LG: { label: 'Leadership Governance', domain: 'leadership', contract: 'governance' },
  MB: { label: 'Metals Bank', domain: 'metals-bank', contract: 'market' },
  LR: { label: 'Licenses Registry', domain: 'licensing', contract: 'registry' },
  OD: { label: 'Official Documents', domain: 'documents', contract: 'documents' },
  AE: { label: 'Archive Engine', domain: 'archive', contract: 'documents' },
  GPE: { label: 'Government Platforms Engine', domain: 'government', contract: 'integration' },
  LME: { label: 'Logistics Management Engine', domain: 'logistics-management', contract: 'logistics' },
  MSE: { label: 'Materials Specs Engine', domain: 'materials-specs', contract: 'standards' },
  RCE: { label: 'Readiness Compliance Engine', domain: 'readiness', contract: 'readiness' },
  WPE: { label: 'Wisdom Policy Engine', domain: 'wisdom-policy', contract: 'wisdom' },
  MIE: { label: 'Metals Impact Engine', domain: 'metals-impact', contract: 'impact' },
  MME: { label: 'Metals Measurement Engine', domain: 'metals-measurement', contract: 'measurement' },
  LE: { label: 'Logic Engine', domain: 'logic', contract: 'logic' },
  QSE: { label: 'Quantum Statistics Engine', domain: 'quantum-statistics', contract: 'analytics' },
  WFE: { label: 'Wisdom Fusion Engine', domain: 'wisdom-fusion', contract: 'wisdom' },
  QJE: { label: 'Quraysh Journey Engine', domain: 'quraysh-journey', contract: 'heritage' },
  SLE: { label: 'Sheikha Learning Engine', domain: 'learning', contract: 'learning' },
  WBE: { label: 'Walaa Baraa Engine', domain: 'walaa-baraa', contract: 'governance' },
  TLE: { label: 'Trade Legacy Engine', domain: 'trade-legacy', contract: 'trade' },
  AAE: { label: 'Adab Anbiya Engine', domain: 'private-adab', contract: 'private-governance' },
  LSC: { label: 'Logistics Supply Chain', domain: 'logistics', contract: 'logistics', inferred: true },
  ACE: { label: 'Accounting Engine', domain: 'accounting', contract: 'accounting', inferred: true },
  TAE: { label: 'Trust Auth Engine', domain: 'trust-auth', contract: 'trust', inferred: true }
});

const allOptionalEngineAliases = Object.freeze([
  ...requestedEngineAliases,
  ...inferredRuntimeAliases
]);

const commonStats = Object.freeze({
  total: 0,
  quranVerses: 0,
  hadith: 0,
  ports: 0,
  airports: 0,
  pipelines: 0,
  railways: 0,
  chartOfAccounts: 0,
  accountCategories: 0,
  financialStatements: 0,
  automationWorkflows: 0,
  archiveIntegrations: 0,
  shariaRules: 0,
  trustPillars: 0,
  authLayers: 0,
  reliabilityMetrics: 0,
  authMethods: 0,
  rbacRoles: 0,
  securityProtocols: 0,
  islamicTrustPrinciples: 0,
  backgroundProcesses: 0,
  calendarBasis: 'not_configured',
  ready: false
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildDefaultContract(alias, reason = 'OPTIONAL_NOT_REGISTERED') {
  const definition = optionalEngineDefinitions[alias] || {
    label: alias,
    domain: 'unknown',
    contract: 'generic'
  };
  const stats = {
    ...clone(commonStats),
    engineAliases: allOptionalEngineAliases.length
  };

  return {
    system: 'SHEIKHA_OPTIONAL_ENGINE_DATA_CONTRACT_V14',
    engine: alias,
    label: definition.label,
    domain: definition.domain,
    contract: definition.contract,
    status: reason,
    available: false,
    ready: false,
    optional: true,
    inferred: Boolean(definition.inferred),
    total: 0,
    stats,
    summary: {
      ...stats,
      total: 0,
      loaded: false,
      quranVerses: 0,
      ports: 0,
      chartOfAccounts: 0,
      trustPillars: 0
    },
    quranVerses: {
      total: 0,
      loaded: false,
      items: []
    },
    hadith: {
      total: 0,
      loaded: false,
      items: []
    },
    ports: [],
    airports: [],
    pipelines: [],
    railways: [],
    chartOfAccounts: [],
    ledgers: [],
    currencies: [],
    trustPillars: [],
    authLayers: [],
    reliabilityMetrics: [],
    widgets: [],
    metrics: [],
    evidence: [],
    recommendations: [
      'Register a concrete engine implementation when available.',
      'Keep optional reads contract-safe until the engine is implemented.'
    ],
    governance: {
      noHarm: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noPackageInstall: true,
      noUnauthorizedAccess: true,
      optionalContract: true,
      principle: 'لا ضرر ولا ضرار'
    },
    timestamp: new Date().toISOString()
  };
}

function segmentResponse(alias, segment, reason = 'OPTIONAL_NOT_REGISTERED') {
  const contract = buildDefaultContract(alias, reason);
  const value = contract[segment];

  return {
    success: true,
    system: 'SHEIKHA_OPTIONAL_ENGINE_SEGMENT_CONTRACT_V14',
    engine: alias,
    segment,
    status: reason,
    available: false,
    data: value ?? null,
    [segment]: value ?? null,
    governance: contract.governance,
    timestamp: new Date().toISOString()
  };
}

function methodToSegment(methodName = '') {
  const normalized = String(methodName)
    .replace(/^get/, '')
    .replace(/^[A-Z]/, (value) => value.toLowerCase());

  const explicit = {
    ChartOfAccounts: 'chartOfAccounts',
    Ports: 'ports',
    Airports: 'airports',
    IslamicFoundation: 'quranVerses',
    IslamicTrust: 'trustPillars',
    AuthSystem: 'authLayers',
    TrustScore: 'trustPillars',
    Reliability: 'reliabilityMetrics',
    BackgroundAndDisplay: 'widgets'
  };

  return explicit[String(methodName).replace(/^get/, '')] || normalized || 'data';
}

function buildSafeOptionalEngineContract(alias, reason = 'OPTIONAL_NOT_REGISTERED') {
  const base = {
    system: 'SHEIKHA_SAFE_OPTIONAL_ENGINE_CONTRACT_V14',
    name: alias,
    status: reason,
    available: false,
    safe: true,
    initialize() {
      return {
        status: reason,
        available: false,
        name: alias,
        governance: buildDefaultContract(alias, reason).governance
      };
    },
    getStatus() {
      return {
        status: reason,
        available: false,
        name: alias,
        contract: buildDefaultContract(alias, reason).contract,
        safe: true
      };
    },
    getDashboard() {
      return buildDefaultContract(alias, reason);
    },
    getSummary() {
      return buildDefaultContract(alias, reason).summary;
    }
  };

  return new Proxy(base, {
    get(target, property) {
      if (property in target) return target[property];
      if (typeof property === 'string' && property.startsWith('get')) {
        return () => segmentResponse(alias, methodToSegment(property), reason);
      }
      return undefined;
    }
  });
}

function validateOptionalEngineContracts() {
  const contracts = allOptionalEngineAliases.map((alias) => {
    const dashboard = buildDefaultContract(alias);

    return {
      alias,
      label: dashboard.label,
      domain: dashboard.domain,
      contract: dashboard.contract,
      safe: Boolean(
        dashboard.stats &&
        dashboard.summary &&
        dashboard.quranVerses &&
        Array.isArray(dashboard.ports) &&
        Array.isArray(dashboard.chartOfAccounts) &&
        Array.isArray(dashboard.trustPillars)
      ),
      inferred: dashboard.inferred
    };
  });

  return {
    system: 'SHEIKHA_OPTIONAL_ENGINE_DATA_CONTRACTS_V14',
    status: contracts.every((item) => item.safe) ? 'ACTIVE' : 'REVIEW',
    requestedAliases: requestedEngineAliases.length,
    inferredAliases: inferredRuntimeAliases.length,
    totalAliases: allOptionalEngineAliases.length,
    contracts,
    governance: {
      optionalEnginesOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  requestedEngineAliases,
  inferredRuntimeAliases,
  allOptionalEngineAliases,
  optionalEngineDefinitions,
  buildDefaultContract,
  buildSafeOptionalEngineContract,
  segmentResponse,
  validateOptionalEngineContracts
};
