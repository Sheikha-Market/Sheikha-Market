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
  engine: exists('runtime/service-mesh-fabric-v1/v1/sheikha-service-mesh-fabric-v1.json'),
  registry: exists('runtime/service-mesh-fabric-v1/v1/registries/service-registry.json'),
  health: exists('runtime/service-mesh-fabric-v1/v1/registries/service-health.json'),
  routes: exists('runtime/service-mesh-fabric-v1/v1/registries/service-routes.json'),
  docs: exists('docs/service-mesh-fabric-v1/SHEIKHA-SERVICE-MESH-FABRIC-V1.md'),
  productionRuntime: exists('runtime/production-runtime-fabric-v1/v1/sheikha-production-runtime-fabric-v1-report.json'),
  cli: exists('runtime/sheikha-cli-v1/v1/sheikha-cli-v1-report.json'),
  mcp: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  saas: exists('runtime/saas-platform-layer-v1/v1/sheikha-saas-platform-layer-v1-report.json')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
const services = read('runtime/service-mesh-fabric-v1/v1/registries/service-registry.json').services;
const routes = read('runtime/service-mesh-fabric-v1/v1/registries/service-routes.json').routes;

const report = {
  system: 'SHEIKHA_SERVICE_MESH_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  decision: missing.length ? 'REVIEW_SERVICE_MESH_FABRIC_V1_GAPS' : 'SERVICE_MESH_FABRIC_V1_ACTIVE_100',
  checks,
  missing,
  coverage: { services: services.length, routes: routes.length },
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/service-mesh-fabric-v1/v1/sheikha-service-mesh-fabric-v1-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
