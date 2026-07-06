'use strict';

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function evaluateLogicPlan(plan = {}) {
  const premises = normalizeList(plan.premises);
  const evidence = normalizeList(plan.evidence);
  const steps = normalizeList(plan.steps);
  const expectedOutcome = plan.expectedOutcome || null;

  const checks = {
    hasPremises: premises.length > 0,
    hasEvidence: evidence.length > 0,
    hasSteps: steps.length > 0,
    hasOutcome: Boolean(expectedOutcome),
    noContradiction: !normalizeList(plan.contradictions).length,
    noHarm: plan.noHarm !== false,
    quranSunnahAligned: plan.quranSunnahAligned !== false,
    humanReview: plan.humanReview !== false
  };

  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([id]) => id);

  return {
    system: 'SHEIKHA_LOGIC_GOVERNANCE_ENGINE_V1',
    status: failed.length ? 'REVIEW_REQUIRED' : 'LOGICAL_APPROVED',
    logical: failed.length === 0,
    score: Math.round(((Object.keys(checks).length - failed.length) / Object.keys(checks).length) * 100),
    checks,
    failed,
    method: {
      order: [
        'intention',
        'premises',
        'evidence',
        'quran-sunnah-alignment',
        'steps',
        'risk',
        'outcome',
        'human-review'
      ],
      principle: 'Truth, justice, no harm, no deception, measurable benefit.'
    }
  };
}

function buildLogicalActivationPlan(input = {}) {
  return {
    system: 'SHEIKHA_LOGICAL_ACTIVATION_PLAN_V1',
    title: input.title || 'Sheikha Logical Activation',
    premises: normalizeList(input.premises),
    evidence: normalizeList(input.evidence),
    steps: normalizeList(input.steps),
    expectedOutcome: input.expectedOutcome || 'Governed logical result',
    noHarm: input.noHarm !== false,
    quranSunnahAligned: input.quranSunnahAligned !== false,
    humanReview: input.humanReview !== false,
    contradictions: normalizeList(input.contradictions)
  };
}

module.exports = {
  evaluateLogicPlan,
  buildLogicalActivationPlan
};
