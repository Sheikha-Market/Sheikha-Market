#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const governance = require('../../core/security/sheikha-sdk-mcp-governance.cjs');
const ROOT = path.resolve(__dirname, '../..');
const ADAPTER = 'mcp-servers/sheikha-mcp-readonly-federation.cjs';
const CONFIGS = ['.mcp.json', '.cursor/mcp.json', '.vscode/mcp.json', 'config/mcp-servers.template.json'];

function inspectBindings(doc, flavor, root = ROOT) {
  const servers = flavor === 'vscode' ? doc?.servers : doc?.mcpServers;
  if (!servers || Array.isArray(servers) || typeof servers !== 'object') return false;
  const local = servers['sheikha-readonly'];
  if (!local || local.command !== 'node' || !Array.isArray(local.args) || local.args.length !== 1 ||
      typeof local.args[0] !== 'string' || (local.type !== undefined && local.type !== 'stdio') ||
      (local.cwd !== undefined && typeof local.cwd !== 'string') ||
      Object.keys(local).some(key => !['command', 'args', 'type', 'cwd'].includes(key))) return false;
  const cwd = local.cwd ? path.resolve(root, local.cwd.replaceAll('${workspaceFolder}', root)) : root;
  if (cwd !== root || path.resolve(cwd, local.args[0].replaceAll('${workspaceFolder}', root)) !== path.join(root, ADAPTER)) return false;
  return Object.entries(servers).every(([name, server]) => name === 'sheikha-readonly' ||
    (server && typeof server === 'object' && !Array.isArray(server) && !/sheikha/i.test(name) &&
      (server.args === undefined || (Array.isArray(server.args) && server.args.every(arg =>
        typeof arg === 'string' && !/sheikha-mcp/.test(arg))))));
}

function check() {
  const bindings = CONFIGS.map(file => {
    try { return { file, aligned: inspectBindings(JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8')), file.startsWith('.vscode') ? 'vscode' : 'standard') }; }
    catch (_) { return { file, aligned: false }; }
  });
  let contract;
  try { contract = governance.federationStatus(); } catch (_) { contract = null; }
  return {
    status: bindings.every(item => item.aligned) && contract ? 'PASS' : 'BLOCKED',
    scope: 'PROJECT_LOCAL_MCP_BINDINGS_AND_POLICY_ONLY', bindings,
    policySha256: contract?.policySha256 || null,
    admittedTools: contract?.tools || [],
    globalHostPermissionsVerified: false, externalChatgptConnectionVerified: false,
    independentConnectorsChanged: false, remediationPerformed: false
  };
}

function auditHosts() {
  const { spawnSync } = require('node:child_process');
  const home = require('node:os').homedir();
  const child = spawnSync('python3', ['-B', path.join(__dirname, 'sheikha-assistant-host-audit.py')], {
    cwd: ROOT, encoding: 'utf8', timeout: 5000, maxBuffer: 65536,
    env: { PATH: process.env.PATH, HOME: home, CODEX_HOME: process.env.CODEX_HOME || path.join(home, '.codex') }
  });
  try {
    const report = JSON.parse(child.stdout);
    if (child.status !== 0 || report.status !== 'PASS') return { ...report, status: 'BLOCKED' };
    return report;
  } catch (_) { return { status: 'BLOCKED', error: 'HOST_AUDIT_UNAVAILABLE' }; }
}

async function probeLocalBridge() {
  const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
  const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
  const client = new Client({ name: 'sheikha-local-governance-probe', version: '1.0.0' }, { capabilities: {} });
  // The probe never executes a command read from a client or host configuration.
  const transport = new StdioClientTransport({ command: process.execPath,
    args: [path.join(ROOT, ADAPTER)], cwd: ROOT, stderr: 'pipe', env: { HOME: require('node:os').homedir() } });
  transport.stderr?.resume();
  try {
    await client.connect(transport, { timeout: 5000 });
    const tools = (await client.listTools({}, { timeout: 5000 })).tools;
    const response = await client.callTool({ name: 'sheikha_environment_governance_status', arguments: {} }, undefined, { timeout: 5000 });
    const observed = JSON.parse(response.content[0].text);
    const expected = governance.federationStatus();
    const checks = {
      policyMatches: observed.policySha256 === expected.policySha256,
      catalogMatches: JSON.stringify(tools.map(tool => tool.name).sort()) === JSON.stringify([...expected.tools].sort()),
      readOnlyCatalog: tools.every(tool => tool.annotations?.readOnlyHint === true && tool.annotations?.destructiveHint === false),
      noMutationDispatch: observed.mutationDispatchAvailable === false,
      noImplicitPermissionTransfer: observed.activationTransfersPermissions === false,
    };
    return { status: !response.isError && Object.values(checks).every(Boolean) ? 'PASS' : 'BLOCKED',
      scope: 'DIRECT_LOCAL_STDIO_HANDSHAKE_NOT_APP_RELOAD', checks, toolCount: tools.length,
      policySha256: observed.policySha256, appSessionDiscoveryVerified: false, externalChatgptConnectionVerified: false };
  } catch (_) { return { status: 'BLOCKED', error: 'LOCAL_BRIDGE_PROBE_FAILED' }; }
  finally { await client.close().catch(() => {}); await transport.close().catch(() => {}); }
}

async function main(args) {
  if (args.some(arg => !['--hosts', '--probe'].includes(arg)) || new Set(args).size !== args.length) {
    process.stdout.write(JSON.stringify({ status: 'BLOCKED', error: 'ARGUMENTS_NOT_SUPPORTED' }) + '\n');
    process.exitCode = 2;
    return;
  }
  const result = { ...check(), observedAt: new Date().toISOString() };
  if (args.includes('--hosts')) {
    result.hostAudit = auditHosts();
    if (result.hostAudit.status !== 'PASS') result.status = 'BLOCKED';
  }
  if (args.includes('--probe')) {
    result.localProbe = result.status === 'PASS' ? await probeLocalBridge() : { status: 'BLOCKED', error: 'PRECHECK_FAILED' };
    if (result.localProbe.status !== 'PASS') result.status = 'BLOCKED';
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result.status !== 'PASS') process.exitCode = 2;
}
if (require.main === module) main(process.argv.slice(2)).catch(() => {
  process.stdout.write(JSON.stringify({ status: 'BLOCKED', error: 'GOVERNANCE_CHECK_FAILED' }) + '\n');
  process.exitCode = 2;
});
module.exports = { check, inspectBindings, auditHosts, probeLocalBridge };
