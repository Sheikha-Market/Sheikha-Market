#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { privatePath, readPrivate } = require('../partnerships/evaluate-shared-goals-v1');
const { assessArtifact } = require('../../runtime/sheikha-ai-governor/v1/sheikha-model-foundry-v1');

const ROOT = path.resolve(__dirname, '../..');
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
function demand(ok, code) { if (!ok) throw new Error(code); }

function reconcileEvidence(report, checkpoint, verification) {
  demand(report.system === 'SHEIKHA_FOUNDATION_FROM_SCRATCH_LOCAL_V1', 'WRONG_REPORT_SYSTEM');
  demand(report.initialization === 'RANDOM' && report.pretrainedWeightsLoaded === false, 'NOT_FROM_SCRATCH');
  demand(Number.isSafeInteger(report.parameters) && report.parameters > 0 && report.parameters <= 2_000_000,
    'OUTSIDE_LOCAL_ENGINEERING_PROOF_PROFILE');
  demand(report.parameters === verification.parameters, 'PARAMETER_COUNT_MISMATCH');
  demand(report.stepsCompleted === checkpoint.stepsCompleted
    && report.stepsCompleted === verification.stepsCompleted, 'STEP_EVIDENCE_MISMATCH');
  demand(verification.status === 'LOCAL_CHECKPOINT_INTEGRITY_AND_RELOAD_VERIFIED', 'RELOAD_NOT_VERIFIED');
  demand(report.weightsSha256 === verification.weightsSha256
    && report.weightsSha256 === checkpoint.files['model.safetensors'], 'WEIGHTS_EVIDENCE_MISMATCH');
  demand(Number.isFinite(verification.validation?.crossEntropyPerByteToken)
    && verification.validation.crossEntropyPerByteToken === report.validationAfter?.crossEntropyPerByteToken,
  'VALIDATION_EVIDENCE_MISMATCH');
  const trained = Number.isSafeInteger(report.stepsCompleted) && report.stepsCompleted > 0
    && verification.weightsSha256 !== checkpoint.initialWeightsSha256;
  const gate = assessArtifact({
    modelId: report.modelId, artifactSha256: verification.weightsSha256,
    nativeInferencePassed: trained,
    qualityGatePassed: false, safetyGatePassed: false, licenseGatePassed: false,
    securityGatePassed: false, canaryPassed: false, humanCommercialApproval: false,
  });
  return {
    system: 'SHEIKHA_FOUNDRY_FROM_SCRATCH_EVIDENCE_INTEGRATION_V1',
    status: trained ? 'SMALL_RANDOM_INITIALIZED_MODEL_TRAINED_RELEASE_DENIED' : 'INITIALIZATION_ONLY_RELEASE_DENIED',
    lifecycleStage: gate.lifecycleStage, modelId: report.modelId, parameters: report.parameters,
    stepsCompleted: report.stepsCompleted, weightsSha256: verification.weightsSha256,
    checkpointIntegrityVerified: true, freshCpuInferenceVerified: true,
    independentThirdPartyAttestation: false,
    purpose: 'LOCAL_TRAINING_CHECKPOINT_RELOAD_AND_RESUME_ENGINEERING_PROOF',
    largeLlmTrainingComplete: false, servingModelReplaced: false,
    externalRegistryUpdated: false, cloudResourcesProvisioned: false,
    legalOwnershipCertified: false, requestedWeightsOwner: 'SHEIKHA',
    releaseGate: gate,
  };
}

function inspectRun(file) {
  file = privatePath(file);
  const bytes = readPrivate(file);
  const report = JSON.parse(bytes);
  demand(['micro', 'mini', 'seed'].includes(report.profile), 'UNKNOWN_BOUNDED_PROFILE');
  demand(/^checkpoint-\d{6}$/.test(report.checkpoint || ''), 'INVALID_CHECKPOINT_NAME');
  const checkpointDir = path.join(path.dirname(file), report.checkpoint);
  const checkpointBytes = readPrivate(path.join(checkpointDir, 'checkpoint.json'));
  demand(hash(checkpointBytes) === report.checkpointSha256, 'CHECKPOINT_REPORT_BINDING_MISMATCH');
  const checkpoint = JSON.parse(checkpointBytes);
  demand(hash(readPrivate(path.join(path.dirname(file), 'trainer-source.py'))) === checkpoint.sourceSha256,
    'SOURCE_ARCHIVE_BINDING_MISMATCH');
  const output = execFileSync(path.join(ROOT, '.venv-llm/bin/python'), [
    path.join(ROOT, 'tools/training/train-sheikha-foundation-scratch-v1.py'), '--verify', checkpointDir,
    '--profile', report.profile,
  ], { cwd: ROOT, timeout: 120_000, maxBuffer: 1024 * 1024, encoding: 'utf8',
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const verification = JSON.parse(output.trim());
  const evidence = { ...reconcileEvidence(report, checkpoint, verification), inputReportSha256: hash(bytes) };
  return { ...evidence, evidenceSha256: hash(JSON.stringify(evidence)) };
}

function main(args) {
  demand(args.length === 4 && args[0] === '--input' && args[2] === '--out',
    'USAGE: --input PRIVATE_RUN_REPORT --out NEW_PRIVATE_JSON');
  const output = privatePath(args[3]);
  demand(!fs.existsSync(output), 'OUTPUT_ALREADY_EXISTS');
  demand((fs.statSync(path.dirname(output)).mode & 0o777) === 0o700, 'OUTPUT_DIRECTORY_MODE_700_REQUIRED');
  const report = inspectRun(args[1]);
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  return { status: report.status, parameters: report.parameters, stepsCompleted: report.stepsCompleted,
    lifecycleStage: report.lifecycleStage, commercialProductionApproved: report.releaseGate.commercialProductionApproved };
}

if (require.main === module) {
  try { console.log(JSON.stringify(main(process.argv.slice(2)), null, 2)); }
  catch (error) {
    console.error(JSON.stringify({ status: 'EVIDENCE_REJECTED_RELEASE_DENIED',
      error: /^[A-Z0-9_: -]+$/.test(error.message) ? error.message : 'LOCAL_EVIDENCE_VERIFICATION_FAILED' }));
    process.exitCode = 1;
  }
}

module.exports = { reconcileEvidence, inspectRun, main };
