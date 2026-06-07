'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const exists = p => fs.existsSync(path.join(ROOT, p));
const existsAny = patterns => patterns.some(pattern => {
  const parts = pattern.split('/');
  const base = parts[0];
  if (!fs.existsSync(path.join(ROOT, base))) return false;
  const walk = dir => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      const rel = path.relative(ROOT, full);
      if (item.isDirectory()) {
        if (walk(full)) return true;
      } else if (rel.includes('sdk') && rel.includes('fabric') && rel.includes('mcp') && rel.endsWith('report.json')) {
        return true;
      }
    }
    return false;
  };
  return walk(path.join(ROOT, base));
});
const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), c);
};

const checks = {
  engine: exists('runtime/production-runtime-fabric-v1/v1/sheikha-production-runtime-fabric-v1.json'),
  services: exists('runtime/production-runtime-fabric-v1/v1/registries/runtime-services.json'),
  endpoints: exists('runtime/production-runtime-fabric-v1/v1/registries/runtime-endpoints.json'),
  bindings: exists('runtime/production-runtime-fabric-v1/v1/registries/runtime-bindings.json'),
  docs: exists('docs/production-runtime-fabric-v1/SHEIKHA-PRODUCTION-RUNTIME-FABRIC-V1.md'),

  protocolRuntime: exists('tests/sheikha-protocol-runtime-integration.test.js'),
  saasLayer: exists('runtime/saas-platform-layer-v1/v1/sheikha-saas-platform-layer-v1-report.json'),
  mcpGateway: exists('runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json'),
  sdkFabricMcp: exists('runtime/sdk-fabric-mcp-integration-v1/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json') || existsAny(['runtime']),
  serviceTiers: exists('docs/SERVICE_TIERS_ARCHITECTURE.md'),
  serviceTiersApi: exists('docs/SERVICE_TIERS_API_REFERENCE.md'),
  marketplaceOS: exists('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json'),
  projectLifecycle: exists('runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1-report.json'),
  workflowAutomation: exists('runtime/workflow-automation-engine-v1/v1/sheikha-workflow-automation-engine-v1-report.json'),
  unifiedDataFabric: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const services = readJson('runtime/production-runtime-fabric-v1/v1/registries/runtime-services.json').services;
const endpoints = readJson('runtime/production-runtime-fabric-v1/v1/registries/runtime-endpoints.json').endpoints;
const bindings = readJson('runtime/production-runtime-fabric-v1/v1/registries/runtime-bindings.json').bindings;

const report = {
  system: 'SHEIKHA_PRODUCTION_RUNTIME_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_PRODUCTION_RUNTIME_FABRIC_V1_GAPS' : 'PRODUCTION_RUNTIME_FABRIC_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    services: services.length,
    endpoints: endpoints.length,
    bindings: bindings.length
  },
  cycle: [
    "TENANT",
    "IDENTITY",
    "GOVERNANCE",
    "DECISION",
    "SERVICE",
    "MCP",
    "SDK",
    "RUNTIME",
    "OBSERVABILITY",
    "AUDIT",
    "IMPROVEMENT"
  ],
  principle: 'عبادة الله وإعمار الأرض بالحق والعدل والإحسان، ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/production-runtime-fabric-v1/v1/sheikha-production-runtime-fabric-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/production-runtime-fabric-v1/v1/sheikha-production-runtime-fabric-v1-report.md',
  `# SHEIKHA_PRODUCTION_RUNTIME_FABRIC_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
