#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PLAN_PATH = path.join(ROOT, 'runtime', 'system', 'sheikha-release-batch-plan.json');

const args = new Set(process.argv.slice(2));
const applyMode = args.has('--apply');
const allowPreStaged = args.has('--allow-prestaged');
const batchArg = process.argv.find((a) => a.startsWith('--batches='));
const batchesFromArg = batchArg ? batchArg.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean) : null;

const defaultBatches = ['batch_core_runtime', 'batch_core_ops'];
const targetBatches = batchesFromArg && batchesFromArg.length > 0 ? batchesFromArg : defaultBatches;

if (!fs.existsSync(PLAN_PATH)) {
  console.error(`Batch plan not found: ${PLAN_PATH}`);
  console.error('Run: npm run -s ops:release:batch:plan');
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf8'));
const allBatches = plan.batches || {};

const selected = [];
for (const batchName of targetBatches) {
  const batchItems = allBatches[batchName] || [];
  for (const item of batchItems) {
    if (!item || !item.file) continue;
    if (item.file.endsWith('/')) continue;
    selected.push(item.file);
  }
}

const uniqueFiles = Array.from(new Set(selected));
const existingFiles = uniqueFiles.filter((file) => fs.existsSync(path.join(ROOT, file)));
const missingFiles = uniqueFiles.filter((file) => !fs.existsSync(path.join(ROOT, file)));

console.log(JSON.stringify({
  system: 'SHEIKHA_RELEASE_STAGE_BATCH_V1',
  mode: applyMode ? 'apply' : 'dry-run',
  batches: targetBatches,
  selectedFiles: uniqueFiles.length,
  existingFiles: existingFiles.length,
  missingFiles: missingFiles.length,
  files: existingFiles,
  missing: missingFiles
}, null, 2));

if (!applyMode) {
  console.log('\nDry run only. Use --apply to stage these files.');
  process.exit(0);
}

if (existingFiles.length === 0) {
  console.error('No existing files to stage.');
  process.exit(1);
}

if (applyMode) {
  const preStaged = spawnSync('git', ['diff', '--cached', '--name-only'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  const preStagedFiles = preStaged.stdout.trim().split('\n').filter(Boolean);
  if (preStagedFiles.length > 0 && !allowPreStaged) {
    console.error('Detected already-staged files in index.');
    console.error('Use --allow-prestaged if this is intentional, or unstage first.');
    console.error(`Current staged count: ${preStagedFiles.length}`);
    process.exit(2);
  }
}

const gitAdd = spawnSync('git', ['add', '--', ...existingFiles], {
  cwd: ROOT,
  stdio: 'inherit'
});

if (gitAdd.status !== 0) {
  process.exit(gitAdd.status || 1);
}

const staged = spawnSync('git', ['diff', '--cached', '--name-only'], {
  cwd: ROOT,
  encoding: 'utf8'
});

const stagedFiles = staged.stdout.trim().split('\n').filter(Boolean);
console.log(`\nStaged files count: ${stagedFiles.length}`);
console.log('Suggested commit message: chore(release): stage core runtime and ops batch');
