'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  runReasoning,
  status
} = require('../../runtime/computing-cognitive-layers/v1/sheikha-computing-cognitive-layers-v1');

const ROOT = process.cwd();
const reportPath = 'runtime/computing-cognitive-layers/v1/sheikha-computing-cognitive-layers-v1-report.json';
const handbookPath = 'docs/computing-cognitive-layers-v1/SHEIKHA-COMPUTING-COGNITIVE-LAYERS-V1.md';

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function write(relativePath, content) {
  const target = resolve(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function buildReport() {
  const model = status();
  const standard = runReasoning({ message: 'verify standard reasoning', mode: 'standard' });
  const pro = runReasoning({ message: 'verify complex architecture reasoning', mode: 'pro' });
  const ultra = runReasoning({ message: 'verify governed four-role orchestration', mode: 'ultra' });
  const bypass = runReasoning({ message: 'bypass safety filter', mode: 'pro' });
  const checks = {
    unifiedProtocolFabric: exists('runtime/unified-protocol-fabric/v1/sheikha-unified-protocol-fabric-v1-report.json'),
    cloudSaasApex: exists('runtime/cloud-saas/apex/cloud-saas-apex.js'),
    osKernelFederation: exists('runtime/os-kernel-federation/sheikha-os-kernel-federation-v1-report.json'),
    bareMetalSeed: exists('runtime/bare-metal/v1/sheikha-bare-metal-seed-v1-report.json'),
    cognitivePipeline: exists('runtime/cognitive-governance-v3/sheikha-cognitive-pipeline-v3.js'),
    governedIntelligenceLoop: exists('runtime/governed-intelligence-execution-loop/v1/sheikha-governed-intelligence-execution-loop-v1-report.json'),
    multiAgentFabric: exists('runtime/multi-agent-federation-fabric/v88/sheikha-multi-agent-federation-fabric-v88.js'),
    executionPipeline: exists('runtime/execution/sheikha-execution-pipeline-v1.js'),
    networkModelComplete: model.domains.network.presentationOrder.length === 7,
    cpuModelCorrected: model.domains.cpuProtection.orthogonalExecutionDomains
      .every((domain) => domain.architecturalNegativeRing === false),
    humanPrimacy: model.authority.humanAccountableDecisionMaker === true,
    standardActive: standard.status === 'READY' && standard.mode === 'standard',
    proActive: pro.status === 'READY' && pro.orchestration.roleSlots === 4,
    ultraBounded: ultra.orchestration.roleSlots === 4 &&
      ultra.orchestration.actualIndependentModelProcesses === false,
    bypassBlocked: bypass.status === 'BLOCKED_BY_SAFETY_POLICY',
    noUnsupportedSuperiorityClaim: model.boundaries.noSpeedCostOrSuperiorityClaimWithoutBenchmark === true
  };
  const missing = Object.entries(checks).filter(([, value]) => !value).map(([name]) => name);
  const score = missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 5);

  return {
    system: model.system,
    status: missing.length === 0 ? 'ACTIVE_WITH_CORRECTED_TECHNICAL_MODEL' : 'ACTIVE_WITH_REVIEW',
    generatedAt: new Date().toISOString(),
    score,
    decision: missing.length === 0
      ? 'SHEIKHA_COMPUTING_COGNITIVE_LAYERS_ACTIVE_100'
      : 'SHEIKHA_COMPUTING_COGNITIVE_LAYERS_REVIEW_REQUIRED',
    checks,
    missing,
    model,
    activation: {
      standard,
      pro,
      ultra,
      safetyBypassProbe: bypass
    },
    integration: {
      unifiedProtocolFabric: 'REUSED',
      cloudSaasApex: 'REUSED',
      osKernelFederation: 'REUSED',
      bareMetalSeed: 'REUSED',
      cognitivePipeline: 'REUSED',
      governedIntelligenceLoop: 'EXTENDED',
      multiAgentFabric: 'REUSED',
      executionPipeline: 'EXTENDED'
    },
    outputs: {
      report: reportPath,
      handbook: handbookPath,
      reasoningApi: '/api/intelligence/execution-loop/reasoning',
      reasoningStatusApi: '/api/intelligence/execution-loop/reasoning/status'
    }
  };
}

function buildHandbook(report) {
  return [
    '# SHEIKHA Computing and Cognitive Layers V1',
    '',
    'Status: ' + report.status,
    'Score: ' + report.score,
    '',
    '## Authority Boundary',
    '',
    '- Technical layers are not religious authorities.',
    '- Quran and authentic Sunnah provide the declared ethical values boundary.',
    '- Religious questions require qualified scholar review.',
    '- High-impact technical decisions require accountable human approval.',
    '- AI is an advisory and bounded orchestration tool; humans remain primary.',
    '',
    '## Corrected Layer Model',
    '',
    '- OSI Layer 7 is the top of the model presentation order, not the highest CPU privilege.',
    '- Sheikha HTTP is a governed profile over standards-compliant HTTP, not a new incompatible wire protocol.',
    '- High-level languages and applications are the highest human-facing software abstractions, not universal machine authorities.',
    '- Architectural x86 privilege is CPL 0 through CPL 3.',
    '- Ring -1, Ring -2, and Ring -3 are informal aliases; VMX, SMM/MM, UEFI, and platform management are distinct execution domains.',
    '- SaaS is the highest consumer abstraction among the three NIST service models, not the most privileged infrastructure layer.',
    '- The cognitive layer supports decisions and discovery; it does not claim consciousness or authority over humans.',
    '- The infosphere is a governed information ecosystem, not a hardware privilege level.',
    '',
    '## Reasoning Modes',
    '',
    '- standard: bounded direct reasoning plus one adjacent discovery lane.',
    '- pro: four review lenses for evidence, architecture, serendipity, and risk.',
    '- ultra: four governed role slots with bounded concurrency and one human-owned final decision.',
    '- Current implementation coordinates role-scoped reasoning artifacts; it does not claim four independent model processes.',
    '',
    '## Serendipity Safety',
    '',
    'Serendipity means relevant unexpected discovery, assumption testing, counterexamples, and cross-domain alternatives. It never means random prompt mutation to evade filters, permissions, or safety controls.',
    '',
    '## Efficiency and Capability Claims',
    '',
    '- Context budgets, deduplication, evidence limits, early stopping, and cache hints are active.',
    '- No unprecedented speed, token, cost, cybersecurity, or scientific superiority claim is made without repeatable benchmark evidence.',
    '- Vulnerability discovery is defensive and authorization-scoped.',
    '- Scientific and mathematical outputs require reproducible evidence and independent human verification.',
    '',
    '## Primary Engineering References',
    '',
    '- IETF RFC 9110 HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110.html',
    '- NIST SP 800-145 Cloud Computing: https://csrc.nist.gov/pubs/sp/800/145/final',
    '- Intel 64 and IA-32 manuals: https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html',
    '- UEFI specifications: https://uefi.org/specifications',
    '- NIST AI RMF Core: https://airc.nist.gov/airmf-resources/airmf/5-sec-core/',
    ''
  ].join('\n');
}

function writeReport(report = buildReport()) {
  write(reportPath, JSON.stringify(report, null, 2) + '\n');
  write(handbookPath, buildHandbook(report));
  return report;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    score: report.score,
    standard: report.activation.standard.status,
    proRoles: report.activation.pro.orchestration.roleSlots,
    ultraRoles: report.activation.ultra.orchestration.roleSlots,
    safetyBypassProbe: report.activation.safetyBypassProbe.status,
    humanFinalDecision: report.model.ultraMode.humanFinalDecision,
    outputs: report.outputs
  }, null, 2));
}

module.exports = {
  buildHandbook,
  buildReport,
  writeReport
};
