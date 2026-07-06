'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const exists = p => fs.existsSync(path.join(ROOT, p));
const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), c);
};

const systems = [
  {
    system: 'SHEIKHA_MARKETPLACE_CATALOG_V2',
    report: 'runtime/marketplace-catalog-v2/v1/sheikha-marketplace-catalog-v2-report.json',
    registry: 'runtime/marketplace-catalog-v2/v1/registries/catalog-objects.json',
    key: 'objects',
    checks: {
      engine: 'runtime/marketplace-catalog-v2/v1/sheikha-marketplace-catalog-v2.json',
      registry: 'runtime/marketplace-catalog-v2/v1/registries/catalog-objects.json',
      resourceProductMarket: 'runtime/resource-product-market-intelligence/v1/sheikha-resource-product-market-intelligence-v1-report.json',
      operationalPlatform: 'runtime/operational-platform-v1/v1/sheikha-operational-platform-v1-report.json'
    }
  },
  {
    system: 'SHEIKHA_CRM_SALES_PIPELINE_V2',
    report: 'runtime/crm-sales-pipeline-v2/v1/sheikha-crm-sales-pipeline-v2-report.json',
    registry: 'runtime/crm-sales-pipeline-v2/v1/registries/pipeline-stages.json',
    key: 'stages',
    checks: {
      engine: 'runtime/crm-sales-pipeline-v2/v1/sheikha-crm-sales-pipeline-v2.json',
      registry: 'runtime/crm-sales-pipeline-v2/v1/registries/pipeline-stages.json',
      mcpGateway: 'runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json',
      operationalPlatform: 'runtime/operational-platform-v1/v1/sheikha-operational-platform-v1-report.json'
    }
  },
  {
    system: 'SHEIKHA_EXECUTIVE_DASHBOARD_GENERATOR_V2',
    report: 'runtime/executive-dashboard-generator-v2/v1/sheikha-executive-dashboard-generator-v2-report.json',
    registry: 'runtime/executive-dashboard-generator-v2/v1/registries/dashboard-types.json',
    key: 'dashboards',
    checks: {
      engine: 'runtime/executive-dashboard-generator-v2/v1/sheikha-executive-dashboard-generator-v2.json',
      registry: 'runtime/executive-dashboard-generator-v2/v1/registries/dashboard-types.json',
      controlTower: 'runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json',
      digitalTwin: 'runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'
    }
  }
];

const reports = [];

for (const s of systems) {
  const checks = Object.fromEntries(Object.entries(s.checks).map(([k, p]) => [k, exists(p)]));
  const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  const registry = exists(s.registry) ? readJson(s.registry) : { [s.key]: [] };
  const report = {
    system: s.system,
    status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
    score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
    decision: missing.length ? `REVIEW_${s.system}_GAPS` : `${s.system}_ACTIVE_100`,
    checks,
    missing,
    coverage: { [s.key]: registry[s.key].length },
    principle: 'ولا حول ولا قوة إلا بالله'
  };
  write(s.report, JSON.stringify(report, null, 2) + '\n');
  write(s.report.replace('.json', '.md'), `# ${s.system}\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
  reports.push(report);
}

const summary = {
  system: 'SHEIKHA_COMMERCIAL_OPS_V2',
  status: reports.every(r => r.score === 100) ? 'ACTIVE' : 'ACTIVE_WITH_REVIEW',
  decision: reports.every(r => r.score === 100) ? 'COMMERCIAL_OPS_V2_ACTIVE_100' : 'REVIEW_COMMERCIAL_OPS_V2_GAPS',
  reports: reports.map(r => ({ system: r.system, decision: r.decision, score: r.score, missing: r.missing })),
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/executive-dashboard-generator-v2/v1/sheikha-commercial-ops-v2-summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
