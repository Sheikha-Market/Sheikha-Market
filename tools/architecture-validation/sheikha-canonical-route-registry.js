const fs = require('fs');
const path = require('path');

const sourceFile = path.join(
  process.cwd(),
  'runtime/architecture-validation/route-source-discovery/sheikha-route-source-discovery.json'
);

const outDir = path.join(
  process.cwd(),
  'runtime/architecture-validation/canonical-routes'
);

const outFile = path.join(outDir, 'sheikha-canonical-route-registry.json');

const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

function classify(pathValue) {
  if (pathValue === '/status') return 'status';
  if (pathValue === '/health') return 'health';
  if (pathValue === '/metrics') return 'metrics';
  if (pathValue === '/report') return 'report';
  if (pathValue === '/overview') return 'overview';
  if (pathValue === '/statistics') return 'statistics';
  return 'domain_specific';
}

const canonical = source.duplicates.map((item) => {
  const best = item.bestCandidate;

  return {
    path: item.path,
    type: classify(item.path),
    duplicateCount: item.count,
    canonicalFile: best.file,
    canonicalMethod: best.method,
    canonicalQualityScore: best.qualityScore,
    canonicalReasons: best.qualityReasons,
    decision: 'KEEP_CANONICAL_AND_REVIEW_OTHERS',
    rule: 'Do not delete duplicates until mount context, domain purpose, and runtime usage are verified.',
    candidates: item.candidates
  };
});

const report = {
  registry: 'SHEIKHA_CANONICAL_ROUTE_REGISTRY',
  status: 'ACTIVE',
  purpose: 'Define the preferred canonical route implementation for duplicated route paths while preventing destructive removal and preserving domain-specific routes.',
  source: 'route-source-discovery',
  totalDuplicatePaths: canonical.length,
  rules: {
    no_delete_without_review: true,
    preserve_domain_context: true,
    prefer_highest_quality_score: true,
    prefer_governance_and_fabric_layers: true,
    require_fabric_alignment: true,
    require_git_clean_before_changes: true,
    require_vscode_codex_non_conflict: true
  },
  canonical,
  timestamp: new Date().toISOString()
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  registry: report.registry,
  status: report.status,
  totalDuplicatePaths: report.totalDuplicatePaths,
  output: outFile
}, null, 2));
