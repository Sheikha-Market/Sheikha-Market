'use strict';

const { withDomainDashboardDefaults } = require('../contracts/sheikha-domain-data-contracts-v1');
const { resolveEngine, registerEngine, listEngines } = require('./sheikha-engine-registry-v1');
const {
  buildDefaultContract,
  buildSafeOptionalEngineContract
} = require('../optional-engine-contract-fabric/sheikha-optional-engine-data-contracts-v14');

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

function buildGovernedDashboardContract(name, label, reason = 'OPTIONAL_STUB_REGISTERED') {
  const contract = buildDefaultContract(name, reason);

  return {
    ...contract,
    label: label || contract.label,
    logistics: {
      ports: contract.ports,
      airports: contract.airports,
      pipelines: contract.pipelines,
      railways: contract.railways,
      routes: [],
      ready: false
    },
    accounting: {
      chartOfAccounts: contract.chartOfAccounts,
      ledgers: contract.ledgers,
      currencies: contract.currencies,
      ready: false
    },
    trust: {
      trustPillars: contract.trustPillars,
      authLayers: contract.authLayers,
      reliabilityMetrics: contract.reliabilityMetrics,
      score: 0,
      ready: false
    }
  };
}

function mergeDashboardContract(name, label, dashboard, reason) {
  const base = buildGovernedDashboardContract(name, label, reason);
  const source = dashboard || {};

  return {
    ...base,
    ...source,
    stats: {
      ...base.stats,
      ...(source.stats || {})
    },
    summary: {
      ...base.summary,
      ...(source.summary || {})
    },
    saudi: {
      ...base.saudi,
      ...(source.saudi || {})
    },
    history: {
      ...base.history,
      ...(source.history || {})
    },
    logistics: {
      ...base.logistics,
      ...(source.logistics || {})
    },
    accounting: {
      ...base.accounting,
      ...(source.accounting || {})
    },
    trust: {
      ...base.trust,
      ...(source.trust || {})
    },
    domains: {
      ...base.domains,
      ...(source.domains || {})
    },
    governance: {
      ...base.governance,
      ...(source.governance || {})
    }
  };
}

const defaultDashboardContract = Object.freeze(
  buildGovernedDashboardContract('OPTIONAL', 'Optional Engine')
);

function governedResolveEngine(name, options = {}) {
  const resolved = resolveEngine(name, options);
  const instance = resolved.instance || {};
  const label = instance.label || optionalEngineMap[name] || name;
  const safeOptional = buildSafeOptionalEngineContract(name, resolved.status);

  const governedInstance = {
    ...safeOptional,
    ...instance,
    getDashboard() {
      const dashboard = typeof instance.getDashboard === 'function'
        ? instance.getDashboard()
        : {};

      return mergeDashboardContract(name, label, dashboard, resolved.status);
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
  };

  return {
    ...resolved,
    governance: {
      noHarm: true,
      internalOnly: true,
      externalMutation: false,
      humanReviewRequired: options.required === true,
      classification: options.required ? 'REQUIRED_ENGINE' : 'OPTIONAL_ENGINE'
    },
    instance: new Proxy(governedInstance, {
      get(target, property) {
        if (property in target) return target[property];
        return safeOptional[property];
      }
    })
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
          return buildGovernedDashboardContract(symbol, label);
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
