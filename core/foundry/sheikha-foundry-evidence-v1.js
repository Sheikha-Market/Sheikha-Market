'use strict';

const crypto = require('node:crypto');

function object(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !fields.includes(key))) throw new Error('INVALID_EVIDENCE_FIELDS');
}
function ref(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/.test(value)) throw new Error('INVALID_EVIDENCE_REFERENCE');
  return value;
}
function hash(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) throw new Error('INVALID_EVIDENCE_SHA256');
  return value;
}
function digest(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

function buildTrainingResultIndex(input) {
  const refs = ['runId', 'tenantRef', 'modelRef', 'objective', 'contractRef', 'licenseRef'];
  const hashes = ['artifactSha256', 'baseSha256', 'tokenizerSha256', 'recipeSha256', 'datasetManifestSha256', 'evaluationSha256'];
  object(input, [...refs, ...hashes]);
  const record = {
    system: 'SHEIKHA_TRAINING_RESULT_INDEX_V1', classification: 'CONFIDENTIAL',
    ...Object.fromEntries(refs.map(key => [key, ref(input[key])])),
    ...Object.fromEntries(hashes.map(key => [key, hash(input[key])])),
    status: 'DECLARED_LINEAGE_PENDING_VERIFICATION', contentVerified: false,
    rightsVerified: false, reusableAcrossTenants: false, approvedForPromotion: false,
    baseSha256Meaning: 'INITIAL_CHECKPOINT_FOR_SCRATCH_OR_UPSTREAM_CHECKPOINT_FOR_DERIVATIVE',
  };
  return {...record, indexSha256: digest(record), digestIsSignature: false};
}

function evaluation(value) {
  object(value, ['artifactSha256', 'holdoutSha256', 'recipeSha256', 'sampleCount', 'taskScore', 'safetyFailureRate', 'p95LatencyMs', 'costHalalaPer1000Requests']);
  const parsed = {...value};
  for (const key of ['artifactSha256', 'holdoutSha256', 'recipeSha256']) parsed[key] = hash(value[key]);
  if (!Number.isSafeInteger(value.sampleCount) || value.sampleCount < 1 || value.sampleCount > 1000000000) throw new Error('INVALID_EVALUATION_SAMPLE_COUNT');
  for (const key of ['taskScore', 'safetyFailureRate']) if (!Number.isFinite(value[key]) || value[key] < 0 || value[key] > 1) throw new Error('INVALID_EVALUATION_RATE');
  for (const key of ['p95LatencyMs', 'costHalalaPer1000Requests']) if (!Number.isFinite(value[key]) || value[key] <= 0 || value[key] > 10000000000) throw new Error('INVALID_EVALUATION_COST_OR_LATENCY');
  return parsed;
}

function reviewModelImprovement(input) {
  object(input, ['baseline', 'candidate']);
  const baseline = evaluation(input.baseline);
  const candidate = evaluation(input.candidate);
  const blockers = [];
  if (baseline.artifactSha256 === candidate.artifactSha256) blockers.push('DISTINCT_CANDIDATE_REQUIRED');
  if (baseline.holdoutSha256 !== candidate.holdoutSha256 || baseline.recipeSha256 !== candidate.recipeSha256 || baseline.sampleCount !== candidate.sampleCount) blockers.push('COMPARABLE_HOLDOUT_AND_EVALUATION_RECIPE_REQUIRED');
  if (Math.min(baseline.sampleCount, candidate.sampleCount) < 30) blockers.push('MINIMUM_REVIEW_SAMPLE_COUNT_NOT_MET');
  if (candidate.taskScore < baseline.taskScore) blockers.push('TASK_QUALITY_REGRESSION');
  if (candidate.safetyFailureRate > baseline.safetyFailureRate) blockers.push('SAFETY_REGRESSION');
  if (candidate.p95LatencyMs > baseline.p95LatencyMs) blockers.push('LATENCY_REGRESSION');
  if (candidate.costHalalaPer1000Requests > baseline.costHalalaPer1000Requests) blockers.push('COST_REGRESSION');
  if (!(candidate.taskScore > baseline.taskScore || candidate.safetyFailureRate < baseline.safetyFailureRate || candidate.p95LatencyMs < baseline.p95LatencyMs || candidate.costHalalaPer1000Requests < baseline.costHalalaPer1000Requests)) blockers.push('NO_MEASURED_IMPROVEMENT');
  const review = {
    system: 'SHEIKHA_MODEL_IMPROVEMENT_REVIEW_V1', baseline, candidate, blockers,
    status: blockers.length ? 'KEEP_BASELINE' : 'CANDIDATE_PENDING_INDEPENDENT_REVIEW',
    eligibleForHumanReview: blockers.length === 0, minimumSamplesForTriageOnly: 30,
    statisticallySignificant: false, metricsIndependentlyVerified: false,
    automaticPromotion: false, releaseAuthorized: false,
    nextRequirements: ['VERIFY_RAW_EVALUATION_AND_LEAKAGE', 'TASK_SPECIFIC_ABSOLUTE_THRESHOLDS', 'STATISTICAL_POWER_AND_CONFIDENCE', 'SIGN_OFF_CANARY_AND_ROLLBACK'],
  };
  return {...review, reviewSha256: digest(review)};
}

module.exports = {buildTrainingResultIndex, reviewModelImprovement};
