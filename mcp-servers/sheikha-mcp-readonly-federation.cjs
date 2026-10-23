#!/usr/bin/env node
'use strict';

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const governance = require('../core/security/sheikha-sdk-mcp-governance.cjs');
const { simulateFoundryTelecom } = require('../sdk/sheikha-js/foundry-telecom.cjs');
const { processNaturalData, getNaturalDataInputSchema } = require('../core/natural-data/sheikha-natural-data-v1.cjs');
const { interpretSensorBatch, getSensoryInputSchema } = require('../sdk/sheikha-js/sensory.cjs');

const HOME = process.env.HOME || '/home/sheikha';
const FED_ROOT = path.join(HOME, '.local/share/sheikha-mcp-federation/v2');

const EVIDENCE = Object.freeze({
  audit: path.join(FED_ROOT, 'current/SHEIKHA_MCP_SDK_CURRENT.json'),
  p7: path.join(FED_ROOT, 'continuations/original-v4-one-read-resume-20261004-164614/P7_ACCEPTANCE_RECEIPT.json'),
  p8: path.join(FED_ROOT, 'continuations/release-admission-review-20261005-020633/LAUNCH_ADMISSION_REVIEW.json'),
  catalog: path.join(FED_ROOT, 'continuations/original-v4-one-read-resume-20261004-164614/evidence/CATALOG_READ_OUTPUT.json'),
  executionReceipt: path.join(FED_ROOT, 'continuations/original-v4-one-read-resume-20261004-164614/evidence/EXECUTION_RECEIPT.json')
});

function readJson(file) {
  let fd;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > 1048576) throw Error('EVIDENCE_BOUND');
    const buffer = Buffer.alloc(1048577);
    let size = 0, count;
    while (size < buffer.length && (count = fs.readSync(fd, buffer, size, buffer.length - size, null))) size += count;
    if (size > 1048576) throw Error('EVIDENCE_BOUND');
    return { exists: true, evidence: 'PRESERVED_NOT_LIVE', data: JSON.parse(buffer.toString('utf8', 0, size)) };
  } catch (_) {
    return { exists: false, error: 'EVIDENCE_UNAVAILABLE' };
  } finally { if (fd !== undefined) fs.closeSync(fd); }
}

function getLocalJson(urlPath) {
  return new Promise((resolve) => {
    let timer;
    const finish = value => { clearTimeout(timer); resolve(value); };
    const req = http.get({
      host: '127.0.0.1',
      port: 8080,
      path: urlPath,
      timeout: 3000,
      headers: { accept: 'application/json' }
    }, (res) => {
      let body = '', bytes = 0;
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        bytes += Buffer.byteLength(chunk);
        if (bytes > 1048576) { finish({ ok: false, error: 'RESPONSE_TOO_LARGE' }); req.destroy(); }
        else body += chunk;
      });
      res.on('error', () => finish({ ok: false, error: 'LOCAL_RESPONSE_UNAVAILABLE' }));
      res.on('end', () => {
        let parsed = body;
        try { parsed = JSON.parse(body); } catch (_) {}
        finish({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, body: parsed });
      });
    });
    timer = setTimeout(() => { finish({ ok: false, error: 'timeout' }); req.destroy(); }, 3000);
    req.on('error', () => finish({ ok: false, error: 'LOCAL_RUNTIME_UNAVAILABLE' }));
    req.on('timeout', () => {
      req.destroy();
      finish({ ok: false, error: 'timeout' });
    });
  });
}

function asText(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

const server = new Server(
  {
    name: 'sheikha-mcp-readonly-federation',
    version: '1.0.0',
    description: 'Read-only Sheikha MCP federation facade; no mutation, deployment, payment, contract, secret, physical actuation, or irrigation tools.'
  },
  { capabilities: { tools: {}, resources: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: governance.toolCatalog([
    {
      name: 'sheikha_environment_governance_status',
      description: 'Read the shared local GPT/Codex boundary contract and policy fingerprint. Does not authenticate clients, enable plugins or synchronize external accounts.',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} }
    },
    {
      name: 'sheikha_federation_status',
      description: 'Read the preserved MCP/SDK federation audit only.',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} }
    },
    {
      name: 'sheikha_runtime_status',
      description: 'Read local Sheikha runtime status from 127.0.0.1:8080 only.',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} }
    },
    {
      name: 'sheikha_jannat_status',
      description: 'Read preserved Jannat P7 acceptance and P8 admission evidence only.',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} }
    },
    {
      name: 'sheikha_catalog_evidence_status',
      description: 'Read preserved catalog.read output and execution receipt only; does not rerun catalog.read.',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} }
    },
    {
      name: 'sheikha_foundry_telecom_simulation',
      description: 'Run a bounded in-memory simulation of seven production cells and five telemetry profiles. No device, internet, model inference, database, or physical actuation access.',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    {
      name: 'sheikha_natural_data_process',
      description: 'Validate and normalize a bounded caller-supplied natural-data batch in memory. Source declarations are unverified. No live sensors, URL fetching, files, database writes, or astronomy calculations.',
      inputSchema: getNaturalDataInputSchema(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    {
      name: 'sheikha_sensory_interpret',
      description: 'Validate and interpret a bounded caller-supplied sensor batch in Arabic or English using the local observatory contract. Checks age, units, declared quality and uncertainty. Stateless per request; source is unverified. No device connections, URL fetching, files, storage or actuation.',
      inputSchema: getSensoryInputSchema(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    }
  ], 'federation')
}));

const receipts = [];
const gate = governance.createToolGate({ surface: 'federation', audit: receipt => {
  receipts.push(receipt);
  if (receipts.length > 1000) receipts.shift();
} });
server.setRequestHandler(CallToolRequestSchema, async request => gate(request, async () => {
  switch (request.params.name) {
    case 'sheikha_environment_governance_status':
      return asText(governance.federationStatus());
    case 'sheikha_sensory_interpret':
      try {
        return asText(interpretSensorBatch(request.params.arguments));
      } catch (_) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'SENSORY_INPUT_REJECTED: batch validation failed; no data was stored and no device or network connection was attempted.' }]
        };
      }
    case 'sheikha_natural_data_process':
      try {
        return asText(processNaturalData(request.params.arguments));
      } catch (_) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'NATURAL_DATA_REJECTED: batch validation failed; no data was stored and no connection was attempted.' }]
        };
      }
    case 'sheikha_foundry_telecom_simulation':
      try {
        return asText(simulateFoundryTelecom(request.params.arguments));
      } catch (_) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'LOCAL_SIMULATION_REJECTED: only an empty arguments object is supported; no physical or network operation is available.' }]
        };
      }
    case 'sheikha_federation_status':
      return asText({
        mode: 'READ_ONLY',
        constraints: [
          'NO_MERGE','NO_DEPLOY','NO_PRODUCTION','NO_PAYMENT','NO_CONTRACT',
          'NO_ADS_SPEND','NO_SECRET_MUTATION','NO_PHYSICAL_ACTUATION','NO_IRRIGATION'
        ],
        audit: readJson(EVIDENCE.audit)
      });
    case 'sheikha_runtime_status':
      return asText({
        mode: 'READ_ONLY_LOCAL_HTTP_GET',
        target: 'http://127.0.0.1:8080/api/sheikha/status',
        result: await getLocalJson('/api/sheikha/status')
      });
    case 'sheikha_jannat_status':
      return asText({
        mode: 'READ_ONLY_PRESERVED_EVIDENCE',
        p7: readJson(EVIDENCE.p7),
        p8Admission: readJson(EVIDENCE.p8)
      });
    case 'sheikha_catalog_evidence_status':
      return asText({
        mode: 'READ_ONLY_PRESERVED_EVIDENCE_NO_RERUN',
        catalogRead: readJson(EVIDENCE.catalog),
        executionReceipt: readJson(EVIDENCE.executionReceipt)
      });
    default:
      throw new Error('Unknown read-only tool');
  }
}));

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: 'sheikha://federation/audit', name: 'MCP/SDK federation audit', mimeType: 'application/json' },
    { uri: 'sheikha://jannat/p7', name: 'Jannat P7 acceptance receipt', mimeType: 'application/json' },
    { uri: 'sheikha://jannat/p8-admission', name: 'Jannat P8 launch admission review', mimeType: 'application/json' },
    { uri: 'sheikha://catalog/read', name: 'Preserved catalog.read output', mimeType: 'application/json' }
  ].filter(resource => governance.resourceAllowed(resource.uri, 'federation'))
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (!governance.resourceAllowed(request.params.uri, 'federation')) throw Error('RESOURCE_NOT_ADMITTED');
  const mapping = {
    'sheikha://federation/audit': EVIDENCE.audit,
    'sheikha://jannat/p7': EVIDENCE.p7,
    'sheikha://jannat/p8-admission': EVIDENCE.p8,
    'sheikha://catalog/read': EVIDENCE.catalog
  };
  const file = mapping[request.params.uri];
  if (!file) throw new Error('Unknown read-only resource');
  const result = await gate.resource(request, () => asText(readJson(file)));
  if (result.isError) throw Error('RESOURCE_READ_DENIED');
  return {
    contents: [{
      uri: request.params.uri,
      mimeType: 'application/json',
      text: result.content[0].text
    }]
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Sheikha MCP Read-Only Federation] ready; mutations intentionally unavailable');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
