'use strict';

const fs = require('node:fs');
const {inspect, generate, OUTPUT} = require('../tools/activation/activate-sheikha-distributed-governance-production-v1');

describe('Sheikha distributed governance activation V1', () => {
  test('fails closed and does not expose configuration values', () => {
    const report = inspect({
      SHEIKHA_GOVERNANCE_KMS_PROVIDER: 'AWS_KMS',
      SHEIKHA_GOVERNANCE_KMS_KEY_ID: 'secret-key-id',
      SHEIKHA_GOVERNANCE_ED25519_PUBLIC_KEY_PEM: 'public-material',
      SHEIKHA_GOVERNANCE_REDIS_URL: 'redis://insecure.example',
      SHEIKHA_GOVERNANCE_WORM_AUDIT_URI: 's3://audit-bucket'
    });
    expect(report.status).toBe('EXTERNAL_RESOURCES_REQUIRED');
    expect(report.checks.redisTlsConfigured).toBe(false);
    expect(report.secretsExposed).toBe(false);
    expect(JSON.stringify(report)).not.toContain('secret-key-id');
    expect(JSON.stringify(report)).not.toContain('insecure.example');
  });

  test('treats configuration as insufficient without live verification', () => {
    const report = inspect({
      SHEIKHA_GOVERNANCE_KMS_PROVIDER: 'PKCS11_HSM',
      SHEIKHA_GOVERNANCE_KMS_KEY_ID: 'configured',
      SHEIKHA_GOVERNANCE_ED25519_PUBLIC_KEY_PEM: 'configured',
      SHEIKHA_GOVERNANCE_REDIS_URL: 'rediss://configured',
      SHEIKHA_GOVERNANCE_WORM_AUDIT_URI: 'https://configured'
    });
    expect(report.status).toBe('EXTERNAL_RESOURCES_CONFIGURED_VERIFICATION_REQUIRED');
    expect(report.commercialDistributedProductionReady).toBe(false);
    expect(report.blockers).toEqual(expect.arrayContaining([
      'externalSigningRoundTripVerified', 'redisAtomicOperationsVerified', 'wormAppendAndRetentionVerified'
    ]));
  });

  test('writes a redacted content-addressed activation report', () => {
    const report = generate();
    expect(fs.existsSync(OUTPUT)).toBe(true);
    expect(report.reportSha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
