'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RULES = [
  { prefix: 'core/', classification: 'PROTECTED', owner: 'Runtime Kernel Organization' },
  { prefix: 'runtime/', classification: 'PROTECTED', owner: 'Runtime Governance Organization' },
  { prefix: 'routes/', classification: 'ACTIVE', owner: 'API Federation Organization' },
  { prefix: 'scripts/', classification: 'REVIEW_REQUIRED', owner: 'Automation Organization' },
  { prefix: 'docs/', classification: 'ACTIVE', owner: 'Documentation Governance' },
  { prefix: 'topology/', classification: 'EXPERIMENTAL', owner: 'Architecture Organization' },
  { prefix: 'governance/', classification: 'PROTECTED', owner: 'Governance Organization' },
  { prefix: 'lib/runtime/', classification: 'STAGING', owner: 'Runtime Kernel Organization' },
  { prefix: 'sheikha-vscode-extension/', classification: 'STAGING', owner: 'IDE Organization' }
];

function classify(file) {
  return (
    RULES.find(rule => file.startsWith(rule.prefix)) ||
    { classification: 'REVIEW_REQUIRED', owner: 'Unassigned Governance Review' }
  );
}

function listUntrackedFiles() {
  const output = execSync('git status --short --untracked-files=all', { encoding: 'utf8' });

  return output
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => line.startsWith('?? '))
    .map(line => line.slice(3));
}

function runScanner() {
  const files = listUntrackedFiles();

  const classified = files.map(file => ({
    file,
    ...classify(file)
  }));

  const summary = classified.reduce((acc, item) => {
    acc[item.classification] = (acc[item.classification] || 0) + 1;
    return acc;
  }, {});

  return {
    scanner: 'SHEIKHA_RUNTIME_REGISTRY_SCANNER',
    status: 'SCANNED',
    totalUntracked: files.length,
    summary,
    classified,
    decision: files.length === 0 ? 'CLEAN' : 'REVIEW_REQUIRED',
    principle: 'لا ضرر ولا ضرار'
  };
}

const report = runScanner();

fs.mkdirSync('runtime/governance/reports', { recursive: true });

const reportPath = path.join(
  'runtime/governance/reports',
  `runtime-registry-scan-${Date.now()}.json`
);

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  status: report.status,
  totalUntracked: report.totalUntracked,
  summary: report.summary,
  report: reportPath,
  decision: report.decision
}, null, 2));
