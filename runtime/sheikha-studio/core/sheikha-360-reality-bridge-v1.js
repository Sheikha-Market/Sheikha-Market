'use strict';

const crypto = require('node:crypto');

const ENVIRONMENTS = Object.freeze([
  'BUILT',
  'INDUSTRIAL',
  'AGRICULTURAL',
  'ENVIRONMENTAL',
  'MARKET',
  'TECHNICAL',
  'GEOGRAPHIC',
  'ASTRONOMICAL_OBSERVED',
]);

const PROHIBITED_SCOPE = /(?:غيب|الآخرة|الجنة|الفردوس|خلق الحياة|خلق الروح|unseen|afterlife|paradise|create life|create soul)/iu;
const BOUNDARIES = Object.freeze({
  threeSixtyMeansDeclaredDataAndViewCoverageNotOmniscience: true,
  modelIsNotReality: true,
  simulationIsNotPredictionOfTheUnseen: true,
  noCreationLifeSoulConsciousnessOrAfterlifeClaim: true,
  astronomyAndGeographyAreLimitedToMeasuredPhysicalEvidence: true,
  specificReligiousRulingsRequireQualifiedHumanReview: true,
  repeatablePatternsAreStudiedAsObservedCausalityNotDivineEssence: true,
});

const FIDELITY_LEVELS = Object.freeze([
  { min: 90, id: 'HIGH_FIDELITY_MEASURED_MODEL' },
  { min: 75, id: 'SUBSTANTIAL_MEASURED_MODEL' },
  { min: 50, id: 'PARTIAL_MEASURED_MODEL' },
  { min: 0, id: 'LOW_EVIDENCE_MODEL' },
]);

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function normalizeObservation(input = {}) {
  const value = Number(input.value);
  const uncertainty = Number(input.uncertainty);
  const observedAt = String(input.observedAt || '').trim();
  const validTime = observedAt !== '' && Number.isFinite(Date.parse(observedAt));
  const observation = {
    metric: String(input.metric || '').trim(),
    value,
    unit: String(input.unit || '').trim(),
    source: String(input.source || '').trim(),
    observedAt,
    uncertainty,
    calibrated: input.calibrated === true,
  };
  const missing = [];
  if (!observation.metric) missing.push('metric');
  if (!Number.isFinite(value)) missing.push('value');
  if (!observation.unit) missing.push('unit');
  if (!observation.source) missing.push('source');
  if (!validTime) missing.push('observedAt');
  if (!Number.isFinite(uncertainty) || uncertainty < 0) missing.push('uncertainty');
  return { observation, missing };
}

function assessRealityFidelity(observations, input = {}) {
  const assessedAtMs = Date.parse(String(input.assessedAt || ''));
  const referenceMs = Number.isFinite(assessedAtMs)
    ? assessedAtMs
    : Math.max(...observations.map((item) => Date.parse(item.observedAt)));
  const expectedObservationCount = Math.max(1, Number(input.expectedObservationCount) || observations.length);
  const agesHours = observations.map((item) => Math.max(0, referenceMs - Date.parse(item.observedAt)) / 3600000);
  const newestAgeHours = Math.min(...agesHours);
  const temporalScore = newestAgeHours <= 1 ? 20 : newestAgeHours <= 24 ? 15 : newestAgeHours <= 168 ? 8 : 2;
  const provenanceScore = observations.every((item) => item.source) ? 25 : 0;
  const measurementScore = 20 + (observations.every((item) => item.calibrated) ? 5 : 0);
  const coverageScore = Math.min(20, Number(((observations.length / expectedObservationCount) * 20).toFixed(2)));
  const sourceDiversityScore = Math.min(10, new Set(observations.map((item) => item.source)).size * 5);
  const score = Number((provenanceScore + temporalScore + measurementScore + coverageScore + sourceDiversityScore).toFixed(2));
  return {
    score,
    level: FIDELITY_LEVELS.find((level) => score >= level.min).id,
    components: { provenanceScore, temporalScore, measurementScore, coverageScore, sourceDiversityScore },
    newestObservationAgeHours: Number(newestAgeHours.toFixed(3)),
    expectedObservationCount,
    assessedAt: new Date(referenceMs).toISOString(),
    claim: 'MEASURED_MODEL_FIDELITY_NOT_ABSOLUTE_TRUTH',
  };
}

function buildRealityTwin(input = {}) {
  const name = String(input.name || '').trim();
  const environment = String(input.environment || '').trim().toUpperCase();
  const observations = Array.isArray(input.observations) ? input.observations : [];
  const text = `${name} ${String(input.purpose || '')}`;

  if (PROHIBITED_SCOPE.test(text)) {
    return {
      system: 'SHEIKHA_360_REALITY_BRIDGE_V1',
      status: 'SCOPE_DENIED',
      blockers: ['UNSEEN_AFTERLIFE_OR_CREATION_CLAIM_OUTSIDE_ENGINEERING_SCOPE'],
      executionAllowed: false,
    };
  }

  const normalized = observations.map(normalizeObservation);
  const blockers = [];
  if (!name) blockers.push('TWIN_NAME_REQUIRED');
  if (!ENVIRONMENTS.includes(environment)) blockers.push('SUPPORTED_OBSERVED_ENVIRONMENT_REQUIRED');
  if (!normalized.length) blockers.push('OBSERVATION_REQUIRED');
  normalized.forEach(({ missing }, index) => {
    missing.forEach((field) => blockers.push(`OBSERVATION_${index}_${field.toUpperCase()}_REQUIRED`));
  });
  if (blockers.length) {
    return {
      system: 'SHEIKHA_360_REALITY_BRIDGE_V1',
      status: 'EVIDENCE_REQUIRED',
      blockers,
      executionAllowed: false,
    };
  }

  const evidence = normalized.map(({ observation }) => observation);
  const fidelity = assessRealityFidelity(evidence, input);
  const plan = {
    name,
    environment,
    purpose: String(input.purpose || '').trim() || 'OBSERVE_MODEL_COMPARE_AND_SUPPORT_DECISION',
    stages: [
      'CONSENT_AND_SCOPE',
      'MEASURED_OBSERVATION',
      'PROVENANCE_AND_QUALITY_CHECK',
      'DIGITAL_REPRESENTATION',
      'BOUNDED_SIMULATION',
      'REALITY_COMPARISON',
      'HUMAN_REVIEWED_ACTION',
      'OUTCOME_MEASUREMENT',
    ],
    observations: evidence,
    evidenceSha256: digest(evidence),
    fidelity,
  };
  return {
    system: 'SHEIKHA_360_REALITY_BRIDGE_V1',
    product: 'SHEIKHA_360',
    observedDomainLabel: 'SHEIKHA_AQTAR_OBSERVED_DOMAINS',
    status: 'REALITY_TWIN_PLAN_READY_NOT_CONNECTED',
    plan,
    executionAllowed: false,
    humanReviewRequiredBeforePhysicalAction: true,
    planSha256: digest(plan),
    boundaries: BOUNDARIES,
  };
}

function buildSheikha360Status() {
  return {
    system: 'SHEIKHA_360_REALITY_BRIDGE_V1',
    status: 'LOCAL_GOVERNED_PLANNING_ACTIVE_SENSOR_CONNECTION_NOT_ASSUMED',
    supportedEnvironments: ENVIRONMENTS,
    layers: ['REALITY', 'EVIDENCE', 'DIGITAL_TWIN', 'SIMULATION', 'DECISION', 'ACTION', 'VERIFICATION'],
    integration: ['SHEIKHA_VISUAL_FABRIC', 'SHEIKHA_GARDENS', 'SHEIKHA_LANGUAGE', 'SHEIKHA_LMM', 'SHEIKHA_CLOUD'],
    principle: 'OBSERVE_MODEL_CALCULATE_VERIFY_WITHOUT_CREATION_OR_UNSEEN_CLAIMS',
    fidelityLevels: FIDELITY_LEVELS,
    aqtarDefinition: 'DECLARED_MEASURABLE_PHYSICAL_DOMAINS_ONLY',
    creationStatement: 'ALLAH_IS_THE_CREATOR_SYSTEM_ONLY_OBSERVES_MODELS_CALCULATES_AND_SUPPORTS_ACTION',
    boundaries: BOUNDARIES,
  };
}

module.exports = { ENVIRONMENTS, FIDELITY_LEVELS, assessRealityFidelity, buildRealityTwin, buildSheikha360Status };
