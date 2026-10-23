import fs from 'node:fs';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = '/home/sheikha/Projects/sheikha/sheikha-main-portal';
const outDir = '/home/sheikha/.local/share/sheikha-mcp-federation/v2/continuations/mcp-root-sdk-activation-20261005/evidence';
const consumed = path.join(outDir, 'READONLY_MCP_FUNCTIONAL_CONSUMED.json');
const resultFile = path.join(outDir, 'READONLY_MCP_FUNCTIONAL_RESULT.json');

if (fs.existsSync(consumed)) {
  console.error('RERUN_DENIED: READONLY_MCP_FUNCTIONAL_V1 already consumed');
  process.exit(23);
}

function parseTool(result) {
  const text = result?.content?.find((item) => item.type === 'text')?.text;
  return text ? JSON.parse(text) : null;
}

const client = new Client({ name: 'sheikha-readonly-functional-verifier', version: '1.0.0' }, { capabilities: {} });
const transport = new StdioClientTransport({
  command: 'node',
  args: [path.join(root, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')]
});

let result;
try {
  await client.connect(transport);
  const runtime = parseTool(await client.callTool({ name: 'sheikha_runtime_status', arguments: {} }));
  const jannat = parseTool(await client.callTool({ name: 'sheikha_jannat_status', arguments: {} }));
  const catalog = parseTool(await client.callTool({ name: 'sheikha_catalog_evidence_status', arguments: {} }));
  const resource = await client.readResource({ uri: 'sheikha://federation/audit' });

  const checks = {
    runtimeReadConnected: runtime?.result?.ok === true,
    p7EvidencePresent: jannat?.p7?.exists === true,
    p8AdmissionEvidencePresent: jannat?.p8Admission?.exists === true,
    catalogReadPreserved: catalog?.catalogRead?.exists === true,
    executionReceiptPreserved: catalog?.executionReceipt?.exists === true,
    federationResourceReadable: Array.isArray(resource?.contents) && resource.contents.length === 1
  };

  result = {
    scope: 'READONLY_MCP_FUNCTIONAL_V1',
    status: Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL',
    checks,
    runtimeHttpStatus: runtime?.result?.statusCode ?? null,
    preservation: {
      catalogReadRerun: false,
      p7Rerun: false,
      p8Launch: false
    }
  };
} catch (error) {
  result = { scope: 'READONLY_MCP_FUNCTIONAL_V1', status: 'FAIL', error: error?.stack || String(error) };
} finally {
  try { await client.close(); } catch (_) {}
}

fs.writeFileSync(resultFile, JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(consumed, JSON.stringify({
  scope: 'READONLY_MCP_FUNCTIONAL_V1',
  consumed: true,
  rerunAllowed: false,
  resultFile
}, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
