#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

function run(name, cmd, required = true) {
  const started = Date.now();
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { name, cmd, required, ok: true, ms: Date.now() - started, output: out.trim().slice(0, 4000) };
  } catch (e) {
    return {
      name,
      cmd,
      required,
      ok: false,
      ms: Date.now() - started,
      output: String(e.stdout || e.stderr || e.message).trim().slice(0, 4000)
    };
  }
}

function exists(p) {
  return fs.existsSync(p);
}

const steps = [
  ['Identity V2 Health', 'npm run -s sheikha:identity:v2:health:one', false],
  ['Community Modeling Monitor', 'npm run -s ops:community:modeling:monitor', false],
  ['Islamic AI Kernel', 'node tools/activation/activate-sheikha-islamic-ai-kernel-v1.js', true],
  ['Language Integration', 'node tools/activation/activate-sheikha-language-integration-v1.js', true],
  ['OS Cloud Supercomputer Gate', 'node tools/activation/activate-sheikha-os-cloud-supercomputer-integration-v1.js', true],
  ['Live Compute Benchmark', 'node tools/activation/sheikha-live-compute-benchmark-v1.js', true],
  ['Islamic AI Kernel Tests', 'npm test -- tests/sheikha-islamic-ai-kernel-v1.test.js', true],
  ['Language Integration Tests', 'npm test -- tests/sheikha-language-integration-v1.test.js', true],
  ['OS Cloud Supercomputer Tests', 'npm test -- tests/sheikha-os-cloud-supercomputer-integration-v1.test.js', true],
  ['Lint', 'npm run lint', true],
  ['PM2 Status', 'pm2 status', false],
  ['Git Status', 'git status --short', false]
];

const results = steps.map(([name, cmd, required]) => run(name, cmd, required));

const evidence = {
  islamicAIKernel: exists('runtime/islamic-ai-kernel/v1/sheikha-islamic-ai-kernel-v1-report.json'),
  languageIntegration: exists('runtime/sheikha-language-integration/sheikha-language-integration-v1-report.json'),
  osCloudSupercomputer: exists('runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1-report.json'),
  liveComputeBenchmark: exists('runtime/os-cloud-supercomputer/sheikha-live-compute-benchmark-v1-report.json'),
  identityV2: exists('runtime/identity/sheikha-active-identity-v2-report.json'),
  packageJson: exists('package.json'),
  server: exists('server.js')
};

const requiredFailed = results.filter(r => r.required && !r.ok);
const passedEvidence = Object.values(evidence).filter(Boolean).length;
const totalEvidence = Object.keys(evidence).length;

const report = {
  system: 'SHEIKHA_FULL_ACTIVATION_CLI_V1',
  status: requiredFailed.length === 0 && passedEvidence === totalEvidence ? 'PASSED' : 'NEEDS_REVIEW',
  generatedAt: new Date().toISOString(),
  principle: 'تفعيل محكوم بالأدلة: لا ادعاء بلا تحقق، ولا ضرر ولا ضرار',
  layers: [
    'islamic_ai_kernel',
    'arabic_language_integration',
    'os_cloud_supercomputer',
    'identity',
    'community',
    'truth_gate',
    'benchmark',
    'tests',
    'lint',
    'pm2',
    'git'
  ],
  evidenceScore: Math.round((passedEvidence / totalEvidence) * 100),
  evidence,
  requiredFailed,
  results,
  decision:
    requiredFailed.length === 0 && passedEvidence === totalEvidence
      ? 'SHEIKHA_FULL_ACTIVATION_VERIFIED_LOCALLY'
      : 'SHEIKHA_FULL_ACTIVATION_NEEDS_REVIEW'
};

fs.mkdirSync('runtime/full-activation', { recursive: true });
fs.writeFileSync('runtime/full-activation/sheikha-full-activation-cli-v1-report.json', JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  system: report.system,
  status: report.status,
  evidenceScore: report.evidenceScore,
  failed: requiredFailed.map(x => x.name),
  decision: report.decision,
  report: 'runtime/full-activation/sheikha-full-activation-cli-v1-report.json'
}, null, 2));

process.exit(report.status === 'PASSED' ? 0 : 1);
