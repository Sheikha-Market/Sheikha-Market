'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const LIMITS = Object.freeze({ inputBytes: 8 * 1024 * 1024, records: 20000, outputBytes: 64 * 1024 * 1024 });
const KNOWLEDGE_PATH = path.join(__dirname, 'knowledge.json');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');
const STATUS = 'requires_dataset_model_training';
const fail = (message) => { throw new Error(message); };

function canonical(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('NON_FINITE_NUMBER');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  }
  fail('UNSUPPORTED_VALUE');
}
const sha256 = (value) => crypto.createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : canonical(value)).digest('hex');

function readSnapshot(file, maxBytes = LIMITS.inputBytes, hooks = {}) {
  const absolute = path.resolve(file);
  if (fs.realpathSync(absolute) !== absolute) fail('SOURCE_SYMLINK');
  const fd = fs.openSync(absolute, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const before = fs.fstatSync(fd, { bigint: true });
    if (!before.isFile() || before.size > BigInt(maxBytes)) fail('SOURCE_TYPE_OR_SIZE');
    const buffer = Buffer.alloc(maxBytes + 1);
    let size = 0, n;
    while ((n = fs.readSync(fd, buffer, size, buffer.length - size, null)) > 0) {
      size += n;
      if (size > maxBytes) fail('SOURCE_SIZE_LIMIT');
    }
    if (hooks.afterRead) hooks.afterRead();
    const after = fs.fstatSync(fd, { bigint: true });
    const named = fs.lstatSync(absolute, { bigint: true });
    for (const field of ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs']) {
      if (before[field] !== after[field] || after[field] !== named[field]) fail('SOURCE_CHANGED');
    }
    if (fs.realpathSync(absolute) !== absolute || BigInt(size) !== before.size) fail('SOURCE_CHANGED');
    const bytes = buffer.subarray(0, size);
    const data = JSON.parse(bytes.toString('utf8'));
    canonical(data); // Reject unsupported/non-finite values, including overflowing JSON numbers.
    return { data, byteSha256: sha256(bytes), canonicalSha256: sha256(data), bytes: size };
  } finally { fs.closeSync(fd); }
}

function validateKnowledge(data) {
  canonical(data);
  if (data.nameAr !== 'وزن شيخة المعرفي الفيزيائي') fail('KNOWLEDGE_NAME');
  const sourceIds = new Set();
  const allowed = ['nist.gov', 'home.cern', 'nasa.gov', 'nih.gov', 'usgs.gov', 'nano.gov'];
  for (const source of data.sources) {
    if (sourceIds.has(source.id)) fail('DUPLICATE_SOURCE');
    sourceIds.add(source.id);
    const url = new URL(source.url);
    if (url.protocol !== 'https:' || !allowed.some(d => url.hostname === d || url.hostname.endsWith('.' + d))) fail('SOURCE_DOMAIN');
  }
  const refs = entry => {
    if (!entry.sourceIds?.length || entry.sourceIds.some(id => !sourceIds.has(id))) fail('SOURCE_REFERENCE');
  };
  const ids = new Set();
  for (const claim of data.topics) {
    if (ids.has(claim.id)) fail('DUPLICATE_TOPIC');
    ids.add(claim.id); refs(claim);
  }
  const units = data.units;
  for (const unit of Object.values(units)) {
    if (!Number.isFinite(unit.siFactor) || unit.siFactor <= 0 || unit.dimension.length !== 7 || unit.dimension.some(x => !Number.isInteger(x))) fail('INVALID_UNIT');
  }
  for (const scale of data.scales) {
    refs(scale);
    if (typeof scale.value !== 'number' || !(scale.value > 0) || !units[scale.unit] || units[scale.unit].dimension.join() !== '1,0,0,0,0,0,0') fail('INVALID_LENGTH_SCALE');
    if (scale.range && (scale.range.length !== 2 || scale.range.some(x => typeof x !== 'number' || !Number.isFinite(x) || x <= 0) || scale.range[0] > scale.value || scale.range[1] < scale.value)) fail('INVALID_SCALE_RANGE');
  }
  if (data.scales.find(s => s.id === 'planck_length')?.epistemicStatus !== 'theoretical_characteristic_scale_not_proven_minimum') fail('PLANCK_CLASSIFICATION');
  for (const relation of data.relationships) {
    refs(relation);
    if (relation.kind === 'unit_conversion') {
      const from = units[relation.from.unit], to = units[relation.to.unit];
      if (!from || !to || from.dimension.join() !== to.dimension.join()) fail('DIMENSION_MISMATCH');
      if (typeof relation.from.value !== 'number' || typeof relation.to.value !== 'number') fail('INVALID_QUANTITY');
      const a = relation.from.value * from.siFactor, b = relation.to.value * to.siFactor;
      if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) > Math.max(Math.abs(a), Math.abs(b)) * 1e-12) fail('CROSS_UNIT_VALUE');
    } else if (relation.kind === 'dimension_equation') {
      const result = units[relation.resultUnit];
      if (!result) fail('UNKNOWN_RESULT_UNIT');
      const dimension = Array(7).fill(0);
      for (const term of relation.factors) {
        if (!units[term.unit] || !Number.isInteger(term.power)) fail('INVALID_EQUATION_TERM');
        units[term.unit].dimension.forEach((x, i) => { dimension[i] += x * term.power; });
      }
      if (dimension.join() !== result.dimension.join()) fail('DIMENSION_MISMATCH');
    } else fail('UNKNOWN_RELATION');
  }
  if (data.boundaries.physicalNanorobotsFabricated !== false || data.boundaries.trainedModelProduced !== false) fail('UNSUPPORTED_ACTIVATION_CLAIM');
  return true;
}

function loadKnowledge() {
  const knowledge = readSnapshot(KNOWLEDGE_PATH), manifest = readSnapshot(MANIFEST_PATH).data;
  validateKnowledge(knowledge.data);
  if (manifest.artifactCanonicalSha256 !== knowledge.canonicalSha256) fail('KNOWLEDGE_PROVENANCE_HASH');
  return { ...knowledge, manifest };
}

const text = (value, field) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 512) fail('INVALID_' + field);
  return value.trim();
};

function normalizeRegistry(data) {
  canonical(data);
  let records;
  if (Array.isArray(data)) records = data.map(record => [null, record]);
  else if (data && typeof data === 'object') {
    const containers = ['weights', 'records', 'ledger'].filter(k => Array.isArray(data[k]));
    if (containers.length > 1) fail('AMBIGUOUS_REGISTRY_CONTAINER');
    if (containers.length === 1) records = data[containers[0]].map(record => [null, record]);
    else records = Object.entries(data);
  } else fail('INVALID_REGISTRY');
  if (!records.length || records.length > LIMITS.records) fail('REGISTRY_COUNT_LIMIT');
  const seen = new Set();
  return records.map(([key, record]) => {
    if (!record || Array.isArray(record) || typeof record !== 'object') fail('INVALID_REGISTRY_RECORD');
    const id = text(record.id ?? key, 'RECORD_ID');
    if (key !== null && record.id != null && record.id !== key) fail('CONFLICTING_RECORD_ID');
    if (seen.has(id)) fail('DUPLICATE_RECORD_ID');
    seen.add(id);
    const category = text(record.category ?? record.family ?? 'uncategorized', 'CATEGORY');
    return { id, category, recordCanonicalSha256: sha256(record) };
  }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

function profile(kind, id, knowledge, recordIds) {
  return {
    id: kind + ':' + id, kind, subjectId: id, recordIds,
    status: STATUS,
    knowledge: { id: knowledge.data.id, canonicalSha256: knowledge.canonicalSha256 },
    approvedTaskCapabilities: [],
    proposedTaskCapabilities: ['source_grounded_explanation', 'dimensional_consistency_check', 'claim_and_evidence_comparison'],
    model: { checkpoint: null, provider: null, license: null, ownershipVerified: false },
    dataset: { artifact: null, consentOrLegalBasis: null, license: null, provenance: null },
    evaluation: { artifact: null, metrics: [], acceptanceCriteria: null, passed: false },
    approval: { humanReviewer: null, approvedAt: null },
    deployment: { enabled: false, destination: null },
  };
}

function buildBlueprint(registrySnapshot, knowledge = loadKnowledge()) {
  validateKnowledge(knowledge.data);
  if (knowledge.canonicalSha256 !== sha256(knowledge.data) || knowledge.manifest?.artifactCanonicalSha256 !== knowledge.canonicalSha256) fail('KNOWLEDGE_PROVENANCE_HASH');
  const records = normalizeRegistry(registrySnapshot.data);
  const grouped = new Map();
  for (const record of records) {
    if (!grouped.has(record.category)) grouped.set(record.category, []);
    grouped.get(record.category).push(record.id);
  }
  const categories = [...grouped.keys()].sort();
  return {
    schemaVersion: '1.0.0', system: 'SHEIKHA_SCIENTIFIC_KNOWLEDGE_INTELLIGENCE_BLUEPRINT_V1', status: STATUS,
    governanceReference: 'BOUND_BY_QURAN_SUNNAH', governanceCertification: 'not_performed',
    registry: { bytes: registrySnapshot.bytes ?? null, byteSha256: registrySnapshot.byteSha256 ?? null, canonicalSha256: sha256(registrySnapshot.data), recordCount: records.length, categoryCount: categories.length },
    knowledge: { id: knowledge.data.id, nameAr: knowledge.data.nameAr, canonicalSha256: knowledge.canonicalSha256 },
    records: records.map(r => ({ ...r, profile: profile('record', r.id, knowledge, [r.id]) })),
    categories: categories.map(category => ({ category, profile: profile('category', category, knowledge, grouped.get(category)) })),
    domainBlueprints: ['geological_mining', 'metals_foundry', 'computational_mining'].map(domain => ({
      domain, sourceIds: knowledge.data.topics.find(topic => topic.id === domain)?.sourceIds || [],
      profile: profile('domain', domain, knowledge, []),
      scope: 'Source-based research proposal; no extraction, furnace operation, proof-of-work execution or token minting.',
    })),
    boundaries: { registryModified: false, shkGenerated: false, trainingExecuted: false, fabricatedNanorobots: false, officialRegistration: false, oreExtractionExecuted: false, tokenMinted: false },
  };
}

function writeExclusive(file, data) {
  const absolute = path.resolve(file), parent = path.dirname(absolute);
  if (fs.realpathSync(parent) !== parent) fail('OUTPUT_PARENT_SYMLINK');
  const bytes = Buffer.from(JSON.stringify(data, null, 2) + '\n');
  if (bytes.length > LIMITS.outputBytes) fail('OUTPUT_SIZE_LIMIT');
  const fd = fs.openSync(absolute, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
  try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  return { path: absolute, bytes: bytes.length, byteSha256: sha256(bytes), canonicalSha256: sha256(data) };
}

module.exports = { LIMITS, STATUS, KNOWLEDGE_PATH, MANIFEST_PATH, canonical, sha256, readSnapshot, validateKnowledge, loadKnowledge, normalizeRegistry, buildBlueprint, writeExclusive };
