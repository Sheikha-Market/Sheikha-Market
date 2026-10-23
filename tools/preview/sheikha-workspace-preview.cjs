'use strict';

const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const crypto = require('node:crypto');
const express = require('express');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { createSheikhaClient } = require('../../sdk/sheikha-js');
const { buildUnifiedCommerceRuntime, buildCommerceOperationPlan } = require('../../core/commerce/sheikha-unified-commerce-runtime-v1');
const { createStudio } = require('./sheikha-robot-studio-routes.cjs');
const { getIndustrialCatalog, buildIndustrialPlan } = require('../../core/industrial/sheikha-industrial-planner-v1.cjs');
const { attachIndustrialFederation } = require('./sheikha-industrial-federation-routes.cjs');
const { createAssetDigitization } = require('../../core/ownership/sheikha-asset-digitization-v1.cjs');
const { attachSupplierLab } = require('./sheikha-supplier-lab-routes.cjs');

const ROOT = path.resolve(__dirname, '../..');
const API = '/api/sheikha/workspace/v1';
const OPERATIONS = Object.freeze({
  foundry: { method: 'simulateFoundryTelecom', tool: 'sheikha_foundry_telecom_simulation' },
  natural: { method: 'processNaturalData', tool: 'sheikha_natural_data_process' },
  sensory: { method: 'interpretSensorBatch', tool: 'sheikha_sensory_interpret' }
});
const EXAMPLES = {
  foundry: {},
  natural: require('../../docs/examples/sheikha-natural-data.synthetic.json'),
  sensory: require('../../docs/examples/sheikha-sensory-sdk.synthetic.json')
};

function validRequest(body) {
  return body && !Array.isArray(body) && Object.keys(body).sort().join(',') === 'arguments,operation,transport'
    && Object.hasOwn(OPERATIONS, body.operation) && ['sdk', 'mcp'].includes(body.transport)
    && body.arguments && typeof body.arguments === 'object' && !Array.isArray(body.arguments);
}

async function invoke(body) {
  if (!validRequest(body)) throw Error('INPUT_REJECTED');
  const operation = OPERATIONS[body.operation];
  if (body.transport === 'sdk') return createSheikhaClient()[operation.method](body.arguments);
  const client = new Client({ name: 'sheikha-workspace', version: '1.0.0' }, { capabilities: {} });
  const transport = new StdioClientTransport({ command: process.execPath,
    args: [path.join(ROOT, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')], cwd: ROOT, stderr: 'pipe' });
  transport.stderr?.resume();
  try {
    await client.connect(transport, { timeout: 5000 });
    const result = await client.callTool({ name: operation.tool, arguments: body.arguments }, undefined, { timeout: 8000 });
    if (result.isError || result.content?.[0]?.type !== 'text') throw Error('MCP_INPUT_REJECTED');
    return JSON.parse(result.content[0].text);
  } finally {
    await client.close().catch(() => {});
    await transport.close().catch(() => {});
  }
}

function visualStatus() {
  const read = name => {
    try {
      const file = path.join(ROOT, 'runtime/visual-foundry', `${name}.json`);
      if (fs.lstatSync(file).isSymbolicLink() || fs.statSync(file).size > 128 * 1024) return null;
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch { return null; }
  };
  const latest = read('latest'), watch = read('watch'), guard = read('guard');
  const age = watch && Date.now() - Date.parse(watch.at);
  return {
    source: 'PRESERVED_LOCAL_RECORDS_NOT_SERVICE_PROBE',
    draft: latest ? { id: latest.id, checkedAt: latest.checkedAt, status: latest.status } : null,
    watch: { recordedAt: watch?.at || null, freshRecord: Number.isFinite(age) && age >= 0 && age < 180000, processVerified: false },
    guard: guard ? { checkedAt: guard.checkedAt, decision: guard.decision, assetCount: guard.assetCount, issues: Array.isArray(guard.issues) ? guard.issues.length : null } : null,
    autoPublicationEnabled: false, paidGenerationEnabled: false
  };
}

function createWorkspaceServer(options = {}) {
  const app = express();
  app.disable('x-powered-by');
  const token = crypto.randomBytes(32).toString('hex');
  let busy = false, recent = [];
  app.use((req, res, next) => {
    // The preview is loopback-only; exact Host also prevents DNS rebinding.
    const expected = `127.0.0.1:${req.socket.localPort}`;
    if (req.headers.host !== expected) return res.status(403).json({ error: 'HOST_DENIED' });
    if ((req.headers.origin && req.headers.origin !== `http://${expected}`)
      || req.headers['sec-fetch-site'] === 'cross-site') return res.status(403).json({ error: 'ORIGIN_DENIED' });
    res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" });
    if (req.method === 'POST') {
      if (req.headers['x-sheikha-session'] !== token) return res.status(403).json({ error: 'SESSION_REQUIRED' });
      if (!req.is('application/json')) return res.status(415).json({ error: 'JSON_REQUIRED' });
      recent = recent.filter(at => Date.now() - at < 60000);
      if (recent.length >= 20) return res.status(429).json({ error: 'RATE_LIMITED' });
      recent.push(Date.now());
    } else if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).end();
    next();
  });
  app.use(express.json({ limit: '512kb', strict: true }));
  app.get(`${API}/session`, (_req, res) => res.json({ token }));
  app.get(`${API}/status`, (_req, res) => res.json({ mode: 'LOCAL_REVIEW_ONLY', operations: Object.keys(OPERATIONS), busy,
    realDevicesConnected: false, externalNetworkEnabled: false, visualFoundry: visualStatus() }));
  app.get(`${API}/industry/catalog`, (_req, res) => res.json(getIndustrialCatalog()));
  app.post(`${API}/industry/plan`, (req, res) => {
    try { res.json(buildIndustrialPlan(req.body)); }
    catch { res.status(400).json({ error: 'PLAN_INPUT_REJECTED' }); }
  });
  app.get(`${API}/examples/:id`, (req, res) => {
    if (!Object.hasOwn(EXAMPLES, req.params.id)) return res.status(404).end();
    res.json(EXAMPLES[req.params.id]);
  });
  app.get(`${API}/catalog`, (_req, res) => {
    try {
      const runtime = buildUnifiedCommerceRuntime();
      res.json({ products: runtime.catalog.map(({ id, nameAr, nameEn, summaryAr, kind, primarySector, targetSectors, source }) =>
        ({ id, nameAr, nameEn, summaryAr, kind, primarySector, targetSectors, source })),
      sectors: runtime.sectors.map(({ id, nameAr }) => ({ id, nameAr })),
      localEvidencePassed: runtime.passed, claimBoundary: runtime.claimBoundary });
    } catch { res.status(503).json({ error: 'CATALOG_UNAVAILABLE' }); }
  });
  app.post(`${API}/plan`, (req, res) => {
    try {
      if (!req.body || Object.keys(req.body).sort().join(',') !== 'intent,productId,sector'
        || typeof req.body.intent !== 'string' || !req.body.intent.trim() || req.body.intent.length > 500
        || typeof req.body.productId !== 'string' || typeof req.body.sector !== 'string') throw Error('INVALID');
      const product = buildUnifiedCommerceRuntime().catalog.find(item => item.id === req.body.productId);
      if (!product || !product.targetSectors.includes(req.body.sector)) throw Error('INVALID');
      const plan = buildCommerceOperationPlan({ ...req.body, workflow: 'RFQ_CREATION' });
      res.json({ ...plan, reviewStatus: 'DRAFT_REQUIRES_HUMAN_REVIEW', sentToSupplier: false, storedOnServer: false });
    } catch { res.status(400).json({ error: 'PLAN_INPUT_REJECTED' }); }
  });
  app.post(`${API}/run`, async (req, res) => {
    if (!validRequest(req.body)) return res.status(400).json({ error: 'INPUT_REJECTED' });
    if (busy) return res.status(409).json({ error: 'BUSY' });
    busy = true;
    const start = Date.now();
    try {
      const result = await invoke(req.body);
      res.json({ id: crypto.randomUUID(), operation: req.body.operation, transport: req.body.transport,
        completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        argumentsSha256: crypto.createHash('sha256').update(JSON.stringify(req.body.arguments)).digest('hex'), result });
    } catch {
      res.status(422).json({ error: 'OPERATION_REJECTED_OR_UNAVAILABLE' });
    } finally { busy = false; }
  });
  attachIndustrialFederation(app, API, token, options.federation);
  attachSupplierLab(app, token);
  const assets = createAssetDigitization(options.assets);
  app.get(`${API}/assets/report`, (req, res) => {
    if (req.headers['x-sheikha-session'] !== token) return res.status(403).json({ error: 'SESSION_REQUIRED' });
    if (Object.keys(req.query).length) return res.status(400).json({ error: 'ASSET_INPUT_REJECTED' });
    try { res.json(assets.inspect()); }
    catch { res.status(503).json({ error: 'ASSET_REPORT_UNAVAILABLE' }); }
  });
  createStudio(options.studio).attach(app, API);
  // Serve only these public assets, never the workspace root, private reports or runtime tree.
  app.use('/architecture-explorer/vendor/three', express.static(path.join(ROOT, 'public/architecture-explorer/vendor/three'), { dotfiles: 'deny' }));
  app.use('/workspace', express.static(path.join(ROOT, 'public/workspace'), { dotfiles: 'deny', index: 'index.html' }));
  app.use('/architecture-explorer/icons', express.static(path.join(ROOT, 'public/architecture-explorer/icons'), { dotfiles: 'deny' }));
  for (const file of ['sheikha-industrial-market-hero-v1.png', 'sheikha-worldly-gardens-v1.png', 'sheikha-emblem-hd.png']) {
    app.get(`/images/${file}`, (_req, res) => res.sendFile(path.join(ROOT, 'public/images', file)));
  }
  app.get('/', (_req, res) => res.redirect('/workspace/'));
  app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
  app.use((error, _req, res, _next) => res.status(error.type === 'entity.too.large' ? 413 : 400).json({ error: 'REQUEST_REJECTED' }));
  const server = http.createServer(app);
  server.requestTimeout = 20000;
  server.headersTimeout = 10000;
  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4192);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('INVALID_PORT');
  const server = createWorkspaceServer();
  let retried = false;
  server.on('error', error => {
    if (error.code === 'EADDRINUSE' && !retried) { retried = true; server.listen(0, '127.0.0.1'); }
    else { console.error('WORKSPACE_START_FAILED'); process.exitCode = 1; }
  });
  server.on('listening', () => console.log(`Sheikha workspace: http://127.0.0.1:${server.address().port}/workspace/ (PID ${process.pid})`));
  server.listen(port, '127.0.0.1');
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close());
}
module.exports = { createWorkspaceServer, invoke, validRequest };
