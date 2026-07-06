'use strict';

const {
  SDKEnterpriseFederationFabric,
  SUPPORTED_SDKS,
  PRODUCTION_DOMAINS
} = require('../runtime/sdk-federation/sdk-enterprise-federation-fabric');

const {
  ProgrammingLanguageGovernanceFabric
} = require('../runtime/language-governance/programming-language-governance-fabric');

test('registers governed production SDKs beyond inspector scope', () => {
  const fabric = new SDKEnterpriseFederationFabric();

  const sdk = fabric.registerSDK({
    language: 'javascript-node',
    name: 'sheikha-node-sdk',
    version: '1.0.0',
    domains: ['development', 'runtime', 'api', 'control-plane'],
    capabilities: ['chat', 'registry', 'control-plane']
  });

  expect(sdk.status).toBe('production-registered');
  expect(sdk.productionReady).toBe(true);
  expect(sdk.boundaries.inspectorOnly).toBe(false);
  expect(sdk.governance.execution).toBe('governed-production');
  expect(sdk.governance.sourceOfEthics).toBe('الكتاب والسنة');
  expect(fabric.getStatus().inspectorOnly).toBe(false);
});

test('registers full production SDK runtime for all governed languages', () => {
  const fabric = new SDKEnterpriseFederationFabric();
  const records = fabric.registerProductionRuntime();

  expect(records).toHaveLength(SUPPORTED_SDKS.length);
  expect(fabric.getStatus().registered).toBe(SUPPORTED_SDKS.length);
  expect(records.every((record) => record.productionReady)).toBe(true);
  expect(records.every((record) => record.domains.includes('development'))).toBe(true);
  expect(records.every((record) => record.domains.includes('runtime'))).toBe(true);
  expect(records.every((record) => record.domains.includes('governance'))).toBe(true);
});

test('rejects unsupported production domains', () => {
  const fabric = new SDKEnterpriseFederationFabric();

  expect(() =>
    fabric.registerSDK({
      language: 'python',
      name: 'bad-sdk',
      domains: ['unknown-domain']
    })
  ).toThrow('Unsupported production domain');
});

test('generates programming language governance matrix', () => {
  const governance = new ProgrammingLanguageGovernanceFabric();
  const matrix = governance.generateIntegrationMatrix();

  expect(matrix.length).toBeGreaterThanOrEqual(7);
  expect(matrix.find((x) => x.language === 'python').governance.status).toBe('GOVERNED');
  expect(governance.getStatus().status).toBe('ACTIVE');
});
