#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT = path.join(ROOT, 'runtime/governance/control-plane/v1/sheikha-distributed-governance-production-v1-report.json');

function inspect(env = process.env) {
  const kmsProvider = String(env.SHEIKHA_GOVERNANCE_KMS_PROVIDER || '').trim();
  const keyIdPresent = Boolean(String(env.SHEIKHA_GOVERNANCE_KMS_KEY_ID || '').trim());
  const publicKeyPresent = Boolean(String(env.SHEIKHA_GOVERNANCE_ED25519_PUBLIC_KEY_PEM || '').trim());
  const redisUrl = String(env.SHEIKHA_GOVERNANCE_REDIS_URL || '').trim();
  const wormUri = String(env.SHEIKHA_GOVERNANCE_WORM_AUDIT_URI || '').trim();
  const checks = {
    kmsProviderConfigured: ['AWS_KMS', 'AZURE_KEY_VAULT', 'GCP_KMS', 'PKCS11_HSM'].includes(kmsProvider),
    kmsKeyIdConfigured: keyIdPresent,
    ed25519PublicKeyConfigured: publicKeyPresent,
    redisTlsConfigured: redisUrl.startsWith('rediss://'),
    wormAuditSinkConfigured: /^(s3|gs|https|azure):\/\//.test(wormUri),
    externalConnectivityVerified: false,
    externalSigningRoundTripVerified: false,
    redisAtomicOperationsVerified: false,
    wormAppendAndRetentionVerified: false
  };
  const configured = checks.kmsProviderConfigured && checks.kmsKeyIdConfigured && checks.ed25519PublicKeyConfigured && checks.redisTlsConfigured && checks.wormAuditSinkConfigured;
  const ready = Object.values(checks).every(Boolean);
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_DISTRIBUTED_GOVERNANCE_PRODUCTION_ACTIVATION_V1',
    status: ready ? 'DISTRIBUTED_PRODUCTION_VERIFIED' : configured ? 'EXTERNAL_RESOURCES_CONFIGURED_VERIFICATION_REQUIRED' : 'EXTERNAL_RESOURCES_REQUIRED',
    checkedAt: new Date().toISOString(),
    checks,
    providerMetadata: {
      kmsProvider: kmsProvider || null,
      keyIdPresent,
      publicKeyPresent,
      redisTlsUrlPresent: Boolean(redisUrl),
      wormAuditUriPresent: Boolean(wormUri)
    },
    secretsExposed: false,
    commercialDistributedProductionReady: ready,
    blockers: Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name)
  };
  report.reportSha256 = crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex');
  return report;
}

function generate() {
  const report = inspect();
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(generate(), null, 2)}\n`);
module.exports = {inspect, generate, OUTPUT};
