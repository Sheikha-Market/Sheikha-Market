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
    system: 'SHEIKHA_STUDIO_V2',
    report: 'runtime/sheikha-studio-v2/v1/sheikha-studio-v2-report.json',
    checks: {
      engine: 'runtime/sheikha-studio-v2/v1/sheikha-studio-v2.json',
      registry: 'runtime/sheikha-studio-v2/v1/registries/studio-v2-modules.json',
      developerPlatform: 'runtime/sheikha-developer-platform/v1/sheikha-developer-platform-v1-report.json'
    }
  },
  {
    system: 'SHEIKHA_LSP_SERVER_V1',
    report: 'runtime/sheikha-lsp-server-v1/v1/sheikha-lsp-server-v1-report.json',
    checks: {
      engine: 'runtime/sheikha-lsp-server-v1/v1/sheikha-lsp-server-v1.json',
      registry: 'runtime/sheikha-lsp-server-v1/v1/registries/lsp-methods.json',
      protocolFabric: 'runtime/unified-protocol-fabric/v1/sheikha-unified-protocol-fabric-v1-report.json'
    }
  },
  {
    system: 'SHEIKHA_PACKAGE_REGISTRY_V1',
    report: 'runtime/sheikha-package-registry-v1/v1/sheikha-package-registry-v1-report.json',
    checks: {
      engine: 'runtime/sheikha-package-registry-v1/v1/sheikha-package-registry-v1.json',
      registry: 'runtime/sheikha-package-registry-v1/v1/registries/package-commands.json',
      developerPlatform: 'runtime/sheikha-developer-platform/v1/sheikha-developer-platform-v1-report.json'
    }
  },
  {
    system: 'SHEIKHA_MCP_GATEWAY_V2',
    report: 'runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2-report.json',
    checks: {
      engine: 'runtime/sheikha-mcp-gateway-v2/v1/sheikha-mcp-gateway-v2.json',
      registry: 'runtime/sheikha-mcp-gateway-v2/v1/registries/mcp-gateway-tools.json',
      sdkFabricMcp: 'runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json',
      controlTower: 'runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json'
    }
  }
];

const allReports = [];

for (const item of systems) {
  const checks = Object.fromEntries(Object.entries(item.checks).map(([k, p]) => [k, exists(p)]));
  const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  const report = {
    system: item.system,
    status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
    score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
    decision: missing.length ? `REVIEW_${item.system}_GAPS` : `${item.system}_ACTIVE_100`,
    checks,
    missing,
    principle: 'ولا حول ولا قوة إلا بالله'
  };
  write(item.report, JSON.stringify(report, null, 2) + '\n');
  write(item.report.replace('.json', '.md'), `# ${item.system}\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
  allReports.push(report);
}

const summary = {
  system: 'SHEIKHA_STUDIO_LSP_PACKAGE_MCP_ACTIVATION_V2',
  status: allReports.every(r => r.score === 100) ? 'ACTIVE' : 'ACTIVE_WITH_REVIEW',
  decision: allReports.every(r => r.score === 100) ? 'STUDIO_LSP_PACKAGE_MCP_ACTIVE_100' : 'REVIEW_STUDIO_LSP_PACKAGE_MCP_GAPS',
  reports: allReports.map(r => ({ system: r.system, decision: r.decision, score: r.score, missing: r.missing })),
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/sheikha-studio-v2/v1/sheikha-studio-lsp-package-mcp-v2-summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
