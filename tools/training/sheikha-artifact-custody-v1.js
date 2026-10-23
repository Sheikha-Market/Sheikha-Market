#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {Transform, Writable} = require('node:stream');
const {pipeline} = require('node:stream/promises');
const {readInput} = require('./sheikha-foundry-workbench-v1');
const {buildTrainingResultIndex} = require('../../core/foundry/sheikha-foundry-evidence-v1');

const ROOT = path.resolve(__dirname, '../../reports/private');
// Bound each GCM message below its 2^39-256 bit plaintext limit. Larger models use explicit shards.
const MAX_FILE = 32 * 1024 ** 3;
const MAX_TOTAL = 1024 ** 4;
const METADATA = new Set([
  'config.json', 'generation_config.json', 'adapter_config.json', 'vocabulary.json',
  'recipe.json', 'result.json', 'training-index.json', 'tokenizer.json',
  'tokenizer_config.json', 'chat_template.jinja', 'vocab.json', 'merges.txt',
  'LICENSE', 'README.md',
]);
const INDEX_FIELDS = ['runId', 'tenantRef', 'modelRef', 'objective', 'contractRef', 'licenseRef', 'artifactSha256', 'baseSha256', 'tokenizerSha256', 'recipeSha256', 'datasetManifestSha256', 'evaluationSha256'];

function fail(code) { throw new Error(code); }
function exact(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length || Object.keys(value).some(k => !fields.includes(k))) fail('INVALID_CUSTODY_FIELDS');
}
function hex(value, size) { if (typeof value !== 'string' || !new RegExp(`^[a-f0-9]{${size}}$`).test(value)) fail('INVALID_CUSTODY_DIGEST'); return value; }
function relative(file) {
  if (typeof file !== 'string' || file.length > 240 || !/^[A-Za-z0-9_./-]+$/.test(file) || file.split('/').some(p => !p || p === '.' || p === '..')) fail('INVALID_ARTIFACT_PATH');
  if (!(file.endsWith('.safetensors') || METADATA.has(path.basename(file)))) fail('ARTIFACT_TYPE_NOT_ALLOWLISTED');
  return file;
}
function owner(stat) {
  if ((stat.mode & 0o077) || stat.uid !== process.getuid()) fail('OWNER_ONLY_PERMISSIONS_REQUIRED');
}
function directory(dir) {
  const abs = path.resolve(dir);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) fail('CUSTODY_MUST_STAY_IN_PRIVATE_REPORTS');
  if (fs.realpathSync(abs) !== abs) fail('SYMLINK_DIRECTORY_REJECTED');
  const parts = path.relative(ROOT, abs).split(path.sep).filter(Boolean);
  for (let i = 0; i <= parts.length; i++) {
    const stat = fs.lstatSync(path.join(ROOT, ...parts.slice(0, i)));
    if (!stat.isDirectory() || stat.isSymbolicLink()) fail('REGULAR_DIRECTORY_REQUIRED');
    owner(stat);
  }
  return abs;
}
function readFd(file, max) {
  directory(path.dirname(path.resolve(file)));
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.nlink !== 1 || stat.size < 1 || stat.size > max) fail('INVALID_CUSTODY_FILE');
    owner(stat);
    return {fd, stat};
  } catch (error) { fs.closeSync(fd); throw error; }
}
function readSmall(file, max) {
  const {fd, stat} = readFd(file, max);
  try {
    const bytes = Buffer.alloc(stat.size + 1);
    let size = 0;
    while (size < bytes.length) {
      const n = fs.readSync(fd, bytes, size, bytes.length - size, null);
      if (!n) break;
      size += n;
    }
    const after = fs.fstatSync(fd);
    if (size !== stat.size || after.ctimeMs !== stat.ctimeMs || after.mtimeMs !== stat.mtimeMs) fail('FILE_CHANGED_DURING_READ');
    return bytes.subarray(0, size);
  } finally { fs.closeSync(fd); }
}
function writeSmall(file, bytes) {
  const fd = fs.openSync(file, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
  try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
function syncDir(dir) {
  const fd = fs.openSync(dir, fs.constants.O_RDONLY | fs.constants.O_DIRECTORY | fs.constants.O_NOFOLLOW);
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
function keyAt(file) {
  const key = readSmall(file, 32);
  if (key.length !== 32) fail('KEY_MUST_BE_32_RANDOM_BYTES');
  return key;
}
function keys(key, salt) {
  return Buffer.from(crypto.hkdfSync('sha256', key, Buffer.from(salt, 'hex'), Buffer.from('SHEIKHA_CUSTODY_V1'), 64));
}
function mac(manifest, material) { return crypto.createHmac('sha256', material.subarray(32)).update(JSON.stringify(manifest)).digest('hex'); }
function aad(id, entry) { return Buffer.from(JSON.stringify([id, entry.path, entry.bytes])); }

async function transformFile(source, destination, transform, expectedBytes) {
  const {fd, stat} = readFd(source, MAX_FILE);
  let outFd;
  let size = 0;
  const hash = crypto.createHash('sha256');
  const meter = new Transform({transform(chunk, _, done) {
    size += chunk.length;
    if (size > expectedBytes) return done(new Error('ARTIFACT_SIZE_CHANGED'));
    hash.update(chunk); done(null, chunk);
  }});
  try {
    if (stat.size !== expectedBytes) fail('ARTIFACT_SIZE_CHANGED');
    if (destination) outFd = fs.openSync(destination, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
    const sink = destination ? fs.createWriteStream(null, {fd: outFd, autoClose: false}) : new Writable({write(chunk, _, done) { done(); }});
    const sourceStream = fs.createReadStream(null, {fd, autoClose: false, highWaterMark: 1024 * 1024});
    // Hash plaintext on both paths; AES-GCM authenticates ciphertext and the artifact binding.
    if (transform.encrypt) await pipeline(sourceStream, meter, transform.cipher, sink);
    else await pipeline(sourceStream, transform.cipher, meter, sink);
    const after = fs.fstatSync(fd);
    if (size !== expectedBytes || stat.size !== after.size || stat.mtimeMs !== after.mtimeMs || stat.ctimeMs !== after.ctimeMs) fail('FILE_CHANGED_DURING_READ');
    if (outFd !== undefined) fs.fsyncSync(outFd);
    return hash.digest('hex');
  } finally { fs.closeSync(fd); if (outFd !== undefined) fs.closeSync(outFd); }
}

function initKey(file) {
  directory(path.dirname(path.resolve(file)));
  const key = crypto.randomBytes(32);
  try { writeSmall(file, key); syncDir(path.dirname(file)); } finally { key.fill(0); }
  return {system: 'SHEIKHA_LOCAL_CUSTODY_KEY_V1', keyCreated: true, keyPrinted: false, productionSigningKeyCreated: false};
}

async function seal(input, keyFile) {
  exact(input, ['sourceDir', 'storeDir', 'files', 'index']);
  const source = directory(input.sourceDir);
  const store = directory(input.storeDir);
  if (!Array.isArray(input.files) || input.files.length < 1 || input.files.length > 128) fail('ARTIFACT_COUNT_OUT_OF_RANGE');
  const files = input.files.map(relative);
  if (new Set(files).size !== files.length) fail('DUPLICATE_ARTIFACT');
  const index = buildTrainingResultIndex(input.index);
  const key = keyAt(keyFile);
  const id = crypto.randomBytes(16).toString('hex');
  const material = keys(key, id);
  const staging = fs.mkdtempSync(path.join(store, '.staging-'));
  fs.chmodSync(staging, 0o700);
  try {
    let total = 0;
    const entries = [];
    for (const file of files) {
      const sourceFile = path.join(source, file);
      if (path.resolve(sourceFile) === path.resolve(keyFile)) fail('CUSTODY_KEY_MUST_NOT_BE_AN_ARTIFACT');
      const checked = readFd(sourceFile, MAX_FILE);
      fs.closeSync(checked.fd);
      total += checked.stat.size;
      if (total > MAX_TOTAL) fail('TOTAL_ARTIFACT_SIZE_EXCEEDED');
      const entry = {path: file, blob: `${entries.length}.bin`, bytes: checked.stat.size, iv: crypto.randomBytes(12).toString('hex')};
      const cipher = crypto.createCipheriv('aes-256-gcm', material.subarray(0, 32), Buffer.from(entry.iv, 'hex'));
      cipher.setAAD(aad(id, entry));
      entry.sha256 = await transformFile(sourceFile, path.join(staging, entry.blob), {cipher, encrypt: true}, entry.bytes);
      entry.tag = cipher.getAuthTag().toString('hex');
      entries.push(entry);
    }
    if (!entries.some(e => e.path.endsWith('.safetensors') && e.sha256 === index.artifactSha256)) fail('INDEX_PRIMARY_ARTIFACT_NOT_FOUND');
    const manifest = {system: 'SHEIKHA_ENCRYPTED_LOCAL_ARTIFACT_V1', id, cipher: 'AES-256-GCM', index, entries, ownershipTransferred: false, trainingReuseAuthorized: false, externalTransferExecuted: false};
    const envelope = {manifest, hmacSha256: mac(manifest, material)};
    const encoded = JSON.stringify(envelope, null, 2) + '\n';
    if (Buffer.byteLength(encoded) > 131072) fail('MANIFEST_TOO_LARGE');
    writeSmall(path.join(staging, 'manifest.json'), encoded);
    syncDir(staging);
    const bundleDir = path.join(store, `artifact-${id}`);
    if (fs.existsSync(bundleDir)) fail('BUNDLE_ALREADY_EXISTS');
    fs.renameSync(staging, bundleDir); syncDir(store);
    return {system: 'SHEIKHA_LOCAL_CUSTODY_SEAL_V1', bundleDir, fileCount: entries.length, bytes: total, manifestSha256: crypto.createHash('sha256').update(encoded).digest('hex'), encrypted: true, restoreTested: false, remoteBackupVerified: false, rightsVerified: false, trainingReuseAuthorized: false};
  } catch (error) { fs.rmSync(staging, {recursive: true, force: true}); throw error; }
  finally { key.fill(0); material.fill(0); }
}

async function inspect(bundle, keyFile, restoreTo) {
  const dir = directory(bundle);
  const encoded = readSmall(path.join(dir, 'manifest.json'), 131072);
  const envelope = JSON.parse(encoded.toString('utf8'));
  exact(envelope, ['manifest', 'hmacSha256']);
  const m = envelope.manifest;
  exact(m, ['system', 'id', 'cipher', 'index', 'entries', 'ownershipTransferred', 'trainingReuseAuthorized', 'externalTransferExecuted']);
  hex(m.id, 32); hex(envelope.hmacSha256, 64);
  const key = keyAt(keyFile);
  const material = keys(key, m.id);
  let staging;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(envelope.hmacSha256, 'hex'), Buffer.from(mac(m, material), 'hex'))) fail('MANIFEST_AUTHENTICATION_FAILED');
    if (m.system !== 'SHEIKHA_ENCRYPTED_LOCAL_ARTIFACT_V1' || m.cipher !== 'AES-256-GCM' || m.ownershipTransferred !== false || m.trainingReuseAuthorized !== false || m.externalTransferExecuted !== false) fail('INVALID_CUSTODY_MANIFEST');
    const rebuilt = buildTrainingResultIndex(Object.fromEntries(INDEX_FIELDS.map(k => [k, m.index[k]])));
    if (JSON.stringify(rebuilt) !== JSON.stringify(m.index)) fail('INVALID_CUSTODY_INDEX');
    if (!Array.isArray(m.entries) || !m.entries.length || m.entries.length > 128) fail('INVALID_MANIFEST_ENTRIES');
    let total = 0;
    const seen = new Set();
    for (const [i, e] of m.entries.entries()) {
      exact(e, ['path', 'blob', 'bytes', 'iv', 'sha256', 'tag']); relative(e.path);
      hex(e.iv, 24); hex(e.sha256, 64); hex(e.tag, 32);
      if (seen.has(e.path) || e.blob !== `${i}.bin` || !Number.isSafeInteger(e.bytes) || e.bytes < 1 || e.bytes > MAX_FILE) fail('INVALID_MANIFEST_ENTRY');
      seen.add(e.path); total += e.bytes;
    }
    if (total > MAX_TOTAL || !m.entries.some(e => e.path.endsWith('.safetensors') && e.sha256 === rebuilt.artifactSha256)) fail('INVALID_MANIFEST_TOTAL_OR_PRIMARY');
    let destination;
    if (restoreTo) {
      destination = path.resolve(restoreTo);
      const parent = directory(path.dirname(destination));
      if (fs.existsSync(destination) || destination === dir || destination.startsWith(dir + path.sep)) fail('RESTORE_REQUIRES_NEW_DIRECTORY_OUTSIDE_BUNDLE');
      staging = fs.mkdtempSync(path.join(parent, '.restore-'));
      fs.chmodSync(staging, 0o700);
    }
    for (const entry of m.entries) {
      const file = staging ? path.join(staging, entry.path) : undefined;
      if (file) fs.mkdirSync(path.dirname(file), {recursive: true, mode: 0o700});
      const cipher = crypto.createDecipheriv('aes-256-gcm', material.subarray(0, 32), Buffer.from(entry.iv, 'hex'));
      cipher.setAAD(aad(m.id, entry)); cipher.setAuthTag(Buffer.from(entry.tag, 'hex'));
      const digest = await transformFile(path.join(dir, entry.blob), file, {cipher, encrypt: false}, entry.bytes);
      if (digest !== entry.sha256) fail('RESTORED_ARTIFACT_HASH_MISMATCH');
      if (file) syncDir(path.dirname(file));
    }
    if (destination) {
      syncDir(staging);
      if (fs.existsSync(destination)) fail('RESTORE_DESTINATION_APPEARED');
      fs.renameSync(staging, destination); syncDir(path.dirname(destination)); staging = undefined;
    }
    return {system: 'SHEIKHA_LOCAL_CUSTODY_VERIFICATION_V1', fileCount: m.entries.length, bytes: total, authenticationVerified: true, plaintextHashesVerified: true, restored: Boolean(destination), restoredTo: destination || null, primaryArtifactSha256: rebuilt.artifactSha256, declaredIndex: rebuilt, remoteBackupVerified: false, rightsVerified: false, trainingReuseAuthorized: false, weightsExecuted: false};
  } finally {
    if (staging) fs.rmSync(staging, {recursive: true, force: true});
    key.fill(0); material.fill(0);
  }
}

async function main(args) {
  if (!args.length || (args.length === 1 && args[0] === 'help')) return {commands: ['init-key --key PRIVATE_FILE', 'seal --input PRIVATE_JSON --key PRIVATE_FILE', 'verify --bundle PRIVATE_DIRECTORY --key PRIVATE_FILE', 'restore --bundle PRIVATE_DIRECTORY --key PRIVATE_FILE --to NEW_PRIVATE_DIRECTORY'], boundary: 'LOCAL_OWNER_ONLY_NO_UPLOAD_NO_TRAINING_NO_OWNERSHIP_GRANT', outputRoot: ROOT};
  const [command, ...rest] = args;
  const expected = { 'init-key': ['--key'], seal: ['--input', '--key'], verify: ['--bundle', '--key'], restore: ['--bundle', '--key', '--to']}[command];
  if (!expected || rest.length !== expected.length * 2 || expected.some((k, i) => rest[i * 2] !== k || !rest[i * 2 + 1])) fail('INVALID_CUSTODY_ARGUMENTS');
  if (command === 'init-key') return initKey(rest[1]);
  if (command === 'seal') { directory(path.dirname(path.resolve(rest[1]))); return seal(readInput(rest[1]), rest[3]); }
  return inspect(rest[1], rest[3], command === 'restore' ? rest[5] : undefined);
}
if (require.main === module) main(process.argv.slice(2)).then(r => process.stdout.write(JSON.stringify(r, null, 2) + '\n')).catch(e => {
  process.stderr.write(JSON.stringify({success: false, error: /^[A-Z0-9_]+$/.test(e.message) ? e.message : 'CUSTODY_LOCAL_FILE_OR_AUTHENTICATION_ERROR'}) + '\n'); process.exitCode = 1;
});

module.exports = {initKey, seal, inspect, main};
