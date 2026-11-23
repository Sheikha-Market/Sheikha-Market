'use strict';

const bare = require('../bare-metal/manifest');
const { SheikhaInfiniteAgentKernel, POLICY } = require('../sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel');
const natural = require('../sheikha-natural-integration/v1/sheikha-natural-integration-model');
const language = require('../../core/language/sheikha-managed-language-v1.cjs');
const research = require('../../core/research/sheikha-research-brain-v1.cjs');

const id = 'SHEIKHA_LOCAL_KERNEL_COMPOSITION_V1';
const manifest = Object.freeze({
  schema: id, version: '1.0',
  platform: bare,
  kernelPolicy: POLICY,
  science: Object.freeze({ methods: research.METHODS, evidenceRequired: true, conclusionsVerified: false }),
  components: Object.freeze({
    descriptors: 'SheikhaInfiniteAgentKernel',
    programming: 'SHEIKHA_MANAGED_LANGUAGE_V1',
    naturalSimulation: 'SYNTHETIC_WATER_BALANCE',
    research: 'LOCAL_RESEARCH_PLAN'
  }),
  externalExecution: false, productionReady: false
});

function noOptions(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(options)) || Reflect.ownKeys(options).length) {
    throw new Error('KERNEL_OPTIONS_NOT_ADMITTED');
  }
}

function getManifest(options = {}) {
  noOptions(options);
  return manifest;
}

function health(options = {}) {
  noOptions(options);
  return {
    success: true, kernel: id, status: 'LOCAL_COMPONENTS_LOADED',
    base: bare.base, bare_metal: bare.id,
    live: false, seal: null, bootExecuted: false, externalExecution: false, productionReady: false
  };
}

function verifyLocal(options = {}) {
  noOptions(options);
  // Each probe owns a tiny disposable registry; it never mutates the API registry.
  const kernel = new SheikhaInfiniteAgentKernel({ maxAgents: 3, maxDepth: 1, maxChildren: 2, totalBudget: 3 });
  const parent = kernel.registerBot();
  kernel.spawnChild(parent.id);
  kernel.spawnChild(parent.id);
  let quotaEnforced = false;
  try { kernel.registerBot(); } catch (error) { quotaEnforced = error.code === 'MAX_AGENTS_EXCEEDED'; }
  const decisions = ['change-l0-policy', 'deploy', 'operate-device', 'change-model-weights']
    .map(action => kernel.evaluateOperation(parent.id, { action }));
  const program = language.status();
  const water = natural.simulateDay({ scenario: 'island', rainMm: 20 });
  const study = research.plan({ question: 'How should a synthetic water-balance model be independently evaluated?',
    method: 'simulation', evidenceIds: [] });
  const checks = {
    boundedDescriptors: kernel.statistics().agents === 3 && quotaEnforced,
    externalOperationsDenied: decisions.every(item => item.status === 'DENIED' && item.executed === false),
    programmingProbe: program.success === true && program.evidence.strictIsolation === true &&
      program.evidence.adapterDryRun === true && program.evidence.adapterCalls.every(item => item.live === false),
    syntheticWaterBalance: water.synthetic === true && water.water.conserved === true &&
      Math.abs(water.water.balanceResidualMm) <= water.water.balanceToleranceMm,
    researchPlanOnly: study.status === 'LOCAL_RESEARCH_PLAN' && study.authorityGranted === false && study.conclusion === 'UNKNOWN'
  };
  const success = Object.values(checks).every(Boolean);
  return {
    success, schema: 'SHEIKHA_LOCAL_KERNEL_VERIFICATION_V1',
    status: success ? 'LOCAL_SELF_TEST_PASSED' : 'LOCAL_SELF_TEST_FAILED',
    checks,
    observedHost: { platform: process.platform, architecture: process.arch, node: process.versions.node },
    descriptors: { created: kernel.statistics().agents, persistent: false, quotaEnforced },
    programming: program,
    naturalSimulation: { synthetic: water.synthetic === true, balanceResidualMm: water.water.balanceResidualMm },
    research: { method: study.method, evidenceCount: study.evidenceIds.length, conclusion: study.conclusion },
    ai: bare.ai,
    bootExecuted: false, deviceCommandsSent: false, externalExecution: false,
    physicalHardwareQualified: false, productionReady: false
  };
}

module.exports = Object.freeze({ id, base: bare.base, bare_metal: bare, manifest, health, getManifest, verifyLocal });
