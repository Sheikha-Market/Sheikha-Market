'use strict';

const {
  registerEngine,
  hasEngine,
  resolveEngine,
  listEngines
} = require('../engine-registry/sheikha-engine-registry-v1');

const {
  allOptionalEngineAliases,
  buildDefaultContract,
  buildSafeOptionalEngineContract,
  optionalEngineDefinitions,
  validateOptionalEngineContracts
} = require('./sheikha-optional-engine-data-contracts-v14');

function registerOptionalEngineContractFabric(options = {}) {
  const registered = [];

  for (const alias of allOptionalEngineAliases) {
    if (hasEngine(alias) && options.overwrite !== true) {
      registered.push({
        alias,
        status: 'ALREADY_REGISTERED'
      });
      continue;
    }

    const definition = optionalEngineDefinitions[alias];
    const record = registerEngine(
      alias,
      () => buildSafeOptionalEngineContract(alias, 'OPTIONAL_CONTRACT_REGISTERED'),
      {
        optional: true,
        governed: true,
        contractFabric: 'SHEIKHA_OPTIONAL_ENGINE_CONTRACT_FABRIC_V14',
        label: definition.label,
        domain: definition.domain,
        contract: definition.contract,
        inferred: Boolean(definition.inferred)
      }
    );

    registered.push({
      alias,
      status: record.status,
      domain: definition.domain,
      contract: definition.contract
    });
  }

  return {
    system: 'SHEIKHA_OPTIONAL_ENGINE_CONTRACT_FABRIC_V14',
    status: registered.every((item) => ['REGISTERED', 'ALREADY_REGISTERED'].includes(item.status))
      ? 'ACTIVE'
      : 'REVIEW',
    mode: 'OPTIONAL_ENGINE_REGISTRY_WITH_STABLE_DATA_CONTRACTS',
    registered,
    registry: listEngines(),
    contractValidation: validateOptionalEngineContracts(),
    governance: {
      optionalEnginesOnly: true,
      noReferenceError: true,
      stableDataContracts: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noPackageInstall: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار'
    },
    timestamp: new Date().toISOString()
  };
}

function resolveContractedOptionalEngine(alias) {
  const result = resolveEngine(alias);

  if (result.status === 'RESOLVED') {
    return result.instance;
  }

  return buildSafeOptionalEngineContract(alias, result.status);
}

function buildOptionalEngineContractFabricReport() {
  const activation = registerOptionalEngineContractFabric();
  const probes = ['AS', 'LSC', 'ACE', 'TAE', 'AAE'].map((alias) => {
    const engine = resolveContractedOptionalEngine(alias);
    const dashboard = engine.getDashboard();

    return {
      alias,
      status: engine.getStatus().status,
      contract: dashboard.contract,
      statsReady: Boolean(dashboard.stats),
      quranVersesReady: Boolean(dashboard.quranVerses),
      portsReady: Array.isArray(dashboard.ports),
      accountingReady: Array.isArray(dashboard.chartOfAccounts),
      trustReady: Array.isArray(dashboard.trustPillars),
      noHarm: dashboard.governance.noHarm
    };
  });

  return {
    system: 'SHEIKHA_OPTIONAL_ENGINE_CONTRACT_FABRIC_V14',
    status: activation.status === 'ACTIVE' &&
      probes.every((probe) => probe.statsReady && probe.noHarm)
      ? 'ACTIVE_100'
      : 'REVIEW',
    mode: activation.mode,
    activation,
    probes,
    defaults: {
      accounting: buildDefaultContract('ACE'),
      logistics: buildDefaultContract('LSC'),
      trust: buildDefaultContract('TAE')
    },
    nextActions: [
      'Replace remaining direct new Alias() calls with resolveOptionalEngine(alias, label).',
      'Use stable contracts instead of reading optional engine fields directly.',
      'Keep concrete implementations separate from optional boot contracts.'
    ],
    governance: activation.governance,
    timestamp: new Date().toISOString()
  };
}

function getOptionalEngineContractFabricStatus() {
  const report = buildOptionalEngineContractFabricReport();

  return {
    system: report.system,
    status: report.status,
    mode: report.mode,
    aliases: report.activation.registered.length,
    requestedAliases: report.activation.contractValidation.requestedAliases,
    inferredAliases: report.activation.contractValidation.inferredAliases,
    probes: report.probes.length,
    governance: report.governance,
    timestamp: report.timestamp
  };
}

module.exports = {
  registerOptionalEngineContractFabric,
  resolveContractedOptionalEngine,
  buildOptionalEngineContractFabricReport,
  getOptionalEngineContractFabricStatus
};
