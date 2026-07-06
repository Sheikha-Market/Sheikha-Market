const fs = require('fs');
const path = require('path');

const pr = process.argv[2];
if (!pr) {
  console.error('Usage: node tools/curated-merge-engine/sheikha-curated-merge-plan.js <pr-number>');
  process.exit(1);
}

const base = path.join(process.cwd(), `runtime/pr-governance/reviews/pr-${pr}`);
const filesPath = path.join(base, 'files.txt');
const outDir = path.join(process.cwd(), `runtime/curated-merge-engine/v1/pr-${pr}`);
const outFile = path.join(outDir, 'curated-merge-plan.json');

const files = fs.existsSync(filesPath)
  ? fs.readFileSync(filesPath, 'utf8').split('\n').filter(Boolean)
  : [];

const excluded = files.filter(f =>
  f.startsWith('archive/') ||
  f.startsWith('dist/') ||
  f.includes('.backup') ||
  f.includes('/backups/')
);

const separateReview = files.filter(f =>
  f === 'server.js' ||
  f === 'package.json' ||
  f === 'package-lock.json'
);

const sourceCandidates = files.filter(f =>
  (f.startsWith('lib/') || f.startsWith('routes/') || f.startsWith('runtime/') || f.startsWith('core/')) &&
  !excluded.includes(f) &&
  !separateReview.includes(f)
);

const decision =
  files.length > 300 || excluded.length > 0 || separateReview.length > 0
    ? 'CURATED_MERGE'
    : 'SAFE_MERGE';

const report = {
  report: 'SHEIKHA_CURATED_MERGE_PLAN',
  status: 'ACTIVE',
  pr: Number(pr),
  totalFiles: files.length,
  decision,
  mergeAllowedRaw: false,
  counts: {
    sourceCandidates: sourceCandidates.length,
    excluded: excluded.length,
    separateReview: separateReview.length
  },
  sourceCandidates,
  excluded,
  separateReview,
  requiredBeforeMerge: [
    'review_source_candidates',
    'review_separate_files',
    'exclude_generated_and_backups',
    'run_lint',
    'run_tests',
    'secret_scan',
    'human_approval'
  ],
  timestamp: new Date().toISOString()
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  pr,
  decision,
  sourceCandidates: sourceCandidates.length,
  excluded: excluded.length,
  separateReview: separateReview.length,
  output: outFile
}, null, 2));
