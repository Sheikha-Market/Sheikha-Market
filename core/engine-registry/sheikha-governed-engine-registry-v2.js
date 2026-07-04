'use strict';

const { resolveEngine, registerEngine, listEngines } = require('./sheikha-engine-registry-v1');

const defaultDashboardContract = Object.freeze({
  available: false,
  ready: false,
  quranVerses: { total: 0, verses: [], loaded: false },
  metals: { total: 0, items: [] },
  scrap: { total: 0, items: [] },
  logistics: { ports: [], routes: [], ready: false },
  accounting: { chartOfAccounts: [], ledgers: [], currencies: [] },
  trust: { trustPillars: [], score: 0 },
  widgets: [],
  metrics: []
});

const optionalEngineMap = Object.freeze({
  AS: 'Auto Salvage',
  TNH: 'Trade History',
  LG: 'Leadership',
  MB: 'Metals Bank',
  LR: 'Licenses',
  OD: 'Official Docs',
  AE: 'Archive',
  GPE: 'GovPlatforms',
  LME: 'LogisticsManagement',
  MSE: 'MaterialsSpecs',
  RCE: 'Readiness',
  WPE: 'WisdomPower',
  MIE: 'MetalsImpact',
  MME: 'MetalsMeasurement',
  LE: 'Logic',
  QSE: 'QuantumStats',
  WFE: 'WisdomFusion',
  QJE: 'Quraysh',
  SLE: 'Learning',
  WBE: 'WalaaBaraa',
  TLE: 'TradeLegacy',
  AAE: 'Private'
});

function governedResolveEngine(name, options = {}) {
  const resolved = resolveEngine(name, options);
  const instance = resolved.instance || {};

  return {
    ...resolved,
    governance: {
      noHarm: true,
      internalOnly: true,
      externalMutation: false,
      humanReviewRequired: options.required === true,
      classification: options.required ? 'REQUIRED_ENGINE' : 'OPTIONAL_ENGINE'
    },
    instance: {
      ...instance,
      getDashboard() {
        const dashboard = typeof instance.getDashboard === 'function'
          ? instance.getDashboard()
          : {};
        return { ...defaultDashboardContract, ...(dashboard || {}) };
      },
      getStatus() {
        const status = typeof instance.getStatus === 'function'
          ? instance.getStatus()
          : {};
        return {
          status: resolved.status,
          available: resolved.status === 'RESOLVED',
          ...(status || {})
        };
      }
    }
  };
}

function registerOptionalEngineStubs() {
  Object.entries(optionalEngineMap).forEach(([symbol, label]) => {
    try {
      registerEngine(symbol, () => ({
        name: symbol,
        label,
        optional: true,
        getDashboard() {
          return { ...defaultDashboardContract, label };
        },
        getStatus() {
          return { status: 'OPTIONAL_STUB_REGISTERED', label };
        }
      }), {
        label,
        optional: true,
        governed: true
      });
    } catch {
      // already registered
    }
  });

  return {
    system: 'SHEIKHA_GOVERNED_ENGINE_REGISTRY_V2',
    status: 'ACTIVE',
    registeredOptionalStubs: Object.keys(optionalEngineMap).length,
    registry: listEngines()
  };
}

module.exports = {
  defaultDashboardContract,
  optionalEngineMap,
  governedResolveEngine,
  registerOptionalEngineStubs
};
