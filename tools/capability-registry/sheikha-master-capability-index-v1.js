'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const DEFAULT_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_INDEX_PATH =
  'runtime/master-activation/sheikha-master-capability-registry-v1.json';
const MAX_QUERY_LENGTH = 500;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function safeResolve(rootDir, relativePath) {
  const absoluteRoot = path.resolve(rootDir);
  const absolutePath = path.resolve(absoluteRoot, String(relativePath || ''));
  if (absolutePath !== absoluteRoot && !absolutePath.startsWith(`${absoluteRoot}${path.sep}`)) {
    throw new Error('CAPABILITY_REGISTRY_PATH_OUTSIDE_ROOT');
  }
  return absolutePath;
}

function normalizeQuery(value) {
  return String(value || '').trim().slice(0, MAX_QUERY_LENGTH).toLowerCase();
}

function createCapabilityRegistryReader(options = {}) {
  const rootDir = path.resolve(options.rootDir || DEFAULT_ROOT);
  const indexPath = safeResolve(rootDir, options.indexPath || DEFAULT_INDEX_PATH);
  const index = readJson(indexPath);
  const descriptors = index.storage?.shards || [];
  const descriptorByPath = new Map(descriptors.map((item) => [item.path, item]));
  const referenceById = new Map();
  const referenceByPath = new Map();
  const shardCache = new Map();

  for (const reference of index.components || []) {
    referenceById.set(reference.id, reference);
    referenceByPath.set(reference.path, reference);
  }

  function loadShard(shardPath, loadOptions = {}) {
    if (shardCache.has(shardPath)) return shardCache.get(shardPath);
    const descriptor = descriptorByPath.get(shardPath);
    if (!descriptor) throw new Error('CAPABILITY_REGISTRY_SHARD_NOT_INDEXED');

    let text;
    const preferCompressed = loadOptions.preferCompressed !== false;
    const compressedDescriptor = descriptor.compression;
    if (preferCompressed && compressedDescriptor?.algorithm === 'BROTLI') {
      const compressed = fs.readFileSync(safeResolve(rootDir, compressedDescriptor.path));
      if (compressed.length !== compressedDescriptor.bytes || sha256(compressed) !== compressedDescriptor.sha256) {
        throw new Error('CAPABILITY_REGISTRY_COMPRESSED_SHARD_INTEGRITY_FAILED');
      }
      text = zlib.brotliDecompressSync(compressed).toString('utf8');
    } else {
      text = fs.readFileSync(safeResolve(rootDir, descriptor.path), 'utf8');
    }

    if (Buffer.byteLength(text, 'utf8') !== descriptor.bytes || sha256(text) !== descriptor.sha256) {
      throw new Error('CAPABILITY_REGISTRY_SHARD_INTEGRITY_FAILED');
    }
    const payload = JSON.parse(text);
    if (payload.components?.length !== descriptor.componentCount) {
      throw new Error('CAPABILITY_REGISTRY_SHARD_COUNT_MISMATCH');
    }

    shardCache.set(shardPath, payload);
    return payload;
  }

  function getByReference(reference, loadOptions = {}) {
    if (!reference) return null;
    const shard = loadShard(reference.shard, loadOptions);
    return shard.components.find((item) => item.id === reference.id) || null;
  }

  function getById(id, loadOptions = {}) {
    return getByReference(referenceById.get(String(id || '')), loadOptions);
  }

  function getByPath(componentPath, loadOptions = {}) {
    return getByReference(referenceByPath.get(String(componentPath || '')), loadOptions);
  }

  function search(query, searchOptions = {}) {
    const term = normalizeQuery(query);
    const layer = normalizeQuery(searchOptions.layer);
    const lifecycle = normalizeQuery(searchOptions.lifecycle);
    const limit = Math.min(Math.max(Number(searchOptions.limit) || 50, 1), 500);
    const results = [];

    for (const reference of index.components || []) {
      if (layer && String(reference.layer || '').toLowerCase() !== layer) continue;
      if (lifecycle && String(reference.lifecycle || '').toLowerCase() !== lifecycle) continue;
      if (term && !`${reference.id}\n${reference.path}`.toLowerCase().includes(term)) continue;
      results.push(reference);
      if (results.length >= limit) break;
    }
    return results;
  }

  function stats() {
    return {
      system: index.system,
      status: index.status,
      componentCount: index.componentCount,
      apiEndpoints: index.apiEndpoints,
      shardCount: index.storage?.shardCount || 0,
      storageFormat: index.storage?.format,
      compression: index.storage?.compression,
      loadedShardCount: shardCache.size,
      githubRequired: index.githubRequired === true
    };
  }

  return {
    index,
    getById,
    getByPath,
    loadShard,
    search,
    stats
  };
}

function parseCliArgs(argv = []) {
  const args = { limit: 50 };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--stats') args.stats = true;
    else if (token === '--id') args.id = argv[++index];
    else if (token === '--path') args.path = argv[++index];
    else if (token === '--search') args.search = argv[++index];
    else if (token === '--layer') args.layer = argv[++index];
    else if (token === '--lifecycle') args.lifecycle = argv[++index];
    else if (token === '--limit') args.limit = argv[++index];
  }
  return args;
}

if (require.main === module) {
  try {
    const args = parseCliArgs(process.argv.slice(2));
    const reader = createCapabilityRegistryReader();
    let result;
    if (args.id) result = reader.getById(args.id);
    else if (args.path) result = reader.getByPath(args.path);
    else if (args.search || args.layer || args.lifecycle) {
      result = reader.search(args.search, args);
    } else {
      result = reader.stats();
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ success: false, error: error.message })}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  DEFAULT_INDEX_PATH,
  createCapabilityRegistryReader,
  normalizeQuery,
  parseCliArgs,
  safeResolve
};
