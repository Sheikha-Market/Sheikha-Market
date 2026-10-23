import fs from 'node:fs';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = '/home/sheikha/Projects/sheikha/sheikha-main-portal';
const outDir = '/home/sheikha/.local/share/sheikha-mcp-federation/v2/continuations/mcp-root-sdk-activation-20261005/evidence';
const consumed = path.join(outDir, 'CURRENT_AUDIT_BINDING_CONSUMED.json');
const resultFile = path.join(outDir, 'CURRENT_AUDIT_BINDING_RESULT.json');

if (fs.existsSync(consumed)) {
  console.error('RERUN_DENIED: CURRENT_AUDIT_BINDING_V1 already consumed');
  process.exit(23);
}

const client = new Client({ name: 'sheikha-current-audit-verifier', version: '1.0.0' }, { capabilities: {} });
const transport = new StdioClientTransport({
  command: 'node',
  args: [path.join(root, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')]
});

let result;
try {
  await client.connect(transport);
  const response = await client.callTool({ name: 'sheikha_federation_status', arguments: {} });
  const text = response?.content?.find((item) => item.type === 'text')?.text;
  const payload = JSON.parse(text || '{}');
  const data = payload?.audit?.data || {};
  const states = Object.fromEntries((data.chatgptPlugins || []).map((x) => [x.system, x.state]));
  const checks = {
    currentReference: data.reference === 'SHEIKHA_MCP_SDK_CURRENT_20261005',
    teamsReadVerified: states['Microsoft Teams'] === 'READ_VERIFIED',
    asanaReadVerified: states['Asana'] === 'READ_VERIFIED',
    neonFailClosed: states['Neon'] === 'PLUGIN_STATE_INCONSISTENT_MCP_NOT_LOADED',
    p8StillClosed: data?.jannat?.P8 === 'DO_NOT_LAUNCH',
    nodeSdkDirect: data?.sdk?.node?.directRootDependency === true,
    pythonMcpPinned: data?.sdk?.python?.requirementsPinned === true
  };
  result = {
    scope: 'CURRENT_AUDIT_BINDING_V1',
    status: Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL',
    checks
  };
} catch (error) {
  result = { scope: 'CURRENT_AUDIT_BINDING_V1', status: 'FAIL', error: error?.stack || String(error) };
} finally {
  try { await client.close(); } catch (_) {}
}

fs.writeFileSync(resultFile, JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(consumed, JSON.stringify({
  scope: 'CURRENT_AUDIT_BINDING_V1',
  consumed: true,
  rerunAllowed: false,
  resultFile
}, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
