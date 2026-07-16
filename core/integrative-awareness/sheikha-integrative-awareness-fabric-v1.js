'use strict';

const SYSTEM_ID =
  'SHEIKHA_INTEGRATIVE_AWARENESS_FABRIC_V1';

const HUMAN_EXPERIENCE_SYSTEM =
  'SHEIKHA_HUMAN_EXPERIENCE_GRAPH_V1';

const CONTEXT_LENSES = Object.freeze([
  'HUMAN_EXPERIENCE',
  'DOMAIN_KNOWLEDGE',
  'TIME_AND_CALENDAR',
  'GEOGRAPHIC_CONTEXT',
  'ORGANIZATIONAL_CONTEXT',
  'OPERATIONAL_CONTEXT',
  'RISK_AND_SAFETY',
  'EVIDENCE_AND_TRACEABILITY'
]);

const GOVERNANCE_GATES = Object.freeze([
  'TRUTHFULNESS',
  'NO_HARM',
  'SHARIA_COMPLIANCE',
  'PRIVACY_AND_MINIMIZATION',
  'HUMAN_AUTHORITY',
  'HIGH_IMPACT_APPROVAL',
  'EVIDENCE_COMPLETENESS',
  'NO_FUTURE_PREDICTION_CLAIM'
]);

const TECHNICAL_BOUNDARIES = Object.freeze({
  literalConsciousnessClaim: false,
  humanSimulationClaim: false,
  agiOrAsiClaim: false,
  unseenKnowledgeClaim: false,
  futurePredictionClaim: false,
  independentHighImpactExecution: false,
  humanDecisionAuthority: true,
  recommendationOnly: true
});

function asText(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim();
}

function asList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asText(item))
    .filter(Boolean)
    .slice(0, 100);
}

function asBoolean(value, fallback = false) {
  return typeof value === 'boolean'
    ? value
    : fallback;
}

function status() {
  return {
    schemaVersion: '1.0.0',
    system: SYSTEM_ID,
    status: 'ACTIVE',
    mode: 'GOVERNED_CONTEXT_INTEGRATION_ONLY',
    humanExperienceDependency: HUMAN_EXPERIENCE_SYSTEM,
    contextLenses: CONTEXT_LENSES,
    governanceGates: GOVERNANCE_GATES,
    technicalBoundaries: TECHNICAL_BOUNDARIES,
    executionCapabilityExposed: false,
    externalMutationPerformed: false,
    productionDeploymentExecuted: false,
    cleanupAuthorized: false,
    retentionMode: 'DENY_BY_DEFAULT'
  };
}

function buildContextEnvelope(input = {}) {
  return {
    schemaVersion: '1.0.0',
    system: SYSTEM_ID,
    subject: {
      id: asText(input.subjectId, 'UNSPECIFIED_SUBJECT'),
      role: asText(input.subjectRole, 'UNSPECIFIED_ROLE'),
      humanDecisionAuthority: true
    },
    humanExperience: {
      types: asList(input.experienceTypes),
      observations: asList(input.observations),
      sourceSystem: HUMAN_EXPERIENCE_SYSTEM
    },
    domain: {
      name: asText(input.domain, 'GENERAL'),
      concepts: asList(input.domainConcepts)
    },
    temporal: {
      timestamp:
        asText(input.timestamp)
        || new Date().toISOString(),
      calendarContext:
        asText(input.calendarContext, 'UNSPECIFIED')
    },
    geographic: {
      region: asText(input.region, 'UNSPECIFIED'),
      locality: asText(input.locality, 'UNSPECIFIED')
    },
    organizational: {
      organization:
        asText(input.organization, 'UNSPECIFIED'),
      process:
        asText(input.process, 'UNSPECIFIED')
    },
    operational: {
      objective:
        asText(input.objective, 'UNSPECIFIED'),
      proposedAction:
        asText(input.proposedAction, 'NO_ACTION'),
      highImpact:
        asBoolean(input.highImpact, false)
    },
    risk: {
      harmful:
        asBoolean(input.harmful, false),
      privacyCompliant:
        asBoolean(input.privacyCompliant, true),
      shariaCompliant:
        asBoolean(input.shariaCompliant, true)
    },
    evidence: {
      references: asList(input.evidenceReferences),
      sourceVerified:
        asBoolean(input.sourceVerified, false)
    },
    claims: {
      falseClaim:
        asBoolean(input.falseClaim, false),
      literalConsciousnessClaim:
        asBoolean(input.literalConsciousnessClaim, false),
      humanSimulationClaim:
        asBoolean(input.humanSimulationClaim, false),
      agiOrAsiClaim:
        asBoolean(input.agiOrAsiClaim, false),
      unseenKnowledgeClaim:
        asBoolean(input.unseenKnowledgeClaim, false),
      futurePredictionClaim:
        asBoolean(input.futurePredictionClaim, false)
    },
    approvals: {
      humanApproved:
        asBoolean(input.humanApproved, false)
    }
  };
}

function evaluateGates(envelope) {
  return Object.freeze({
    TRUTHFULNESS:
      !envelope.claims.falseClaim
      && !envelope.claims.literalConsciousnessClaim
      && !envelope.claims.humanSimulationClaim
      && !envelope.claims.agiOrAsiClaim
      && !envelope.claims.unseenKnowledgeClaim,
    NO_HARM:
      !envelope.risk.harmful,
    SHARIA_COMPLIANCE:
      envelope.risk.shariaCompliant,
    PRIVACY_AND_MINIMIZATION:
      envelope.risk.privacyCompliant,
    HUMAN_AUTHORITY:
      envelope.subject.humanDecisionAuthority,
    HIGH_IMPACT_APPROVAL:
      !envelope.operational.highImpact
      || envelope.approvals.humanApproved,
    EVIDENCE_COMPLETENESS:
      envelope.evidence.sourceVerified
      && envelope.evidence.references.length > 0,
    NO_FUTURE_PREDICTION_CLAIM:
      !envelope.claims.futurePredictionClaim
  });
}

function assess(input = {}) {
  const envelope = buildContextEnvelope(input);
  const gates = evaluateGates(envelope);

  const blockingGates = [
    'TRUTHFULNESS',
    'NO_HARM',
    'SHARIA_COMPLIANCE',
    'PRIVACY_AND_MINIMIZATION',
    'HUMAN_AUTHORITY',
    'NO_FUTURE_PREDICTION_CLAIM'
  ].filter((gate) => gates[gate] !== true);

  const reviewGates = [
    'HIGH_IMPACT_APPROVAL',
    'EVIDENCE_COMPLETENESS'
  ].filter((gate) => gates[gate] !== true);

  let decision = 'READY_FOR_HUMAN_REVIEW';

  if (blockingGates.length > 0) {
    decision = 'BLOCKED_BY_GOVERNANCE';
  } else if (reviewGates.length > 0) {
    decision = 'REVIEW_REQUIRED';
  }

  return {
    schemaVersion: '1.0.0',
    system: SYSTEM_ID,
    envelope,
    gates,
    decision,
    blockingGates,
    reviewGates,
    recommendationOnly: true,
    executionAllowed: false,
    externalMutationPerformed: false,
    productionDeploymentExecuted: false
  };
}

function verify() {
  const safeAssessment = assess({
    subjectId: 'HUMAN_REVIEWER',
    domain: 'GENERAL',
    objective: 'VERIFY_CONTEXT_INTEGRATION',
    evidenceReferences: ['LOCAL_VERIFIED_EVIDENCE'],
    sourceVerified: true,
    shariaCompliant: true,
    privacyCompliant: true,
    harmful: false,
    highImpact: false
  });

  const highImpactAssessment = assess({
    subjectId: 'HUMAN_REVIEWER',
    domain: 'OPERATIONS',
    objective: 'VERIFY_APPROVAL_GATE',
    evidenceReferences: ['LOCAL_VERIFIED_EVIDENCE'],
    sourceVerified: true,
    shariaCompliant: true,
    privacyCompliant: true,
    harmful: false,
    highImpact: true,
    humanApproved: false
  });

  const checks = {
    systemActive:
      status().status === 'ACTIVE',
    humanExperienceDependencyRecorded:
      status().humanExperienceDependency
      === HUMAN_EXPERIENCE_SYSTEM,
    eightContextLenses:
      CONTEXT_LENSES.length === 8,
    eightGovernanceGates:
      GOVERNANCE_GATES.length === 8,
    safeAssessmentReady:
      safeAssessment.decision
      === 'READY_FOR_HUMAN_REVIEW',
    executionDisabled:
      safeAssessment.executionAllowed === false,
    highImpactRequiresApproval:
      highImpactAssessment.decision
      === 'REVIEW_REQUIRED',
    noExternalMutation:
      safeAssessment.externalMutationPerformed === false
  };

  return {
    schemaVersion: '1.0.0',
    system:
      'SHEIKHA_VERIFY_INTEGRATIVE_AWARENESS_FABRIC_V1',
    checks,
    passed:
      Object.values(checks).every(
        (value) => value === true
      )
  };
}

module.exports = Object.freeze({
  SYSTEM_ID,
  HUMAN_EXPERIENCE_SYSTEM,
  CONTEXT_LENSES,
  GOVERNANCE_GATES,
  TECHNICAL_BOUNDARIES,
  status,
  buildContextEnvelope,
  evaluateGates,
  assess,
  verify
});
