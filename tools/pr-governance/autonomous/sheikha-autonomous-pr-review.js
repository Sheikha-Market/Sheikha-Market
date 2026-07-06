const fs = require('fs');
const path = require('path');

const pr = process.argv[2];
if (!pr) {
  console.error('Usage: node tools/pr-governance/autonomous/sheikha-autonomous-pr-review.js <pr-number>');
  process.exit(1);
}

const baseDir = path.join(process.cwd(), `runtime/pr-governance/reviews/pr-${pr}`);
const filesPath = path.join(baseDir, 'files.txt');
const outDir = path.join(process.cwd(), 'runtime/pr-governance/autonomous');
const outFile = path.join(outDir, `pr-${pr}-autonomous-review.json`);

const files = fs.existsSync(filesPath)
  ? fs.readFileSync(filesPath, 'utf8').split('\n').filter(Boolean)
  : [];

const counts = {
  total: files.length,
  server: files.filter(f => f === 'server.js').length,
  package: files.filter(f => f === 'package.json' || f === 'package-lock.json').length,
  runtime: files.filter(f => f.startsWith('runtime/')).length,
  routes: files.filter(f => f.startsWith('routes/')).length,
  fabric: files.filter(f => f.includes('fabric')).length,
  dist: files.filter(f => f.startsWith('dist/')).length,
  archive: files.filter(f => f.startsWith('archive/')).length,
  public: files.filter(f => f.startsWith('public/')).length
};

let risk = 'LOW';
let decision = 'APPROVED_FOR_SAFE_MERGE';

if (counts.total > 300 || counts.runtime > 100 || counts.server > 0 || counts.package > 0) {
  risk = 'HIGH';
  decision = 'APPROVED_FOR_CURATED_MERGE';
}

if (counts.archive > 0 || counts.dist > 0) {
  decision = 'HOLD_FOR_FIXES';
}

const report = {
  report: 'SHEIKHA_AUTONOMOUS_PR_REVIEW',
  status: 'ACTIVE',
  pr: Number(pr),
  counts,
  risk,
  decision,
  mergeAllowed: decision === 'APPROVED_FOR_SAFE_MERGE',
  curatedMergeRequired: decision === 'APPROVED_FOR_CURATED_MERGE' || decision === 'HOLD_FOR_FIXES',
  requiredActions: [
    'run_lint',
    'run_tests',
    'secret_scan',
    'fabric_conflict_check',
    'route_conflict_check',
    'freeze_v1_1_compatibility_check',
    'federal_organization_v1_2_compatibility_check'
  ],
  fixPlan: {
    excludeFromRawMerge: ['archive/', 'dist/', 'generated backups'],
    reviewSeparately: ['server.js', 'package.json', 'package-lock.json'],
    sourceFirst: ['lib/', 'routes/', 'runtime/']
  },
  timestamp: new Date().toISOString()
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  pr,
  risk,
  decision,
  mergeAllowed: report.mergeAllowed,
  output: outFile
}, null, 2));
