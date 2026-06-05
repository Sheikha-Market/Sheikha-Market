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
  sovereignCommercialAiSupercluster: exists('runtime/sovereign-commercial-ai-supercluster/v1/sheikha-sovereign-commercial-ai-supercluster-v1-report.json'),
  aiClusterPipelineFabric: exists('runtime/ai-cluster-pipeline-fabric/v1/sheikha-ai-cluster-pipeline-fabric-v1-report.json'),
  commercialExecutionCluster: exists('runtime/commercial-execution-cluster/v1/sheikha-commercial-execution-cluster-v1-report.json'),
  capabilityRegistry: exists('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'),
  decisionRegistry: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_CLOUD_SUPERCOMPUTER_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_CLOUD_SUPERCOMPUTER_FABRIC_GAPS' : 'CLOUD_SUPERCOMPUTER_FABRIC_ACTIVE_100',
  checks,
  missing,
  truthfulness: {
    cloudArchitectureActivation: true,
    noPhysicalSupercomputerOwnershipClaim: true,
    noGpuClusterClaimWithoutContract: true,
    noModelTrainingClaimWithoutRunEvidence: true,
    providerContractRequiredForRealCompute: true
  },
  nextActions: [
    'Activate Provider Registry V1 before connecting real cloud providers.',
    'Activate Budget Guard V1 before any paid cloud compute.',
    'Activate Workload Scheduler V1 after provider contract and budget approval.',
    'Activate real GPU/HPC only after documented provider capacity exists.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.md',
  `# SHEIKHA_CLOUD_SUPERCOMPUTER_FABRIC_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## الفحوص
${Object.entries(checks).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## ضبط الصدق
- تفعيل معماري سحابي.
- لا ادعاء ملكية حاسب خارق فعلي بلا دليل.
- لا GPU Cluster فعلي بلا عقد مزود.
- لا تدريب نماذج بلا سجل تشغيل.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
