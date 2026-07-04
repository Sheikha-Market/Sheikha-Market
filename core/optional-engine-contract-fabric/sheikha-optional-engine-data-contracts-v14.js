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
  gapAnalysis: 0,
  historicalEras: 0,
  tradeRoutes: 0,
  tradeNetworks: 0,
  modernNetworks: 0,
  mapPoints: 0,
  leadershipPrinciples: 0,
  organizationalLayers: 0,
  organizations: 0,
  caravans: 0,
  networks: 0,
  preciousMetals: 0,
  baseMetals: 0,
  rareMetals: 0,
  scrapTypes: 0,
  tradingContracts: 0,
  vaultLocations: 0,
  shariaEvidence: 0,
  commercialActivities: 0,
  essentialLicenses: 0,
  certificates: 0,
  saudiAuthorities: 0,
  timelinePhases: 0,
  officialDocTemplates: 0,
  stampDesigns: 0,
  signatureTypes: 0,
  autoFillForms: 0,
  governmentForms: 0,
  commercialForms: 0,
  archiveCategories: 0,
  documentClasses: 0,
  indexingLevels: 0,
  retentionPolicies: 0,
  autoWorkflows: 0,
  securityLevels: 0,
  govPlatforms: 0,
  autoUploadFlows: 0,
  carrierIntegrations: 0,
  portSystems: 0,
  sheikhaDocuments: 0,
  operationPhases: 0,
  analyticsKPIs: 0,
  metalCategories: 0,
  totalProducts: 0,
  hsCodes: 0,
  standards: 0,
  userIndustries: 0,
  geographicSources: 0,
  islamicReferences: 0,
  saudiPlatforms: 0,
  saudiLaws: 0,
  internationalRegions: 0,
  countriesSupported: 0,
  internationalStandards: 0,
  tradeAgreements: 0,
  digitalIntegrationPoints: 0,
  metalsTracked: 0,
  impactDimensions: 0,
  hsCodesCovered: 0,
  sdgAlignment: 0,
  kpis: 0,
  propheticMeasures: 0,
  scientificMeasures: 0,
  economicMeasures: 0,
  classificationAxes: 0,
  metalsClassified: 0,
  wisdomDisplayRules: 0,
  quranicLogicPrinciples: 0,
  propheticReasoningMethods: 0,
  decisionFrameworks: 0,
  logicalFallacies: 0,
  businessLogicRules: 0,
  aiReasoningModels: 0,
  cosmicMeasures: 0,
  propheticEraData: 0,
  earthMeasures: 0,
  heavensMeasures: 0,
  metalQuantities: 0,
  systemMetrics: 0,
  fusionDomains: 0,
  wisdomPrinciples: 0,
  crossDomainRules: 0,
  integrationPoints: 0,
  logicLayers: 0,
  islamicFoundations: 0,
  divineBlessing: 0,
  partnerCountries: 0,
  securityLayers: 0,
  gratitudePractices: 0,
  learningDomains: 0,
  quranicKnowledgeVerses: 0,
  machineLearningModels: 0,
  wisdomLessons: 0,
  continuousProcesses: 0,
  knowledgeSources: 0,
  walaaFoundations: 0,
  baraaShields: 0,
  protectionLayers: 0,
  rejectionRules: 0,
  victoryPrinciples: 0,
  historicalNetworks: 0,
  tradersAnalyzed: 0,
  goodsCategories: 0,
  sheikhGoals: 0,
  backgroundGoals: 0,
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
    totalModules: 0,
    registeredCarriers: 0,
    openSourceDataSources: 0,
    integrationPoints: 0,
    islamicReferences: 0,
    metalsCount: 0,
    typesCount: 0,
    historicalEras: 0,
    saudiSmelters: 0,
    shariaEvidence: 0,
    contractIssues: 0,
    smartContractFeatures: 0,
    networks: 0,
    totalNodes: 0,
    stats,
    metals: {
      total: 0,
      precious: 0,
      base: 0,
      strategic: 0,
      quranVerses: 0,
      hadith: 0,
      islamicFoundation: {}
    },
    scrap: {
      ferrousGrades: 0,
      copperGrades: 0,
      aluminumGrades: 0,
      eWasteTypes: 0,
      qualityStandards: []
    },
    markets: {
      globalExchanges: 0,
      marketPrinciples: 0,
      contractTypes: 0,
      saudiMarkets: [],
      units: []
    },
    islamicFoundation: {
      verses: 0,
      miningRules: 0,
      quranVerses: [],
      hadith: [],
      principle: null,
      nameAr: null
    },
    hsCodes: {
      total: 0,
      iron: 0,
      aluminum: 0,
      copper: 0,
      precious: 0
    },
    history: {
      eras: 0,
      quranMentions: 0
    },
    networkList: [],
    saudi: {
      salvageYards: 0,
      elvAnnual: 0,
      marketValue: 0
    },
    domains: {
      AI: { modules: 0 },
      Systems: { modules: 0 },
      Computing: { modules: 0 },
      Technology: { modules: 0 },
      Management: { modules: 0 },
      Engineering: { modules: 0 },
      Science: { modules: 0 }
    },
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
  const contract = buildDefaultContract(alias, reason);
  const base = {
    ...contract,
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
