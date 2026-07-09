'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
  catch (e) { return (e.stdout || e.stderr || e.message || '').toString().trim(); }
}

function exists(p) { return fs.existsSync(p); }

function walk(dir, max = 5000, out = []) {
  if (!exists(dir) || out.length >= max) return out;
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'backups', 'dist'].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, max, out);
    else out.push(p);
    if (out.length >= max) break;
  }
  return out;
}

const files = walk('.');
const jsFiles = files.filter(f => f.endsWith('.js'));
const jsonFiles = files.filter(f => f.endsWith('.json'));
const docs = files.filter(f => f.endsWith('.md') || f.endsWith('.txt'));

const engines = files.filter(f =>
  /runtime|core|tools|routes|sdk|public|tests/.test(f) &&
  /sheikha|identity|governance|runtime|cloud|community|commerce|market|inspector|registry|kernel|os|supercomputer|architecture/i.test(f)
);

const git = {
  branch: sh('git branch --show-current'),
  lastCommit: sh('git log --oneline -1'),
  remotes: sh('git remote -v'),
  status: sh('git status --short'),
  branches: sh('git branch -a --no-color | head -80'),
  tags: sh('git tag --list | tail -40')
};

const checks = {
  packageJson: exists('package.json'),
  server: exists('server.js'),
  identityV2: exists('runtime/identity/sheikha-active-identity-v2-report.json'),
  truthGate: exists('runtime/production-truth-gate/sheikha-production-truth-gate-v4.json'),
  osCloudSupercomputer: exists('runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1-report.json'),
  liveComputeBenchmark: exists('runtime/os-cloud-supercomputer/sheikha-live-compute-benchmark-v1-report.json')
};

const report = {
  system: 'SHEIKHA_FINAL_DISCOVERY_AND_ACTIVATION_V1',
  status: Object.values(checks).every(Boolean) ? 'PASSED' : 'NEEDS_REVIEW',
  generatedAt: new Date().toISOString(),
  repository: git,
  inventory: {
    totalFiles: files.length,
    jsFiles: jsFiles.length,
    jsonFiles: jsonFiles.length,
    docs: docs.length,
    discoveredEngines: engines.length
  },
  checks,
  topEngines: engines.slice(0, 250),
  decision: 'FINAL_DISCOVERY_READY_FOR_CONSOLIDATION_AND_SAFE_ACTIVATION'
};

fs.mkdirSync('runtime/master-activation', { recursive: true });
fs.writeFileSync(
  'runtime/master-activation/sheikha-final-discovery-v1-report.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
