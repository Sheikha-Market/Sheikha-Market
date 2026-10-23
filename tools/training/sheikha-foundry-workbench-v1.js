#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {buildFoundryCommercialPolicy, buildFoundryQuote} = require('../../core/foundry/sheikha-foundry-commercial-v1');
const {buildModelCompositionPlan, COMPOSITION_METHODS, HARDWARE_TARGETS} = require('../../runtime/sheikha-ai-governor/v1/sheikha-composite-model-v1');
const {buildTrainingResultIndex, reviewModelImprovement} = require('../../core/foundry/sheikha-foundry-evidence-v1');
const {buildByocPlan} = require('../../core/foundry/sheikha-byoc-plan-v1');
const {planReinvestment} = require('../../core/foundry/sheikha-reinvestment-v1');
const {compareTrainingSourcing, reviewTrainingExit} = require('../../core/foundry/sheikha-training-sourcing-v1');
const {buildStorageCustodyPlan} = require('../../core/foundry/sheikha-storage-custody-plan-v1');
const {planFoundryCapacity} = require('../../core/foundry/sheikha-foundry-capacity-v1');
const {buildPlatformReleaseCompatibility} = require('../../core/governance/sheikha-firmware-uefi-secure-boot-integration-v1');
const {verifyPlatformEvidence} = require('../verification/sheikha-platform-release-evidence-v1');

function readInput(file) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > 32768) throw new Error('INPUT_MUST_BE_A_REGULAR_JSON_FILE_AT_MOST_32_KIB');
    const bytes = Buffer.alloc(32769);
    let length = 0;
    while (length < bytes.length) {
      const read = fs.readSync(fd, bytes, length, bytes.length - length, null);
      if (!read) break;
      length += read;
    }
    if (length > 32768) throw new Error('INPUT_TOO_LARGE');
    return JSON.parse(bytes.subarray(0, length).toString('utf8'));
  } finally { fs.closeSync(fd); }
}

async function verifyLocalArtifact(record, file) {
  const root = fs.realpathSync(path.resolve(__dirname, '../../reports/private'));
  const resolved = fs.realpathSync(file);
  if (!resolved.startsWith(root + path.sep)) throw new Error('ARTIFACT_MUST_BE_IN_PRIVATE_REPORTS');
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const before = fs.fstatSync(fd);
    const canonical = fs.statSync(resolved);
    if (!before.isFile() || before.ino !== canonical.ino || before.dev !== canonical.dev || before.size < 1 || before.size > 64 * 1024 ** 3) throw new Error('INVALID_ARTIFACT_FILE');
    const hasher = crypto.createHash('sha256');
    let bytes = 0;
    for await (const chunk of fs.createReadStream(null, {fd, autoClose: false, highWaterMark: 1024 * 1024})) {
      bytes += chunk.length;
      if (bytes > before.size) throw new Error('ARTIFACT_CHANGED_DURING_READ');
      hasher.update(chunk);
    }
    const after = fs.fstatSync(fd);
    if (bytes !== before.size || before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) throw new Error('ARTIFACT_CHANGED_DURING_READ');
    const sha256 = hasher.digest('hex');
    if (sha256 !== record.artifactSha256) throw new Error('ARTIFACT_SHA256_MISMATCH');
    return {
      system: 'SHEIKHA_LOCAL_ARTIFACT_HASH_CHECK_V1', declaredIndex: record,
      artifactFileSha256Verified: true, artifactSha256: sha256, bytes,
      verifiedAt: new Date().toISOString(), weightsLoaded: false,
      lineageVerified: false, rightsVerified: false, approvedForPromotion: false,
    };
  } finally { fs.closeSync(fd); }
}

function exampleInputs() {
  const hash = character => character.repeat(64);
  const models = ['example-arabic', 'example-code'].map((id, i) => ({
    id, kind: 'LORA', architecture: 'example-only', weightsSha256: hash(String(i + 1)), baseSha256: hash('a'),
    tensorSchemaSha256: hash('b'), tokenizerSha256: hash('c'), format: 'safetensors',
    capabilities: [i ? 'coding' : 'arabic'], dataRef: 'example-data', objective: 'sft',
    licenseRef: 'example-license', evaluationRef: 'example-evaluation', adapterRank: 16, adapterTargets: ['q_proj', 'v_proj'],
  }));
  return {
    composition: {method: 'LORA_COMPOSITION', tasks: ['arabic', 'coding'], models, target: {hardware: 'CUDA', venue: 'LOCAL', maxConcurrentJobs: 1, budgetHalala: 0}},
    quote: {
      customerRef: 'EXAMPLE_NOT_A_REAL_CUSTOMER', mode: 'CUSTOMER_OWNED_TRAINING', purpose: 'COMMERCIAL',
      baseKind: 'OPEN_WEIGHTS', baseRef: 'example-base', licenseRef: 'example-license', artifactKind: 'ADAPTER',
      venue: 'LOCAL', customerBudgetHalala: 200000, contributionProposal: 'NONE',
      pricing: {gpuMinutes: 120, gpuRateHalalaPerHour: 600, laborMinutes: 240, laborRateHalalaPerHour: 10000, storageHalala: 1000, evaluationHalala: 10000, rightsReviewHalala: 10000, deliveryHalala: 5000, reserveBps: 2000, marginBps: 3000},
    },
  };
}

async function main(args) {
  const [command, ...rest] = args;
  if (['policy', 'demo', 'help'].includes(command) && rest.length) throw new Error('UNEXPECTED_ARGUMENTS');
  if (command === 'policy') return {...buildFoundryCommercialPolicy(), compositionMethods: COMPOSITION_METHODS, hardwareTargetsForPlanningOnly: HARDWARE_TARGETS};
  if (command === 'demo') {
    const examples = exampleInputs();
    return {classification: 'FICTIONAL_EXAMPLES_NOT_MEASURED_MODELS_OR_SIGNED_QUOTES', examples, composition: buildModelCompositionPlan(examples.composition), quote: buildFoundryQuote(examples.quote), networkCalls: 0, trainingExecuted: false};
  }
  if (command === 'help' || !command) return {commands: ['policy', 'demo', 'quote --input FILE', 'composition --input FILE', 'index --input FILE [--artifact PRIVATE_FILE]', 'improvement --input FILE', 'byoc --input FILE', 'reinvestment --input FILE', 'sourcing --input FILE', 'exit-review --input FILE', 'storage-plan --input FILE', 'capacity --input FILE', 'platform-release --input FILE', 'platform-evidence --input FILE'], effects: 'LOCAL_READ_ONLY_NO_TRAINING_NO_PROVISIONING_NO_PERSISTENCE'};
  if (command === 'platform-evidence') {
    if (rest.length !== 2 || rest[0] !== '--input' || !rest[1]) throw new Error('EXPECTED_INPUT_FILE');
    const workspaceRoot = path.resolve(__dirname, '../..');
    const allowedRoots = ['bare-metal/images', 'runtime/bare-metal', 'reports/private'].map(root => path.join(workspaceRoot, root));
    return verifyPlatformEvidence(readInput(rest[1]), {workspaceRoot, allowedRoots});
  }
  const handlers = {quote: buildFoundryQuote, composition: buildModelCompositionPlan, index: buildTrainingResultIndex, improvement: reviewModelImprovement, byoc: buildByocPlan, reinvestment: planReinvestment, sourcing: compareTrainingSourcing, 'exit-review': reviewTrainingExit, 'storage-plan': buildStorageCustodyPlan, capacity: planFoundryCapacity, 'platform-release': buildPlatformReleaseCompatibility};
  if (!Object.hasOwn(handlers, command)) throw new Error('UNKNOWN_COMMAND');
  if (rest[0] !== '--input' || !rest[1] || ![2, 4].includes(rest.length)) throw new Error('EXPECTED_INPUT_FILE');
  if (rest.length === 4 && (command !== 'index' || rest[2] !== '--artifact' || !rest[3])) throw new Error('UNEXPECTED_ARGUMENTS');
  const result = handlers[command](readInput(rest[1]));
  return rest.length === 4 ? verifyLocalArtifact(result, rest[3]) : result;
}

function exitCodeForResult(command, result) {
  return command === 'platform-evidence' && result.requiredFilesVerified !== true ? 2 : 0;
}

if (require.main === module) {
  main(process.argv.slice(2)).then(result => {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exitCode = exitCodeForResult(process.argv[2], result);
  }).catch(error => {
    const code = /^[A-Z0-9_]+$/.test(error.message) ? error.message : 'FOUNDRY_WORKBENCH_INPUT_OR_FILE_ERROR';
    process.stderr.write(JSON.stringify({success: false, error: code}) + '\n');
    process.exitCode = 1;
  });
}

module.exports = {main, readInput, verifyLocalArtifact, exampleInputs, exitCodeForResult};
