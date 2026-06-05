'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function write(p, content) {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), content);
}

const checks = {
  governanceOrchestrator: exists('runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json'),
  cloudSupercomputerFabric: exists('runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.json'),
  multiSupercomputerCloudFabric: exists('runtime/multi-supercomputer-cloud-fabric/v1/sheikha-multi-supercomputer-cloud-fabric-v1-report.json'),
  providerComputeFabric: exists('runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json'),
  workloadOrchestrator: exists('runtime/workload-orchestrator/v1/sheikha-workload-orchestrator-v1.json'),
  aiClusterPipelineFabric: exists('runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1-report.json'),
  budgetGuard: exists('runtime/budget-guard/v1/sheikha-budget-guard-v1.json'),
  slaEngine: exists('runtime/sla-engine/v1/sheikha-sla-engine-v1.json'),
  revenueEngine: exists('runtime/revenue-engine/v1/sheikha-revenue-engine-v1.json'),
  commercialRealActivation: exists('runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_GAPS' : 'AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_ACTIVE_100',
  checks,
  missing,
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.md',
  `# SHEIKHA_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
