'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const check = (condition, code) => { if (!condition) throw new Error(code); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const label = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 300;
const serviceName = value => typeof value === 'string' && /^[a-z][a-z0-9.-]{0,150}\.googleapis\.com$/.test(value);
const TOKEN_ENV = 'SHEIKHA_GOOGLE_READONLY_ACCESS_TOKEN';

function noSymlinks(file) {
  const absolute = path.resolve(file);
  let cursor = path.parse(absolute).root;
  for (const part of absolute.slice(cursor.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    try { check(!fs.lstatSync(cursor).isSymbolicLink(), 'SYMLINK_DENIED'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return absolute;
}

function readBounded(file, maximum = 2 * 1024 * 1024) {
  const descriptor = fs.openSync(noSymlinks(file), fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const before = fs.fstatSync(descriptor);
    check(before.isFile() && before.size <= maximum, 'SOURCE_SIZE_OR_TYPE_DENIED');
    const buffer = Buffer.alloc(before.size + 1);
    let length = 0, count;
    while (length < buffer.length && (count = fs.readSync(descriptor, buffer, length, buffer.length - length, null))) length += count;
    const after = fs.fstatSync(descriptor);
    check(length === before.size && after.size === before.size && before.mtimeMs === after.mtimeMs && before.ctimeMs === after.ctimeMs, 'SOURCE_CHANGED_DURING_READ');
    return buffer.subarray(0, length);
  } finally { fs.closeSync(descriptor); }
}

function validateScope(scope) {
  check(object(scope) && scope.schema === 'SHEIKHA_CLOUD_PRODUCT_SCOPE_V1' && scope.brand === 'SHEIKHA', 'INVALID_SCOPE');
  check(scope.scope === 'REQUESTED_CATALOG_NOT_COMPLETE_GOOGLE_CATALOG', 'INVALID_SCOPE_BOUNDARY');
  check(typeof scope.projectId === 'string' && typeof scope.projectNumber === 'string' && /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(scope.projectId) && /^[1-9][0-9]{2,20}$/.test(scope.projectNumber), 'INVALID_PROJECT');
  check(Array.isArray(scope.categories) && scope.categories.length > 0 && scope.categories.length <= 30, 'INVALID_CATEGORIES');
  const ids = new Set(), names = new Set(), titles = new Set(), headings = new Set();
  for (const group of scope.categories) {
    check(object(group) && /^[a-z][a-z0-9-]{1,40}$/.test(group.id || '') && !ids.has(group.id), 'INVALID_CATEGORY_ID');
    check(label(group.title) && label(group.referenceHeading) && !headings.has(group.referenceHeading) && label(group.acceptance), 'INVALID_CATEGORY');
    check(Array.isArray(group.products) && group.products.length > 0 && group.products.length <= 50, 'INVALID_PRODUCTS');
    ids.add(group.id); headings.add(group.referenceHeading);
    for (const row of group.products) {
      check(Array.isArray(row) && row.length === 2 && row.every(label), 'INVALID_PRODUCT');
      check(!names.has(row[0]) && !titles.has(row[1]), 'DUPLICATE_PRODUCT');
      check(!/google|gemini|firebase|قووقل|جوجل/i.test(row[1]), 'INDEPENDENT_BRAND_REQUIRED');
      names.add(row[0]); titles.add(row[1]);
    }
  }
  check(names.size <= 500, 'PRODUCT_LIMIT');
  check(object(scope.candidates) && object(scope.serviceBindings), 'INVALID_BINDINGS');
  for (const [reference, files] of Object.entries(scope.candidates)) {
    check(names.has(reference) && Array.isArray(files) && files.length > 0 && files.length <= 10, 'INVALID_CANDIDATE');
    for (const file of files) check(typeof file === 'string' && /^(core|tools|tests)\/[a-zA-Z0-9/_.-]+$/.test(file) && !file.split('/').some(part => part === '..' || part === '.' || !part), 'INVALID_CANDIDATE_PATH');
  }
  for (const [reference, api] of Object.entries(scope.serviceBindings)) check(names.has(reference) && serviceName(api), 'INVALID_SERVICE_BINDING');
  check(Array.isArray(scope.firstPilot) && new Set(scope.firstPilot).size === scope.firstPilot.length && scope.firstPilot.every(name => names.has(name)), 'INVALID_PILOT');
  check(Array.isArray(scope.sources) && scope.sources.length <= 20 && scope.sources.every(source => {
    if (!object(source) || !label(source.purpose)) return false;
    try { const url = new URL(source.url); return url.protocol === 'https:' && !url.username && !url.password && ['cloud.google.com', 'docs.cloud.google.com', 'about.google'].includes(url.hostname); }
    catch { return false; }
  }), 'INVALID_DOCUMENTATION_LINK');
  return scope;
}

function verifyRequest(buffer, scope) {
  validateScope(scope);
  check(buffer.length <= 2 * 1024 * 1024, 'REQUEST_TOO_LARGE');
  const all = buffer.toString('utf8').split(/\r?\n/);
  const start = 'Find and deploy over 4,500 products in Marketplace';
  const end = 'شغل كل التطبيقات والادوات تكون باسم شيخة';
  check(all.filter(line => line.trim() === start).length === 1 && all.filter(line => line.trim() === end).length === 1, 'REQUEST_BOUNDARIES_AMBIGUOUS');
  const first = all.findIndex(line => line.trim() === start), last = all.findIndex(line => line.trim() === end);
  check(first >= 0 && last > first, 'REQUEST_BOUNDARIES_MISSING');
  const lines = all.slice(first + 1, last).map(line => line.trim()).filter(Boolean);
  let cursor = 0, count = 0;
  for (const category of scope.categories) {
    check(lines[cursor++] === category.referenceHeading, 'REQUEST_CATEGORY_MISMATCH');
    if (lines[cursor] !== 'Name Description') cursor++;
    check(lines[cursor++] === 'Name Description', 'REQUEST_TABLE_MISMATCH');
    for (const [reference] of category.products) {
      check(lines[cursor++] === reference, 'REQUEST_PRODUCT_MISMATCH');
      check(label(lines[cursor++]), 'REQUEST_DESCRIPTION_MISSING');
      count++;
    }
  }
  check(cursor === lines.length, 'REQUEST_UNMAPPED_ENTRIES');
  return { sha256: sha256(buffer), firstLine: first + 1, lastLine: last + 1, matchedProducts: count,
    matchedCategories: scope.categories.length, contentCopied: false, commandsExecuted: false };
}

function candidateEvidence(root, file) {
  try { const bytes = readBounded(path.join(root, file)); return { path: file, status: 'FILE_PRESENT_NOT_RUNTIME_PROOF', sha256: sha256(bytes), bytes: bytes.length }; }
  catch (error) { return { path: file, status: error.code === 'ENOENT' ? 'MISSING' : 'UNREADABLE_OR_UNSAFE', sha256: null }; }
}

function buildRegistry(scope, { root, request = null, observedAt = new Date().toISOString() } = {}) {
  validateScope(scope);
  check(typeof root === 'string' && path.isAbsolute(root), 'ROOT_REQUIRED');
  check(Number.isFinite(Date.parse(observedAt)), 'INVALID_TIMESTAMP');
  const products = scope.categories.flatMap(group => group.products.map(([reference, title]) => {
    const evidence = (scope.candidates[reference] || []).map(file => candidateEvidence(root, file));
    return { id: `shk-${group.id}-${sha256(reference).slice(0, 10)}`, nameAr: `شيخة ${title}`, categoryId: group.id,
      referenceLabel: reference, referenceOwnership: 'GOOGLE_OR_THIRD_PARTY_AS_LISTED_NOT_REBRANDED',
      lifecycle: evidence.some(item => item.sha256) ? 'LOCAL_CANDIDATE_NOT_ACCEPTED' : 'PROPOSED_NOT_IMPLEMENTED',
      comparison: 'FUNCTIONAL_DIRECTION_ONLY_NOT_FEATURE_PARITY', evidence,
      acceptance: group.acceptance, pilotPriority: scope.firstPilot.includes(reference),
      proposedApi: scope.serviceBindings[reference] || null, cloudConnection: 'NOT_VERIFIED',
      productAccepted: false, productionEnabled: false, automaticPublishing: false };
  }));
  return { schema: 'SHEIKHA_PRODUCT_REGISTRY_V1', observedAt, brand: scope.brand, request,
    scopeSha256: sha256(JSON.stringify(scope)), scope: scope.scope,
    project: { id: scope.projectId, number: scope.projectNumber, source: 'LOCAL_DECLARATION_NOT_AUTHENTICATED' },
    categories: scope.categories.map(({ id, title, acceptance }) => ({ id, title, acceptance })), products,
    counts: { products: products.length, categories: scope.categories.length,
      localCandidates: products.filter(product => product.lifecycle === 'LOCAL_CANDIDATE_NOT_ACCEPTED').length,
      acceptedProducts: 0, verifiedCloudConnections: 0 },
    partnership: { stage: 'PROPOSAL_ONLY', counterpartyAcceptanceVerified: false, signedAgreementVerified: false, jointBrandAuthorized: false, outreachSent: false },
    generation: { provider: 'NOT_CONFIGURED', dailyBudget: null, externalCallsAllowed: false },
    sources: scope.sources,
    effects: { deployed: false, paidServicesEnabled: false, credentialsRead: false, networkRequests: 0, publicationApproved: false },
    limitations: ['FILE_PRESENCE_IS_NOT_FEATURE_ACCEPTANCE', 'CATALOG_IS_NOT_ALL_GOOGLE_PRODUCTS', 'CLOUD_API_ENABLED_IS_NOT_A_WORKLOAD_TEST', 'HASH_IS_NOT_PARTNERSHIP_OR_AUTHORITY_PROOF'] };
}

// This connector has exactly one operation: a bounded, read-only Service Usage inventory.
async function probeGoogleServices({ projectNumber, accessToken, fetchImpl = globalThis.fetch, timeoutMs = 10000 } = {}) {
  const base = { schema: 'SHEIKHA_GOOGLE_READONLY_INVENTORY_V1', observedAt: new Date().toISOString(), projectNumber,
    complete: false, services: [], requestCount: 0, productionEnabled: false, workloadVerified: false,
    credentialsPersisted: false, servicesEnabledByTool: 0 };
  if (typeof projectNumber !== 'string' || !/^[1-9][0-9]{2,20}$/.test(projectNumber)) return { ...base, projectNumber: null, status: 'INVALID_PROJECT_NUMBER' };
  if (!accessToken) return { ...base, status: 'BLOCKED_AUTH_NOT_CONFIGURED' };
  if (typeof accessToken !== 'string' || accessToken.length < 10 || accessToken.length > 8192 || !/^[a-zA-Z0-9._~+\/-]+={0,2}$/.test(accessToken)) return { ...base, status: 'BLOCKED_INVALID_AUTH_INPUT' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const seen = new Set(), services = new Set();
  let pageToken = '';
  try {
    for (let page = 0; page < 10; page++) {
      const url = new URL(`https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services`);
      url.searchParams.set('filter', 'state:ENABLED'); url.searchParams.set('pageSize', '200');
      if (pageToken) url.searchParams.set('pageToken', pageToken);
      base.requestCount++;
      const response = await fetchImpl(url, { method: 'GET', redirect: 'error', signal: controller.signal,
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
      if (!response.ok) {
        await response.body?.cancel();
        return { ...base, status: response.status === 401 ? 'AUTH_REJECTED' : response.status === 403 ? 'PERMISSION_DENIED' : 'REMOTE_HTTP_ERROR', httpStatus: response.status };
      }
      const reader = response.body.getReader();
      const chunks = []; let size = 0;
      try {
        while (true) {
          const { value, done } = await reader.read(); if (done) break;
          size += value.length; check(size <= 1024 * 1024, 'RESPONSE_TOO_LARGE'); chunks.push(Buffer.from(value));
        }
      } finally { await reader.cancel(); reader.releaseLock(); }
      const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      check(object(data) && (data.services === undefined || Array.isArray(data.services)), 'INVALID_REMOTE_RESPONSE');
      const entries = data.services || []; check(entries.length <= 200, 'INVALID_REMOTE_RESPONSE');
      for (const entry of entries) {
        const name = entry?.config?.name;
        check(serviceName(name) && entry.state === 'ENABLED' && entry.name === `projects/${projectNumber}/services/${name}` && !services.has(name), 'INVALID_REMOTE_SERVICE');
        services.add(name);
      }
      pageToken = data.nextPageToken;
      if (pageToken === undefined || pageToken === '') return { ...base, status: 'ENABLED_API_INVENTORY_OBSERVED', complete: true, services: [...services].sort() };
      check(typeof pageToken === 'string' && pageToken.length <= 4096 && !seen.has(pageToken), 'INVALID_PAGINATION');
      seen.add(pageToken);
    }
    return { ...base, status: 'PAGINATION_LIMIT_REACHED' };
  } catch (error) {
    const safeCodes = ['RESPONSE_TOO_LARGE', 'INVALID_REMOTE_RESPONSE', 'INVALID_REMOTE_SERVICE', 'INVALID_PAGINATION'];
    return { ...base, status: controller.signal.aborted ? 'TIMEOUT' : safeCodes.includes(error.message) ? error.message : 'NETWORK_OR_RESPONSE_ERROR' };
  } finally { clearTimeout(timer); }
}

module.exports = { sha256, noSymlinks, readBounded, validateScope, verifyRequest, buildRegistry, probeGoogleServices, TOKEN_ENV };
