'use strict';

const {
  evaluateReleaseReadiness,
  classifyProductionSecret,
  findPm2ProcessEnvironmentSecretKeys,
  getProductionSecretStatus
} = require('../scripts/sheikha-production-readiness-gate');

describe('Sheikha release evidence gate', () => {
  test.each([null, undefined, false])('does not release with qualityReady=%s', (qualityReady) => {
    const decision = evaluateReleaseReadiness({
      operationalReady: true,
      productionSecretsReady: true,
      cleanWorkspace: true,
      qualityReady
    });
    expect(decision.candidateEligible).toBe(false);
    expect(decision.status).toBe('CHECK_REQUIRED');
  });

  test('requires an isolated clean candidate after quality passes', () => {
    const checks = {operationalReady: true, productionSecretsReady: true, qualityReady: true};
    expect(evaluateReleaseReadiness(checks).status).toBe('STABILIZATION_REQUIRED');
    expect(evaluateReleaseReadiness({...checks, cleanWorkspace: true}).candidateEligible).toBe(true);
  });
});

describe('Sheikha production secret readiness', () => {
  test.each([
    ['JWT_SECRET', '', 'MISSING'],
    ['JWT_SECRET', '${JWT_SECRET}', 'UNRESOLVED_REFERENCE'],
    ['JWT_SECRET', 'change-me-in-production', 'PLACEHOLDER'],
    ['JWT_SECRET', 'short', 'TOO_SHORT'],
    ['DATABASE_URL', 'https://db.example.test/sheikha', 'INVALID_PROTOCOL'],
    ['REDIS_URL', 'not-a-url', 'INVALID_URL']
  ])('rejects %s as %s', (key, value, classification) => {
    expect(classifyProductionSecret(key, value)).toEqual({
      configured: false,
      classification
    });
  });

  test.each([
    ['DATABASE_URL', 'postgres://localhost/sheikha'],
    ['REDIS_URL', 'redis://127.0.0.1:6379']
  ])('accepts %s for a declared single-host deployment', (key, value) => {
    expect(classifyProductionSecret(key, value)).toEqual({
      configured: true,
      classification: 'LOCAL_ONLY',
      deploymentScope: 'SINGLE_HOST'
    });
  });

  test('accepts strong keys and governed remote service URLs', () => {
    expect(classifyProductionSecret('JWT_SECRET', 'a'.repeat(32)).configured).toBe(true);
    expect(classifyProductionSecret('DATA_ENCRYPTION_KEY', 'b'.repeat(64)).configured).toBe(true);
    expect(classifyProductionSecret('DATABASE_URL', 'postgresql://db.internal/sheikha').configured).toBe(true);
    expect(classifyProductionSecret('REDIS_URL', 'rediss://cache.internal:6380').configured).toBe(true);
  });

  test('reports every required key without exposing values', () => {
    const result = getProductionSecretStatus({
      JWT_SECRET: '${JWT_SECRET}',
      DATA_ENCRYPTION_KEY: 'b'.repeat(64),
      DATABASE_URL: 'postgresql://db.internal/sheikha',
      REDIS_URL: 'redis://localhost:6379'
    });

    expect(result.ready).toBe(false);
    expect(result.externallyDistributedReady).toBe(false);
    expect(result.localOnlyKeys).toEqual(['REDIS_URL']);
    expect(result.valuesExposed).toBe(false);
    expect(result.processEnvironmentSecretKeys).toEqual([]);
    expect(result.keys).toEqual([
      { key: 'JWT_SECRET', configured: false, classification: 'UNRESOLVED_REFERENCE' },
      { key: 'DATA_ENCRYPTION_KEY', configured: true, classification: 'CONFIGURED' },
      {
        key: 'DATABASE_URL',
        configured: true,
        classification: 'CONFIGURED',
        deploymentScope: 'REMOTE_OR_DISTRIBUTED'
      },
      {
        key: 'REDIS_URL',
        configured: true,
        classification: 'LOCAL_ONLY',
        deploymentScope: 'SINGLE_HOST'
      }
    ]);
  });

  test('blocks readiness when PM2 metadata contains sensitive variables without exposing values', () => {
    const secretValue = 'never-include-this-value-in-readiness-output';
    const pm2List = [{
      name: 'sheikha-main-portal',
      pm2_env: {
        JWT_SECRET: secretValue,
        env: { DATABASE_URL: secretValue },
        SAFE_SETTING: 'visible'
      }
    }];
    const exposedKeys = findPm2ProcessEnvironmentSecretKeys(pm2List);
    const result = getProductionSecretStatus({
      JWT_SECRET: 'a'.repeat(32),
      DATA_ENCRYPTION_KEY: 'b'.repeat(64),
      DATABASE_URL: 'postgresql://db.internal/sheikha',
      REDIS_URL: 'rediss://cache.internal:6380'
    }, exposedKeys);

    expect(exposedKeys).toEqual(['DATABASE_URL', 'JWT_SECRET']);
    expect(result.ready).toBe(false);
    expect(result.valuesExposed).toBe(true);
    expect(result.processEnvironmentSecretKeys).toEqual(exposedKeys);
    expect(JSON.stringify(result)).not.toContain(secretValue);
  });
});
