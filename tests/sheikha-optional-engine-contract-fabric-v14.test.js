'use strict';

const {
  clearEngines,
  resolveEngine
} = require('../core/engine-registry/sheikha-engine-registry-v1');

const {
  allOptionalEngineAliases,
  buildDefaultContract,
  buildSafeOptionalEngineContract,
  requestedEngineAliases,
  inferredRuntimeAliases,
  validateOptionalEngineContracts
} = require('../core/optional-engine-contract-fabric/sheikha-optional-engine-data-contracts-v14');

const {
  registerOptionalEngineContractFabric,
  buildOptionalEngineContractFabricReport,
  getOptionalEngineContractFabricStatus
} = require('../core/optional-engine-contract-fabric/sheikha-optional-engine-contract-fabric-v14');

describe('Sheikha Optional Engine Contract Fabric V14', () => {
  beforeEach(() => clearEngines());

  afterEach(() => clearEngines());

  test('validates requested and inferred optional engine aliases', () => {
    const validation = validateOptionalEngineContracts();

    expect(validation.system).toBe('SHEIKHA_OPTIONAL_ENGINE_DATA_CONTRACTS_V14');
    expect(validation.status).toBe('ACTIVE');
    expect(validation.requestedAliases).toBe(22);
    expect(validation.inferredAliases).toBe(3);
    expect(validation.totalAliases).toBe(25);
    expect(validation.contracts.every((contract) => contract.safe)).toBe(true);
    expect(requestedEngineAliases).toContain('AS');
    expect(inferredRuntimeAliases).toEqual(['LSC', 'ACE', 'TAE']);
    expect(allOptionalEngineAliases).toContain('AAE');
  });

  test('builds stable default contracts for missing data fields', () => {
    const quran = buildDefaultContract('AS');
    const logistics = buildDefaultContract('LSC');
    const accounting = buildDefaultContract('ACE');
    const trust = buildDefaultContract('TAE');

    expect(quran.total).toBe(0);
    expect(quran.quranVerses.total).toBe(0);
    expect(quran.stats.total).toBe(0);
    expect(logistics.stats.ports).toBe(0);
    expect(logistics.ports).toEqual([]);
    expect(accounting.stats.chartOfAccounts).toBe(0);
    expect(accounting.chartOfAccounts).toEqual([]);
    expect(trust.stats.trustPillars).toBe(0);
    expect(trust.trustPillars).toEqual([]);
    expect(trust.governance.noHarm).toBe(true);
  });

  test('returns safe method contracts for optional engine getters', () => {
    const engine = buildSafeOptionalEngineContract('ACE');
    const dashboard = engine.getDashboard();
    const chartOfAccounts = engine.getChartOfAccounts();
    const status = engine.getStatus();

    expect(dashboard.available).toBe(false);
    expect(dashboard.stats.chartOfAccounts).toBe(0);
    expect(chartOfAccounts.success).toBe(true);
    expect(chartOfAccounts.chartOfAccounts).toEqual([]);
    expect(status.safe).toBe(true);
  });

  test('protects legacy boot dashboards with deep default fields', () => {
    const markets = buildSafeOptionalEngineContract('MSMEngine').getDashboard();
    const globalData = buildSafeOptionalEngineContract('MGD').getDashboard();
    const hsHistory = buildSafeOptionalEngineContract('MHH').getDashboard();
    const networks = buildSafeOptionalEngineContract('MNM').getDashboard();
    const directEngine = buildSafeOptionalEngineContract('MNM');

    expect(markets.metals.total).toBe(0);
    expect(markets.scrap.ferrousGrades).toBe(0);
    expect(markets.markets.globalExchanges).toBe(0);
    expect(globalData.islamicFoundation.verses).toBe(0);
    expect(hsHistory.hsCodes.total).toBe(0);
    expect(hsHistory.history.eras).toBe(0);
    expect(networks.networkList).toEqual([]);
    expect(directEngine.networkList).toEqual([]);
  });

  test('registers optional engines into the engine registry', () => {
    const activation = registerOptionalEngineContractFabric();
    const asResult = resolveEngine('AS');
    const accountingResult = resolveEngine('ACE');
    const trustResult = resolveEngine('TAE');

    expect(activation.status).toBe('ACTIVE');
    expect(activation.registered).toHaveLength(25);
    expect(asResult.status).toBe('RESOLVED');
    expect(asResult.instance.getDashboard().stats.total).toBe(0);
    expect(accountingResult.instance.getChartOfAccounts().chartOfAccounts).toEqual([]);
    expect(trustResult.instance.getTrustScore().trustPillars).toEqual([]);
  });

  test('builds governed report and status for integration routes', () => {
    const report = buildOptionalEngineContractFabricReport();
    const status = getOptionalEngineContractFabricStatus();

    expect(report.system).toBe('SHEIKHA_OPTIONAL_ENGINE_CONTRACT_FABRIC_V14');
    expect(report.status).toBe('ACTIVE_100');
    expect(report.probes.every((probe) => probe.noHarm)).toBe(true);
    expect(report.defaults.accounting.chartOfAccounts).toEqual([]);
    expect(report.defaults.logistics.ports).toEqual([]);
    expect(status.status).toBe('ACTIVE_100');
    expect(status.aliases).toBe(25);
  });
});
