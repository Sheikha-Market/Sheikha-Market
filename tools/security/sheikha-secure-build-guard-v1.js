'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const config = require(path.join(ROOT, 'config/security/sheikha-security-foundation-v1.json'));

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}
function readJson(rel) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
  catch { return null; }
}
function readText(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
  catch { return ''; }
}

function inspectMcpConfig(rel, flavor) {
  const doc = readJson(rel);
  if (!doc) return { valid:false, httpsOnly:false, noInlineSecrets:false };
  const servers = flavor === 'vscode' ? doc.servers : doc.mcpServers;
  if (!servers || typeof servers !== 'object') return { valid:false, httpsOnly:false, noInlineSecrets:false };
  let httpsOnly = true;
  let noInlineSecrets = true;
  for (const server of Object.values(servers)) {
    if (server && typeof server.url === 'string' && !/^https:\/\//.test(server.url)) httpsOnly = false;
    const raw = JSON.stringify(server || {});
    if (/(api[_-]?key|token|secret|password)"?\s*:\s*"[^"$<{][^"]{6,}/i.test(raw)) noInlineSecrets = false;
  }
  return { valid:true, httpsOnly, noInlineSecrets };
}

function runSecureBuildGuard() {
  const rootMcp = inspectMcpConfig('.mcp.json', 'root');
  const vscodeMcp = inspectMcpConfig('.vscode/mcp.json', 'vscode');
  const cursorMcp = inspectMcpConfig('.cursor/mcp.json', 'root');
  const pkg = readJson('package.json') || {};
  const requirements = readText('requirements.txt');

  const checks = {
    foundation_manifest_valid: config.system === 'SHEIKHA_SECURITY_FOUNDATION_V1',
    hierarchy_complete: ['FOUNDATION','ROOTS','RULES','BUILD_GUARD','REPAIR_ENGINE','SECURITY_WATCH','SECURITY_GUARD']
      .every(x => config.hierarchy.includes(x)),
    root_mcp_json_valid: rootMcp.valid,
    vscode_mcp_json_valid: vscodeMcp.valid,
    cursor_mcp_json_valid: cursorMcp.valid,
    mcp_external_endpoints_https: rootMcp.httpsOnly && vscodeMcp.httpsOnly && cursorMcp.httpsOnly,
    mcp_no_inline_secret_values: rootMcp.noInlineSecrets && vscodeMcp.noInlineSecrets && cursorMcp.noInlineSecrets,
    node_mcp_sdk_exact_pin: pkg.dependencies?.['@modelcontextprotocol/sdk'] === '1.32.0',
    python_mcp_exact_pin: /^mcp==2\.3\.0$/m.test(requirements),
    node_lockfile_present: exists('package-lock.json'),
    security_baseline_present: exists('config/security/sheikha-security-foundation-v1.json'),
    existing_dependency_guardian_present: exists('tools/governance/sheikha-dependency-guardian.js'),
    existing_semantic_secret_scanner_present: exists('tools/security/semantic-secret-scan-v1.js')
  };

  const missing = Object.entries(checks).filter(([,v]) => !v).map(([k]) => k);
  return Object.freeze({
    system: 'SHEIKHA_SECURE_BUILD_GUARD_V1',
    status: missing.length ? 'BLOCKED' : 'PASS',
    promotionAllowed: missing.length === 0,
    automaticRepair: false,
    checks: Object.freeze(checks),
    missing: Object.freeze(missing),
    actionOnFailure: config.buildGuard.actionOnFailure
  });
}

if (require.main === module) {
  const result = runSecureBuildGuard();
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result.status !== 'PASS') process.exitCode = 2;
}

module.exports = Object.freeze({ runSecureBuildGuard });
