import fs from 'node:fs';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = '/home/sheikha/Projects/sheikha/sheikha-main-portal';
const outDir = '/home/sheikha/.local/share/sheikha-mcp-federation/v2/continuations/mcp-root-sdk-activation-20261005/evidence';
const consumed = path.join(outDir, 'READONLY_MCP_HANDSHAKE_CONSUMED.json');
const resultFile = path.join(outDir, 'READONLY_MCP_HANDSHAKE_RESULT.json');

if (fs.existsSync(consumed)) {
  console.error('RERUN_DENIED: READONLY_MCP_HANDSHAKE already consumed');
  process.exit(23);
}

const client = new Client(
  { name: 'sheikha-readonly-verifier', version: '1.0.0' },
  { capabilities: {} }
);
const transport = new StdioClientTransport({
  command: 'node',
  args: [path.join(root, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')]
});

let result;
try {
  await client.connect(transport);
  const tools = await client.listTools();
  const resources = await client.listResources();
  const toolNames = tools.tools.map((t) => t.name).sort();
  const resourceUris = resources.resources.map((r) => r.uri).sort();
  const expectedTools = [
    'sheikha_catalog_evidence_status',
    'sheikha_federation_status',
    'sheikha_jannat_status',
    'sheikha_runtime_status'
  ].sort();
  const forbiddenPattern = /(write|delete|create|update|mutate|deploy|merge|payment|contract|secret|actuat|irrigat|execute|run_command)/i;
  const forbiddenExposed = toolNames.filter((name) => forbiddenPattern.test(name));
  const exactToolSet = JSON.stringify(toolNames) === JSON.stringify(expectedTools);
  result = {
    scope: 'READONLY_MCP_HANDSHAKE_V1',
    status: exactToolSet && forbiddenExposed.length === 0 ? 'PASS' : 'FAIL',
    exactToolSet,
    toolNames,
    resourceUris,
    forbiddenExposed,
    constraintsPreserved: true
  };
} catch (error) {
  result = {
    scope: 'READONLY_MCP_HANDSHAKE_V1',
    status: 'FAIL',
    error: error?.stack || String(error)
  };
} finally {
  try { await client.close(); } catch (_) {}
}

fs.writeFileSync(resultFile, JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(consumed, JSON.stringify({
  scope: 'READONLY_MCP_HANDSHAKE_V1',
  consumed: true,
  rerunAllowed: false,
  resultFile
}, null, 2) + '\n');

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
