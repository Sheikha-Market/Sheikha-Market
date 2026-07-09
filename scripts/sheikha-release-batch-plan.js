#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'runtime', 'system');
const OUT_FILE = path.join(OUT_DIR, 'sheikha-release-batch-plan.json');

function run(command) {
  try {
    return execSync(command, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
  } catch (error) {
    return error.stdout ? String(error.stdout).trim() : '';
  }
}

function classifyFile(filePath) {
  if (filePath.startsWith('scripts/')) return 'batch_core_ops';
  if (filePath.startsWith('server.js') || filePath === 'package.json' || filePath.startsWith('routes/')) return 'batch_core_runtime';
  if (filePath.startsWith('public/') || filePath.startsWith('css/') || filePath.startsWith('js/')) return 'batch_ui_product';
  if (filePath.startsWith('runtime/')) return 'batch_runtime_artifacts';
  if (filePath.startsWith('tests/') || filePath.includes('.test.')) return 'batch_tests_quality';
  if (filePath.startsWith('docs/') || filePath.endsWith('.md') || filePath.endsWith('.txt')) return 'batch_docs_knowledge';
  if (filePath.startsWith('config/') || filePath.startsWith('k8s/') || filePath.startsWith('docker') || filePath.endsWith('.yml')) return 'batch_platform_delivery';
  return 'batch_misc';
}

function parsePorcelain(text) {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const raw = line.slice(0, 2);
      const filePath = line.slice(3).trim();
      return { raw, filePath };
    });
}

function statusLabel(raw) {
  if (raw === '??') return 'untracked';
  if (raw.includes('A')) return 'added';
  if (raw.includes('M')) return 'modified';
  if (raw.includes('D')) return 'deleted';
  if (raw.includes('R')) return 'renamed';
  return 'other';
}

function main() {
  const porcelain = run('git status --porcelain');
  const entries = parsePorcelain(porcelain);

  const batches = {
    batch_core_runtime: [],
    batch_core_ops: [],
    batch_ui_product: [],
    batch_runtime_artifacts: [],
    batch_tests_quality: [],
    batch_docs_knowledge: [],
    batch_platform_delivery: [],
    batch_misc: []
  };

  for (const entry of entries) {
    const target = classifyFile(entry.filePath);
    batches[target].push({
      file: entry.filePath,
      status: statusLabel(entry.raw)
    });
  }

  const batchSummary = Object.entries(batches)
    .map(([name, files]) => ({ name, count: files.length }))
    .sort((a, b) => b.count - a.count);

  const plan = {
    system: 'SHEIKHA_RELEASE_BATCH_PLAN_V1',
    generatedAt: new Date().toISOString(),
    totalFiles: entries.length,
    batchSummary,
    recommendedCommitOrder: [
      'batch_core_runtime',
      'batch_core_ops',
      'batch_ui_product',
      'batch_tests_quality',
      'batch_platform_delivery',
      'batch_docs_knowledge',
      'batch_runtime_artifacts',
      'batch_misc'
    ],
    batches
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify(plan, null, 2));
  console.log(`\nBatch plan: ${path.relative(ROOT, OUT_FILE)}`);
}

main();
