'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { readTrackedFiles } = require('../governance/git-context-reader');
const storageGovernance = require(
  '../../runtime/storage-governance/v1/sheikha-storage-governance-v1'
);

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/storage-governance/v1');
let trackedFiles;

function pathSize(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  const stat = fs.lstatSync(absolutePath);
  if (!stat.isDirectory()) return stat.size;

  const result = spawnSync('du', ['-sk', '--', absolutePath], {
    encoding: 'utf8',
    timeout: 30000
  });
  if (result.status !== 0) return null;
  return Number.parseInt(result.stdout, 10) * 1024;
}

function isTracked(relativePath) {
  trackedFiles ||= readTrackedFiles();
  return trackedFiles.has(relativePath) || [...trackedFiles].some(file =>
    file.startsWith(`${relativePath}/`)
  );
}

function inventory() {
  return storageGovernance.policy.monitoredPaths
    .map(relativePath => {
      const absolutePath = path.join(root, relativePath);
      const sizeBytes = pathSize(relativePath);
      if (sizeBytes === null) return null;
      return {
        path: relativePath,
        sizeBytes,
        kind: fs.lstatSync(absolutePath).isDirectory() ? 'directory' : 'file',
        tracked: isTracked(relativePath)
      };
    })
    .filter(Boolean);
}

function activate() {
  const items = inventory();
  const runtimeStatus = storageGovernance.status();
  const remediation = storageGovernance.plan({ inventory: items });
  const report = {
    ...runtimeStatus,
    inventory: storageGovernance.normalizeInventory(items),
    remediation,
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA STORAGE GOVERNANCE V1',
    '',
    `- Status: ${report.status}`,
    `- Disk usage: ${report.filesystem.usedPercent}%`,
    `- Severity: ${report.filesystem.severity}`,
    `- Decision: ${report.decision}`,
    `- Large assets requiring review: ${report.remediation.candidates.length}`,
    '',
    'This report is read-only. It does not delete or move files.',
    'Any archival action requires checksum evidence, recovery verification, and human approval.'
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-storage-governance-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-storage-governance-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate, inventory, isTracked, pathSize };
