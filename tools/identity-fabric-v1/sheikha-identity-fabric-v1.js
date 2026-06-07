'use strict';

const fs = require('fs');
const path = require('path');
const root = process.cwd();
const exists = p => fs.existsSync(path.join(root, p));
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), c);
};

const checks = {
  engine: exists('runtime/identity-fabric-v1/v1/sheikha-identity-fabric-v1.json'),
  roles: exists('runtime/identity-fabric-v1/v1/registries/identity-roles.json'),
  policies: exists('runtime/identity-fabric-v1/v1/registries/identity-policies.json'),
  tenantIsolation: exists('runtime/identity-fabric-v1/v1/registries/tenant-isolation.json'),
  docs: exists('docs/identity-fabric-v1/SHEIKHA-IDENTITY-FABRIC-V1.md'),
  saas: exists('runtime/saas-platform-layer-v1/v1/sheikha-saas-platform-layer-v1-report.json'),
  serviceMesh: exists('runtime/service-mesh-fabric-v1/v1/sheikha-service-mesh-fabric-v1-report.json'),
  productionRuntime: exists('runtime/production-runtime-fabric-v1/v1/sheikha-production-runtime-fabric-v1-report.json')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
const roles = read('runtime/identity-fabric-v1/v1/registries/identity-roles.json').roles;
const policies = read('runtime/identity-fabric-v1/v1/registries/identity-policies.json').policies;
const isolation = read('runtime/identity-fabric-v1/v1/registries/tenant-isolation.json').rules;

const report = {
  system: 'SHEIKHA_IDENTITY_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  decision: missing.length ? 'REVIEW_IDENTITY_FABRIC_V1_GAPS' : 'IDENTITY_FABRIC_V1_ACTIVE_100',
  checks,
  missing,
  coverage: { roles: roles.length, policies: policies.length, isolationRules: isolation.length },
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/identity-fabric-v1/v1/sheikha-identity-fabric-v1-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
