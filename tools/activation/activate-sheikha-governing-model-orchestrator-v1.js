'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  buildGoverningPortfolio,
  planCapabilityRoute,
  buildGovernedStudentTrainingPlan
} = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-governing-model-orchestrator-v1'
);

const root = path.resolve(__dirname, '../..');
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const federation = read('runtime/sheikha-ai-governor/v1/sheikha-model-federation-v1.json');
const evaluations = {
  'qwen3:4b': read('runtime/sheikha-ai-governor/v1/llm-training/qwen3-4b-arabic-evaluation.json'),
  'Sheikha-Core:latest': read('runtime/sheikha-ai-governor/v1/llm-training/sheikha-core-candidate-evaluation.json'),
  'Llama-Sheikha-Governed:8b': read('runtime/sheikha-ai-governor/v1/llm-training/llama-sheikha-governed-8b-evaluation.json')
};
const licenseOverrides = {
  'qwen3:4b': { licenseId: 'Apache-2.0', licenseVerified: true, commercialUseVerified: true },
  'Sheikha-Core:latest': { licenseId: 'Llama-3.1-Community', licenseVerified: true, commercialUseVerified: false },
  'Llama-Sheikha-Governed:8b': { licenseId: 'Llama-3.1-Community', licenseVerified: true, commercialUseVerified: false }
};
let output = '';
try { output = execFileSync('ollama', ['list'], { encoding: 'utf8', timeout: 10000 }); } catch {}
let localModels = output.trim().split('\n').slice(1).filter(Boolean).map((line) => {
  const [name, id, size] = line.trim().split(/\s{2,}/);
  const evaluation = evaluations[name];
  return {
    name, id, size, capabilities: ['INFERENCE'], ...(licenseOverrides[name] || {}),
    qualityGatePassed: evaluation?.qualityGatePassed === true,
    latencyGatePassed: evaluation?.averageLatencyMs > 0 && evaluation.averageLatencyMs <= 8000
  };
});
if (!localModels.length) {
  try {
    localModels = read('runtime/sheikha-ai-governor/v1/sheikha-governing-model-orchestrator-v1.json')
      .localModels || [];
  } catch {}
}
const portfolio = buildGoverningPortfolio({
  federation, localModels,
  evidence: {
    federation: 'runtime/sheikha-ai-governor/v1/sheikha-model-federation-v1.json',
    qwen3Evaluation: 'runtime/sheikha-ai-governor/v1/llm-training/qwen3-4b-arabic-evaluation.json',
    internalLicenseNumber: 'SHEIKHA-AI-GOV-ORCH-2026-0001',
    licenseNature: 'INTERNAL_PRODUCT_LICENSE_NOT_GOVERNMENT_ACCREDITATION'
  }
});
portfolio.probes = [
  planCapabilityRoute(portfolio, { capabilities: ['INFERENCE'] }),
  planCapabilityRoute(portfolio, { capabilities: ['TRAINING'], highImpact: true })
];
portfolio.studentTraining = {
  softwareQualityProbe: buildGovernedStudentTrainingPlan({
    domain: 'software-quality', studentModelId: 'sheikha-student-software-v1',
    baseModelLicenseVerified: true,
    dataset: {
      licenseVerified: true,
      provenanceVerified: true, piiAndSecretReviewPassed: true
    }
  }),
  islamicReferenceProbe: buildGovernedStudentTrainingPlan({
    domain: 'islamic-reference-assistance', studentModelId: 'sheikha-student-reference-v1',
    islamicReferenceClaims: true
  })
};
const target = path.join(root, 'runtime/sheikha-ai-governor/v1/sheikha-governing-model-orchestrator-v1.json');
fs.writeFileSync(target, `${JSON.stringify(portfolio, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ system: portfolio.system, counts: portfolio.counts, status: 'ACTIVE_GOVERNED_NOT_COMMERCIALLY_PROMOTED', output: path.relative(root, target) }, null, 2)}\n`);
