'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const MANIFEST = 'SHEIKHA-CLOUD-CONTEXT-MANIFEST.json';
const MAX_BYTES = 200 * 1024 * 1024;
const MAX_FILES = 20000;
const ALLOWED_BUILD_REGIONS = Object.freeze(['me-central2', 'us-central1']);
// A self-consistent inventory can still omit inputs required by the build.
const REQUIRED_BUILD_INPUTS = Object.freeze([
  'server.js',
  'package.json',
  'package-lock.json',
  'Dockerfile',
  '.dockerignore',
  '.gcloudignore',
  'tools/verification/sheikha-cloud-build-source-guard.cjs',
  'routes/sheikha-infinite-agent/sheikha-infinite-agent-routes.js',
  'runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js',
  'runtime/sheikha-natural-integration/v1/sheikha-natural-integration-model.js'
]);
const check = (ok, code) => { if (!ok) throw new Error(code); };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function readFile(file, limit) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const before = fs.fstatSync(fd);
    check(before.isFile() && before.nlink === 1 && before.size <= limit, 'SOURCE_FILE_REFUSED');
    const data = Buffer.alloc(before.size);
    let offset = 0;
    while (offset < data.length) {
      const count = fs.readSync(fd, data, offset, data.length - offset, offset);
      check(count > 0, 'SOURCE_FILE_CHANGED');
      offset += count;
    }
    const after = fs.fstatSync(fd), current = fs.lstatSync(file);
    for (const other of [after, current]) {
      check(before.dev === other.dev && before.ino === other.ino && before.size === other.size
        && before.mtimeMs === other.mtimeMs && before.ctimeMs === other.ctimeMs, 'SOURCE_FILE_CHANGED');
    }
    return data;
  } finally { fs.closeSync(fd); }
}

function verifyContext(root, location) {
  check(ALLOWED_BUILD_REGIONS.includes(location), 'BUILD_REGION_NOT_ALLOWED');
  root = path.resolve(root);
  check(fs.realpathSync(root) === root && fs.statSync(root).isDirectory(), 'CONTEXT_ROOT_REFUSED');
  const manifestBytes = readFile(path.join(root, MANIFEST), 8 * 1024 * 1024);
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  check(manifest.report?.schema === 'SHEIKHA_CLOUD_BUILD_CONTEXT_REPORT_V1'
    && manifest.report.status === 'PASS', 'PASSING_CONTEXT_MANIFEST_REQUIRED');
  const inventory = manifest.source_snapshot;
  check(Array.isArray(inventory) && inventory.length > 0 && inventory.length <= MAX_FILES, 'INVALID_INVENTORY');
  const expected = new Map();
  let bytes = manifestBytes.length;
  for (const row of inventory) {
    check(row && typeof row.path === 'string' && row.path.length <= 512 && row.path !== MANIFEST
      && !row.path.includes('\\') && !row.path.includes('\0') && !path.posix.isAbsolute(row.path)
      && row.path.split('/').every(part => part && part !== '.' && part !== '..')
      && !expected.has(row.path), 'INVALID_INVENTORY_PATH');
    check(Number.isSafeInteger(row.bytes) && row.bytes >= 0 && row.bytes <= 8 * 1024 * 1024
      && typeof row.sha256 === 'string' && /^[a-f0-9]{64}$/.test(row.sha256), 'INVALID_INVENTORY_ENTRY');
    expected.set(row.path, row);
    bytes += row.bytes;
    check(bytes <= MAX_BYTES, 'CONTEXT_SIZE_LIMIT');
  }
  check(manifest.report.file_count === inventory.length
    && manifest.report.total_bytes === bytes - manifestBytes.length, 'MANIFEST_TOTALS_MISMATCH');
  for (const required of REQUIRED_BUILD_INPUTS) {
    check(expected.has(required), 'MISSING_REQUIRED_BUILD_INPUT');
  }
  let files = 0, directories = 0;
  function walk(directory, depth) {
    check(depth <= 32 && ++directories <= MAX_FILES, 'CONTEXT_DIRECTORY_LIMIT');
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name), relative = path.relative(root, file).split(path.sep).join('/');
      check(!entry.isSymbolicLink(), 'CONTEXT_SYMLINK_REFUSED');
      if (entry.isDirectory()) { walk(file, depth + 1); continue; }
      check(entry.isFile(), 'CONTEXT_SPECIAL_FILE_REFUSED');
      if (relative === MANIFEST) continue;
      const row = expected.get(relative);
      check(row && ++files <= MAX_FILES, 'UNEXPECTED_CONTEXT_FILE');
      const data = readFile(file, row.bytes);
      check(data.length === row.bytes && hash(data) === row.sha256, 'SOURCE_HASH_MISMATCH');
      expected.delete(relative);
    }
  }
  walk(root, 0);
  check(expected.size === 0, 'MISSING_CONTEXT_FILE');
  return { status: 'PASS', scope: 'LOCAL_SOURCE_INTEGRITY_ONLY', region: location,
    fileCount: files, requiredInputCount: REQUIRED_BUILD_INPUTS.length,
    totalBytesIncludingManifest: bytes, manifestSha256: hash(manifestBytes),
    deploymentAuthorized: false, uploaded: false };
}

if (require.main === module) {
  try {
    check(process.argv.length === 3, 'INVALID_ARGUMENTS');
    process.stdout.write(JSON.stringify(verifyContext(process.cwd(), process.argv[2])) + '\n');
  } catch (error) {
    const code = /^[A-Z_]{3,80}$/.test(error.message) ? error.message : 'SOURCE_PREFLIGHT_FAILED';
    process.stderr.write(JSON.stringify({ status: 'BLOCKED', code, uploaded: false }) + '\n');
    process.exitCode = 1;
  }
}

module.exports = { verifyContext, REQUIRED_BUILD_INPUTS };
