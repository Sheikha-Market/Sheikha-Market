'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DISTRIBUTION_ROOT = path.join(ROOT, 'distribution');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assertGeneratedPath(target) {
  const resolved = path.resolve(target);
  const allowed = [
    path.join(DISTRIBUTION_ROOT, 'artifacts'),
    path.join(DISTRIBUTION_ROOT, 'staging'),
    path.join(DISTRIBUTION_ROOT, 'verification'),
    path.join(DISTRIBUTION_ROOT, 'common', 'staging'),
    path.join(DISTRIBUTION_ROOT, 'common', 'verification'),
    path.join(os.tmpdir(), 'sheikha-distribution')
  ];
  if (!allowed.some((base) => resolved === base || resolved.startsWith(`${base}${path.sep}`))) {
    throw new Error(`Refusing generated-path mutation outside approved roots: ${resolved}`);
  }
  return resolved;
}

function resetGeneratedDir(target) {
  const resolved = assertGeneratedPath(target);
  fs.rmSync(resolved, { recursive: true, force: true });
  fs.mkdirSync(resolved, { recursive: true });
  return resolved;
}

function copyPath(source, target, options = {}) {
  if (!fs.existsSync(source)) return false;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, {
    recursive: true,
    dereference: false,
    filter: options.filter
  });
  return true;
}

function setTreeTimestamp(target, epochSeconds = 0) {
  if (!fs.existsSync(target)) return;
  const timestamp = new Date(Number(epochSeconds) * 1000);
  const entries = fs.readdirSync(target, { withFileTypes: true });
  for (const entry of entries) {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) setTreeTimestamp(child, epochSeconds);
    if (!entry.isSymbolicLink()) fs.utimesSync(child, timestamp, timestamp);
  }
  fs.utimesSync(target, timestamp, timestamp);
}

function run(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...(options.env || {}) },
    maxBuffer: options.maxBuffer || 64 * 1024 * 1024,
    timeout: options.timeout || 120000
  });
  if (result.error || (options.allowFailure !== true && result.status !== 0)) {
    const detail = result.error?.message || result.stderr || result.stdout || `exit ${result.status}`;
    throw new Error(`${command} failed: ${String(detail).trim()}`);
  }
  return {
    status: result.status,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim()
  };
}

function findTool(name) {
  const result = spawnSync('which', [name], { encoding: 'utf8' });
  return result.status === 0 ? String(result.stdout).trim() : null;
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function fileMetadata(filePath) {
  const stat = fs.statSync(filePath);
  return {
    path: path.relative(ROOT, filePath),
    bytes: stat.size,
    sha256: sha256File(filePath)
  };
}

function createDeterministicTar(sourceParent, rootName, artifactPath) {
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  run('tar', [
    '--sort=name',
    '--mtime=@0',
    '--owner=0',
    '--group=0',
    '--numeric-owner',
    '--use-compress-program=gzip -n',
    '-cf',
    artifactPath,
    '-C',
    sourceParent,
    rootName
  ], { timeout: 300000 });
}

module.exports = {
  DISTRIBUTION_ROOT,
  ROOT,
  assertGeneratedPath,
  copyPath,
  createDeterministicTar,
  fileMetadata,
  findTool,
  readJson,
  resetGeneratedDir,
  run,
  setTreeTimestamp,
  sha256File,
  writeJson
};
