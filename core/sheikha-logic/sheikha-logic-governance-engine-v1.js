'use strict';

const crypto = require('node:crypto');

const DECISION_STATUS = Object.freeze({
  VERIFIED: 'VERIFIED',
  INSUFFICIENT_EVIDENCE: 'INSUFFICIENT_EVIDENCE',
  CONTRADICTED: 'CONTRADICTED',
  HUMAN_REVIEW_REQUIRED: 'HUMAN_REVIEW_REQUIRED',
  BLOCKED: 'BLOCKED'
});

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeEvidenceRecord(record, index) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return {
      id: `evidence-${index + 1}`,
      source: '',
      kind: 'UNSTRUCTURED',
      verified: false,
      supports: null,
      detail: String(record || '')
    };
  }

  return {
    id: String(record.id || '').trim(),
    source: String(record.source || '').trim(),
    kind: String(record.kind || 'LOCAL_EVIDENCE').trim().toUpperCase(),
    verified: record.verified === true,
    supports: typeof record.supports === 'boolean'
      ? record.supports
      : true,
    detail: String(record.detail || '').trim()
  };
}

function detectEvidenceContradictions(evidence = [], explicit = []) {
  const contradictions = normalizeList(explicit).map((entry) =>
    String(entry).trim()
  ).filter(Boolean);
  const byId = new Map();
  let verifiedSupport = false;
  let verifiedRejection = false;

  for (const record of evidence) {
    if (record.verified && record.supports === true) {
      verifiedSupport = true;
    }
    if (record.verified && record.supports === false) {
      verifiedRejection = true;
    }

    if (!record.id) continue;
    const previous = byId.get(record.id);
    if (previous && (
      previous.source !== record.source ||
      previous.verified !== record.verified ||
      previous.supports !== record.supports
    )) {
      contradictions.push(`conflicting-evidence-id:${record.id}`);
    }
    byId.set(record.id, record);
  }

  if (verifiedSupport && verifiedRejection) {
    contradictions.push('verified-support-and-rejection');
  }

  return [...new Set(contradictions)];
}

function digestEvidence(evidence) {
  const canonical = evidence.map((record) => ({
    id: record.id,
    source: record.source,
    kind: record.kind,
    verified: record.verified,
    supports: record.supports
  }));

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonical))
    .digest('hex');
}

function evaluateEvidenceDecision(input = {}) {
  const evidence = normalizeList(input.evidence)
    .map(normalizeEvidenceRecord);
  const contradictions = detectEvidenceContradictions(
    evidence,
    input.contradictions
  );
  const requiredEvidenceIds = normalizeList(input.requiredEvidenceIds)
    .map((id) => String(id).trim())
    .filter(Boolean);
  const evidenceById = new Map(evidence.map((record) => [record.id, record]));
  const missingEvidenceIds = requiredEvidenceIds.filter((id) => {
    const record = evidenceById.get(id);
    return !record || !record.verified || record.supports !== true;
  });
  const malformedEvidenceIds = evidence
    .filter((record) => !record.id || !record.source)
    .map((record, index) => record.id || `evidence-${index + 1}`);
  const verifiedEvidenceCount = evidence.filter((record) =>
    record.verified && record.supports === true
  ).length;
  const minimumEvidence = Math.max(1, Number(input.minimumEvidence) || 1);
  const highImpact = input.highImpact === true;
  const religiousRuling = input.domain === 'RELIGIOUS_RULING';
  const qualifiedHumanReview = input.qualifiedHumanReview === true;
  const noHarm = input.noHarm !== false;
  const proposition = String(input.proposition || '').trim();

  let status = DECISION_STATUS.VERIFIED;
  const blockers = [];

  if (!noHarm) {
    status = DECISION_STATUS.BLOCKED;
    blockers.push('no-harm-gate-failed');
  } else if (contradictions.length > 0) {
    status = DECISION_STATUS.CONTRADICTED;
    blockers.push(...contradictions);
  } else if (religiousRuling) {
    status = DECISION_STATUS.HUMAN_REVIEW_REQUIRED;
    blockers.push('automated-religious-ruling-denied');
  } else if (highImpact && !qualifiedHumanReview) {
    status = DECISION_STATUS.HUMAN_REVIEW_REQUIRED;
    blockers.push('high-impact-human-review-required');
  } else if (
    !proposition ||
    malformedEvidenceIds.length > 0 ||
    missingEvidenceIds.length > 0 ||
    verifiedEvidenceCount < minimumEvidence
  ) {
    status = DECISION_STATUS.INSUFFICIENT_EVIDENCE;
    if (!proposition) blockers.push('proposition-required');
    blockers.push(
      ...malformedEvidenceIds.map((id) => `malformed-evidence:${id}`),
      ...missingEvidenceIds.map((id) => `missing-evidence:${id}`)
    );
    if (verifiedEvidenceCount < minimumEvidence) {
      blockers.push(`minimum-verified-evidence:${minimumEvidence}`);
    }
  }

  const verified = status === DECISION_STATUS.VERIFIED;

  return {
    system: 'SHEIKHA_LOGIC_GOVERNANCE_ENGINE_V1',
    decisionId: String(input.id || 'anonymous-decision'),
    proposition,
    status,
    verified,
    authorization: verified ? 'ALLOW_BOUNDED' : 'DENY',
    evidence: {
      total: evidence.length,
      verified: verifiedEvidenceCount,
      required: requiredEvidenceIds,
      missing: missingEvidenceIds,
      malformed: malformedEvidenceIds,
      sha256: digestEvidence(evidence)
    },
    contradictions,
    blockers: [...new Set(blockers)],
    governance: {
      defaultAuthorization: 'DENY',
      noHarm,
      highImpact,
      qualifiedHumanReview,
      religiousRuling,
      automatedFatwa: false,
      religiousAuthorityClaim: false
    },
    trace: [
      'normalize-proposition',
      'validate-evidence-records',
      'verify-required-evidence',
      'detect-contradictions',
      'apply-no-harm-gate',
      'apply-human-review-gate',
      'issue-bounded-decision'
    ]
  };
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
  DECISION_STATUS,
  detectEvidenceContradictions,
  evaluateEvidenceDecision,
  evaluateLogicPlan,
  buildLogicalActivationPlan
};
