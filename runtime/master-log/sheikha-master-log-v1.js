'use strict';

const LOG_LIFECYCLE = Object.freeze([
  'capture',
  'classify',
  'govern',
  'store',
  'index',
  'analyze',
  'link-evidence',
  'audit',
  'report',
  'improve',
  'archive'
]);

const LOG_TYPES = Object.freeze([
  'runtime-event',
  'governance-decision',
  'security-event',
  'audit-event',
  'deployment-event',
  'test-result',
  'user-action',
  'system-health',
  'knowledge-update',
  'impact-measurement'
]);

const GOVERNANCE = Object.freeze({
  reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
  noClaimOfDivineAuthority: true,
  noClaimOfUnseenKnowledge: true,
  noReligiousFatwaAutomation: true,
  evidenceBeforeDecision: true,
  governanceBeforeAction: true,
  noSecretExposure: true,
  auditEverySensitiveEvent: true,
  retentionPolicyRequired: true,
  humanApprovalForHighRisk: true
});

function status() {
  return {
    system: 'SHEIKHA_MASTER_LOG_V1',
    status: 'ACTIVE',
    level: 'MASTER_EVIDENCE_LOG',
    above: 'SHEIKHA_MASTER_LIFE_CYCLE_V1',
    purpose: 'Unified governed logging, evidence, audit, and lifecycle registry for Sheikha.',
    lifecycle: LOG_LIFECYCLE,
    logTypes: LOG_TYPES,
    governance: GOVERNANCE
  };
}

function lifecycle() {
  return {
    system: 'SHEIKHA_MASTER_LOG_LIFECYCLE_V1',
    status: 'ACTIVE',
    stages: LOG_LIFECYCLE,
    rule: 'Every log must be classified, governed, auditable, and linkable to evidence.'
  };
}

function schema() {
  return {
    schema: 'SHEIKHA_MASTER_LOG_SCHEMA_V1',
    status: 'ACTIVE',
    fields: [
      'eventId',
      'timestamp',
      'source',
      'actor',
      'type',
      'severity',
      'scope',
      'message',
      'evidenceRef',
      'governanceRef',
      'correlationId',
      'retentionClass',
      'sensitive',
      'decision'
    ]
  };
}

function classify(input = {}) {
  const message = String(input.message || '').toLowerCase();
  const severity =
    /secret|token|key|password|breach|اختراق|سر|مفتاح/.test(message) ? 'HIGH'
    : /fail|error|risk|خطر|فشل/.test(message) ? 'MEDIUM'
    : 'LOW';

  const type =
    /govern|policy|حوكم|سياس/.test(message) ? 'governance-decision'
    : /deploy|release|نشر|إصدار/.test(message) ? 'deployment-event'
    : /test|lint|اختبار/.test(message) ? 'test-result'
    : /security|secret|token|أمن/.test(message) ? 'security-event'
    : 'runtime-event';

  return {
    engine: 'SHEIKHA_MASTER_LOG_CLASSIFIER_V1',
    status: 'ACTIVE',
    classification: {
      type,
      severity,
      sensitive: severity === 'HIGH',
      requiresHumanReview: severity === 'HIGH',
      retentionClass: severity === 'HIGH' ? 'restricted-audit' : 'standard-audit'
    }
  };
}

function aiStatus() {
  return {
    system: 'SHEIKHA_MASTER_LOG_AI_V1',
    status: 'ACTIVE',
    role: 'classification, summarization, anomaly hints, evidence linking, and audit assistance',
    boundaries: {
      noAutonomousFinalJudgment: true,
      noUnseenClaim: true,
      noSecretDisclosure: true,
      humanApprovalForHighRisk: true,
      recommendationsAreAdvisory: true
    },
    capabilities: [
      'classify-log',
      'summarize-events',
      'detect-anomaly-hints',
      'link-evidence',
      'suggest-governance-review',
      'generate-audit-summary'
    ]
  };
}

function analyze(input = {}) {
  const classification = classify(input).classification;
  return {
    engine: 'SHEIKHA_MASTER_LOG_AI_ANALYZER_V1',
    status: 'ACTIVE',
    inputSummary: String(input.message || '').slice(0, 240),
    classification,
    recommendation:
      classification.severity === 'HIGH'
        ? 'ESCALATE_TO_HUMAN_GOVERNANCE_REVIEW'
        : classification.severity === 'MEDIUM'
          ? 'REVIEW_AND_LINK_EVIDENCE'
          : 'STORE_AND_MONITOR',
    decision: 'ADVISORY_ONLY'
  };
}

module.exports = {
  status,
  lifecycle,
  schema,
  classify,
  aiStatus,
  analyze
};
