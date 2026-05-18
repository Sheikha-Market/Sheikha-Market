/**
 * اختبار أصول التشغيل الشامل: VPS + MCP + GitHub + VS Code + Hyperscale
 */
'use strict';

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

const root = path.join(__dirname, '..');
const repo = path.join(root, '..');

console.log('\n[1] Production Ops Assets');

const requiredFiles = [
  'scripts/harden-ubuntu-vps.sh',
  'scripts/generate-production-env.js',
  'scripts/backup-encrypted.sh',
  'scripts/restore-backup-drill.sh',
  'mcp-servers/Dockerfile',
  'infra/observability/grafana/provisioning/dashboards/dashboards.yml',
  'infra/observability/grafana/dashboards/sheikha-operations.json',
  'sheikha-vscode-extension/package.json',
  'scripts/activate-hyperscale-foundation.js'
];

for (const rel of requiredFiles) {
  assert(fs.existsSync(path.join(root, rel)), `${rel} exists`);
}

assert(fs.existsSync(path.join(repo, '.github/workflows/sheikha-cloud-agent.yml')), 'GitHub cloud agent workflow exists');
assert(fs.existsSync(path.join(repo, '.github/workflows/neural-root-activation.yml')), 'GitHub neural activation workflow exists');

const compose = fs.readFileSync(path.join(root, 'infra/docker/compose/prod/docker-compose.yml'), 'utf8');
assert(compose.includes('mcp-sdk:'), 'docker compose includes mcp-sdk service');
assert(compose.includes('mcp-ide:'), 'docker compose includes mcp-ide service');

const envExample = fs.readFileSync(path.join(root, 'infra/docker/compose/prod/.env.example'), 'utf8');
assert(envExample.includes('SHEIKHA_SDK_TOKEN='), '.env example includes SDK token');
assert(envExample.includes('SHEIKHA_IDE_TOKEN='), '.env example includes IDE token');
assert(envExample.includes('BACKUP_PASSPHRASE='), '.env example includes backup passphrase');
assert(envExample.includes('GOOGLE_CLIENT_ID='), '.env example includes Google OAuth client ID');
assert(envExample.includes('GOOGLE_CLIENT_SECRET='), '.env example includes Google OAuth client secret');
assert(envExample.includes('GOOGLE_AI_API_KEY='), '.env example includes Google AI API key');
assert(envExample.includes('GOOGLE_PROJECT_ID='), '.env example includes Google project ID');
assert(envExample.includes('GOOGLE_CLOUD_PROJECT='), '.env example includes Google Cloud project');
assert(envExample.includes('GOOGLE_MAPS_API_KEY='), '.env example includes Google Maps API key');
assert(envExample.includes('GA4_MEASUREMENT_ID='), '.env example includes GA4 measurement ID');
assert(envExample.includes('GA4_API_SECRET='), '.env example includes GA4 API secret');
assert(envExample.includes('GOOGLE_PAY_MERCHANT_ID='), '.env example includes Google Pay merchant ID');

const prometheus = fs.readFileSync(path.join(root, 'infra/observability/prometheus/prometheus.yml'), 'utf8');
assert(prometheus.includes('neural-root-health'), 'prometheus scrapes neural root health');
assert(prometheus.includes('mcp-sdk-health'), 'prometheus scrapes mcp sdk health');
assert(prometheus.includes('mcp-ide-health'), 'prometheus scrapes mcp ide health');

const alerts = fs.readFileSync(path.join(root, 'infra/observability/prometheus/alert_rules.yml'), 'utf8');
assert(alerts.includes('NeuralRootHealthDown'), 'alert rules include neural root alert');
assert(alerts.includes('MCPSDKDown'), 'alert rules include mcp sdk alert');
assert(alerts.includes('MCPIDEDown'), 'alert rules include mcp ide alert');

const extensionPkg = JSON.parse(fs.readFileSync(path.join(root, 'sheikha-vscode-extension/package.json'), 'utf8'));
assert(extensionPkg.keywords.includes('copilot'), 'VS Code extension advertises Copilot integration');
assert(extensionPkg.keywords.includes('github'), 'VS Code extension advertises GitHub integration');

console.log(`\nPassed: ${passed} | Failed: ${failed}`);
if (failed > 0) process.exit(1);
