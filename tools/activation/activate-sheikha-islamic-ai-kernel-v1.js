'use strict';

const fs = require('fs');
const path = require('path');
const { buildIslamicAIKernel } = require('../../core/islamic-ai-kernel/sheikha-islamic-ai-kernel-v1');

function exists(file) {
  return fs.existsSync(file);
}

const report = buildIslamicAIKernel({
  activatedBy: 'tools/activation/activate-sheikha-islamic-ai-kernel-v1.js',
  existingEvidence: {
    languageIntegration: exists('runtime/sheikha-language-integration/sheikha-language-integration-v1-report.json'),
    osCloudSupercomputer: exists('runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1-report.json'),
    liveComputeBenchmark: exists('runtime/os-cloud-supercomputer/sheikha-live-compute-benchmark-v1-report.json'),
    identityV2: exists('runtime/identity/sheikha-active-identity-v2-report.json'),
    truthGate: exists('runtime/production-truth-gate/sheikha-production-truth-gate-v4.json'),
    packageJson: exists('package.json'),
    server: exists('server.js')
  }
});

const evidence = report.input.existingEvidence;
const passed = Object.values(evidence).filter(Boolean).length;
const total = Object.keys(evidence).length;

report.verification = {
  status: passed === total ? 'PASSED' : 'NEEDS_REVIEW',
  score: Math.round((passed / total) * 100),
  passed,
  total,
  evidence
};

fs.mkdirSync('runtime/islamic-ai-kernel/v1', { recursive: true });
fs.writeFileSync(
  'runtime/islamic-ai-kernel/v1/sheikha-islamic-ai-kernel-v1-report.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
