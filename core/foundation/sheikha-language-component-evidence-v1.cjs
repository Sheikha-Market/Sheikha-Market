'use strict';
const fs = require('node:fs'); const path = require('node:path'); const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '../..');
const foundation = require('./sheikha-foundation-management-v1.cjs');
const FILES = {
  governance: ['core/security/sheikha-sdk-mcp-governance.cjs', 'mcp-servers/config/policies.json'],
  ownership: ['contracts/ownership-licensing/sheikha-ownership-licensing-contract.v1.json'],
  platform: ['server.js', 'routes/sheikha-foundation-management-v1.cjs'],
  foundry: ['core/foundry/sheikha-foundry-v1.js', 'runtime/sheikha-ai-governor/v1/llm-training/sheikha-model-foundry-v1-report.json'],
  llm: ['runtime/sheikha-ai-governor/v1/llm-training/sheikha-model-foundry-v1-report.json'],
  factories: ['runtime/platform-factories/v1/registries/factory-pipeline-map.json'],
  pipelines: ['runtime/platform-factories/v1/registries/factory-pipeline-map.json', 'core/foundation/sheikha-language-production-v1.cjs']
};
function artifact(file) {
  const content = fs.readFileSync(path.join(ROOT, file));
  return { file, bytes: content.length, sha256: crypto.createHash('sha256').update(content).digest('hex') };
}
function inspect(id) {
  if (['utf', 'core', 'studio', 'lab', 'visual', 'firmware', 'bare-metal'].includes(id)) return foundation.inspect(id);
  let evidence;
  if (id === 'language') {
    const result = require('../language/sheikha-managed-language-v1.cjs').status();
    evidence = { passed: result.success, basis: 'ACTUAL_LOCAL_COMPILER_VM_PROBE' };
  } else if (id === 'sdk') {
    const client = require('../../sdk/sheikha-js').createSheikhaClient();
    const result = client.run('إجراء اختبار:\n  اعرض "SDK_PROBE"\n');
    evidence = { passed: result.success && result.output.some(s => s.includes('SDK_PROBE')), basis: 'LOCAL_SDK_LANGUAGE_EXECUTION' };
  } else if (id === 'mcp') {
    const gate = require('../security/sheikha-sdk-mcp-governance.cjs');
    const admitted = gate.decision('sheikha_foundation_status').allowed;
    const denied = !gate.decision('sheikha_scaffold').allowed;
    evidence = { passed: admitted && denied, basis: 'POLICY_ADMISSION_AND_DENIAL_PROBE', liveServerVerified: 'UNKNOWN' };
  } else if (id === 'weights') {
    const names = ['qwen2.5-0.5b-lora-cidar-v1', 'qwen2.5-0.5b-lora-curriculum-v2', 'qwen2.5-0.5b-lora-pilot-v1'];
    const artifacts = names.map(name => artifact('runtime/sheikha-ai-governor/v1/llm-training/' + name + '/adapter/adapter_model.safetensors'));
    evidence = { passed: artifacts.every(a => a.bytes > 8), basis: 'LOCAL_ADAPTER_ARTIFACT_HASHES', artifacts,
      legalOwnershipVerified: 'UNKNOWN', trainingQualityVerified: 'UNKNOWN' };
  } else {
    if (!Object.hasOwn(FILES, id)) throw new Error('UNKNOWN_COMPONENT');
    const artifacts = FILES[id].map(artifact);
    evidence = { passed: artifacts.every(a => a.bytes > 0), basis: 'LOCAL_IMPLEMENTATION_ARTIFACT_PRESENCE_ONLY', artifacts,
      liveRuntimeVerified: 'UNKNOWN', legalOwnershipVerified: id === 'ownership' ? 'UNKNOWN' : undefined };
  }
  return { component: id, status: evidence.passed ? 'LOCAL_EVIDENCE_AVAILABLE' : 'UNKNOWN', evidence };
}
module.exports = { inspect };
