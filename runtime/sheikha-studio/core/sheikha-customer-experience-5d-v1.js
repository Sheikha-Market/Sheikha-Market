'use strict';

const crypto = require('node:crypto');

const DIMENSIONS = Object.freeze([
  { id: 'VALUE', labelAr: 'القيمة النافعة', weight: 0.25 },
  { id: 'USABILITY', labelAr: 'سهولة الاستخدام', weight: 0.20 },
  { id: 'TRUST', labelAr: 'الثقة والأمان', weight: 0.25 },
  { id: 'CONTEXT', labelAr: 'ملاءمة البيئة والسياق', weight: 0.15 },
  { id: 'TIME', labelAr: 'السرعة والاستمرارية', weight: 0.15 },
]);

const SUPPORTED_ENVIRONMENTS = Object.freeze([
  'WEB', 'MOBILE', 'DESKTOP', 'AR_VR', 'PHYSICAL_SITE', 'CLASSROOM',
  'UNIVERSITY', 'WORKPLACE', 'INDUSTRIAL', 'AGRICULTURAL', 'MARKET',
]);

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function boundedScore(value) {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? score : null;
}

function normalizeScores(input = {}) {
  return DIMENSIONS.reduce((result, dimension) => {
    result[dimension.id] = boundedScore(input[dimension.id] ?? input[dimension.id.toLowerCase()]);
    return result;
  }, {});
}

function weightedScore(scores) {
  return Number(DIMENSIONS.reduce((total, dimension) => (
    total + (scores[dimension.id] * dimension.weight)
  ), 0).toFixed(2));
}

function evaluateCustomerExperience5D(input = {}) {
  const baseline = normalizeScores(input.baseline);
  const candidate = normalizeScores(input.candidate);
  const environments = [...new Set((Array.isArray(input.environments) ? input.environments : [])
    .map((item) => String(item).trim().toUpperCase()).filter(Boolean))];
  const minimumImprovement = Math.max(0, Number(input.minimumImprovement) || 3);
  const regressionTolerance = Math.max(0, Number(input.regressionTolerance) || 0);
  const blockers = [];
  if (input.consentGranted !== true) blockers.push('CUSTOMER_CONSENT_REQUIRED');
  if (!environments.length || environments.some((item) => !SUPPORTED_ENVIRONMENTS.includes(item))) {
    blockers.push('SUPPORTED_ENVIRONMENT_REQUIRED');
  }
  for (const dimension of DIMENSIONS) {
    if (baseline[dimension.id] === null) blockers.push(`BASELINE_${dimension.id}_REQUIRED_0_TO_100`);
    if (candidate[dimension.id] === null) blockers.push(`CANDIDATE_${dimension.id}_REQUIRED_0_TO_100`);
  }
  if (blockers.length) {
    return { system: 'SHEIKHA_CUSTOMER_EXPERIENCE_5D_V1', status: 'EVIDENCE_REQUIRED', blockers, promote: false };
  }

  const baselineScore = weightedScore(baseline);
  const candidateScore = weightedScore(candidate);
  const delta = Number((candidateScore - baselineScore).toFixed(2));
  const dimensionDeltas = Object.fromEntries(DIMENSIONS.map(({ id }) => [id, Number((candidate[id] - baseline[id]).toFixed(2))]));
  const regressions = Object.entries(dimensionDeltas)
    .filter(([, value]) => value < -regressionTolerance)
    .map(([dimension, value]) => ({ dimension, delta: value }));
  const eligible = delta >= minimumImprovement && regressions.length === 0;
  const assessment = {
    experienceId: String(input.experienceId || '').trim() || `exp-${digest({ baseline, candidate, environments }).slice(0, 12)}`,
    environments,
    baseline,
    candidate,
    baselineScore,
    candidateScore,
    delta,
    minimumImprovement,
    regressionTolerance,
    dimensionDeltas,
    regressions,
  };
  return {
    system: 'SHEIKHA_CUSTOMER_EXPERIENCE_5D_V1',
    definition: 'FIVE_MEASURABLE_EXPERIENCE_AXES_NOT_ADDITIONAL_PHYSICAL_DIMENSIONS',
    status: eligible ? 'CANDIDATE_ELIGIBLE_FOR_CONTROLLED_TRIAL' : 'BASELINE_RETAINED',
    assessment,
    promote: false,
    controlledTrialAllowed: eligible,
    humanReviewRequired: eligible,
    customerSpecificRolloutOnly: true,
    instantMeasurementSupported: true,
    automaticUniversalMutationAllowed: false,
    nextCycle: eligible ? 'RUN_BOUNDED_TRIAL_AND_MEASURE_AGAIN' : 'REVISE_HYPOTHESIS_WITHOUT_DEPLOYMENT',
    sha256: digest(assessment),
  };
}

function buildCustomerExperience5DStatus() {
  return {
    system: 'SHEIKHA_CUSTOMER_EXPERIENCE_5D_V1',
    status: 'ACTIVE_GOVERNED_MEASUREMENT_AND_TRIAL_PLANNING',
    dimensions: DIMENSIONS,
    supportedEnvironments: SUPPORTED_ENVIRONMENTS,
    cycle: ['OBSERVE', 'BASELINE', 'HYPOTHESIS', 'CANDIDATE', 'MEASURE', 'GUARDRAIL', 'HUMAN_REVIEW', 'BOUNDED_TRIAL', 'LEARN'],
    integration: ['SHEIKHA_360', 'SHEIKHA_VISUAL_FABRIC', 'SHEIKHA_COMMERCIAL_OS', 'SHEIKHA_CHAT', 'SHEIKHA_GARDENS'],
    boundaries: {
      betterExperienceMustBeMeasured: true,
      failedExperimentsAreRetainedAsEvidence: true,
      customerConsentRequired: true,
      noDarkPatternsOrManipulation: true,
      noUniversalAutomaticRollout: true,
      fiveDIsAnExperienceModelNotPhysicsClaim: true,
    },
  };
}

module.exports = { DIMENSIONS, SUPPORTED_ENVIRONMENTS, buildCustomerExperience5DStatus, evaluateCustomerExperience5D };
