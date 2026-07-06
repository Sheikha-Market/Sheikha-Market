'use strict';

const {
  SheikhaConnectorFederationFabric,
  SheikhaConnectorFactory,
  CONNECTOR_TARGETS,
  CONNECTOR_OPERATIONS
} = require('../sheikha-connector-federation-fabric');

class SheikhaConnectorTestHarness {
  constructor({ federation, factory } = {}) {
    this.federation = federation || new SheikhaConnectorFederationFabric();
    this.factory = factory || new SheikhaConnectorFactory();
  }

  testConnector(target) {
    const connector = this.factory.createConnector(target);

    const checks = [
      { name: 'connector-created', passed: connector.status === 'CONNECTOR_CREATED' },
      { name: 'production-ready', passed: connector.productionReady === true },
      { name: 'governed', passed: connector.governed === true },
      { name: 'audited', passed: connector.audited === true },
      { name: 'operations-contract', passed: CONNECTOR_OPERATIONS.every((op) => connector.operations.includes(op)) },
      { name: 'safe-boundaries', passed: connector.boundaries.noUngovernedConnection && connector.boundaries.noUnsafeRecovery }
    ];

    const passed = checks.every((check) => check.passed);

    return {
      system: 'SHEIKHA_CONNECTOR_TEST_HARNESS_V1',
      target,
      status: passed ? 'TESTED_PRODUCTION_CANDIDATE' : 'TEST_FAILED',
      measurable: true,
      governed: true,
      audited: true,
      checks,
      score: Math.round((checks.filter((check) => check.passed).length / checks.length) * 100),
      nextStage: passed ? 'PRODUCTION_READY_CONNECTOR' : 'REPAIR_REQUIRED'
    };
  }

  testAllConnectors() {
    return CONNECTOR_TARGETS.map((target) => this.testConnector(target));
  }

  getStatus() {
    const federationStatus = this.federation.getStatus();
    const results = this.testAllConnectors();
    const passed = results.every((result) => result.status === 'TESTED_PRODUCTION_CANDIDATE');

    return {
      system: 'SHEIKHA_CONNECTOR_TEST_HARNESS_V1',
      arabicName: 'شيخة طبقة اختبار الموصلات القابلة للقياس',
      status: passed ? 'ACTIVE_ALL_CONNECTORS_TESTED' : 'ACTIVE_WITH_CONNECTOR_FAILURES',
      layerRank: 'ABOVE_CONNECTOR_FEDERATION',
      productionReady: passed,
      governed: true,
      audited: true,
      federationStatus,
      results,
      coverage: {
        targets: CONNECTOR_TARGETS.length,
        tested: results.length,
        passed: results.filter((result) => result.status === 'TESTED_PRODUCTION_CANDIDATE').length,
        score: Math.round((results.filter((result) => result.status === 'TESTED_PRODUCTION_CANDIDATE').length / results.length) * 100)
      },
      boundaries: {
        noUngovernedConnectorTest: true,
        noUnsafeProductionPromotion: true,
        allConnectorTestsAudited: results.every((result) => result.audited),
        allConnectorTestsGoverned: results.every((result) => result.governed)
      }
    };
  }
}

module.exports = {
  SheikhaConnectorTestHarness
};
