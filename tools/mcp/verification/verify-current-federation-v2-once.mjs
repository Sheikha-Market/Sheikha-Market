import fs from 'node:fs';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = '/home/sheikha/Projects/sheikha/sheikha-main-portal';
const outDir = '/home/sheikha/.local/share/sheikha-mcp-federation/v2/continuations/mcp-root-sdk-activation-20261005/evidence';
const consumed = path.join(outDir, 'CURRENT_FEDERATION_V2_CONSUMED.json');
const resultFile = path.join(outDir, 'CURRENT_FEDERATION_V2_RESULT.json');

if (fs.existsSync(consumed)) {
  console.error('RERUN_DENIED: CURRENT_FEDERATION_V2 already consumed');
  process.exit(23);
}

const client = new Client({ name: 'sheikha-current-federation-v2-verifier', version: '1.0.0' }, { capabilities: {} });
const transport = new StdioClientTransport({
  command: 'node',
  args: [path.join(root, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')]
});

let result;
try {
  await client.connect(transport);
  const response = await client.callTool({ name: 'sheikha_federation_status', arguments: {} });
  const text = response?.content?.find((x) => x.type === 'text')?.text;
  const payload = text ? JSON.parse(text) : null;
  const data = payload?.audit?.data;
  const pluginMap = Object.fromEntries((data?.chatgptPlugins || []).map((x) => [x.system, x]));
  const checks = {
    currentReference: data?.reference === 'SHEIKHA_MCP_SDK_CURRENT_20261005',
    nodeSdkPinned: data?.sdk?.node?.version === '1.32.0' && data?.sdk?.node?.directRootDependency === true,
    pythonSdkPinned: data?.sdk?.python?.version === '2.3.0' && data?.sdk?.python?.pipCheck === 'PASS',
    teamsReadVerified: pluginMap['Microsoft Teams']?.state === 'READ_VERIFIED',
    asanaReadVerified: pluginMap['Asana']?.state === 'READ_VERIFIED',
    neonFailClosed: pluginMap['Neon']?.eligibleForP8Authority === false,
    p7Preserved: data?.jannat?.P7 === 'ACCEPTED_PRESERVED_NO_RERUN',
    p8Closed: data?.jannat?.P8 === 'DO_NOT_LAUNCH',
    noMerge: data?.constraints?.includes('NO_MERGE') === true,
    noProduction: data?.constraints?.includes('NO_PRODUCTION') === true
  };
  result = {
    scope: 'CURRENT_FEDERATION_V2',
    status: Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL',
    checks,
    sourceReference: data?.reference || null
  };
} catch (error) {
  result = { scope: 'CURRENT_FEDERATION_V2', status: 'FAIL', error: error?.stack || String(error) };
} finally {
  try { await client.close(); } catch (_) {}
}

fs.writeFileSync(resultFile, JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(consumed, JSON.stringify({
  scope: 'CURRENT_FEDERATION_V2',
  consumed: true,
  rerunAllowed: false,
  resultFile
}, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
