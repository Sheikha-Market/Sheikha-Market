'use strict';

const EVIDENCE_TYPES = Object.freeze([
  'log',
  'test-result',
  'audit-record',
  'governance-decision',
  'deployment-record',
  'security-event',
  'knowledge-asset',
  'impact-measurement'
]);

const GOVERNANCE = Object.freeze({
  reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
  evidenceBeforeDecision: true,
  governanceBeforeExecution: true,
  noSecretExposure: true,
  auditEverySensitiveEvidence: true,
  humanApprovalForHighRisk: true,
  noClaimOfUnseenKnowledge: true,
  noReligiousFatwaAutomation: true
});

function status() {
  return {
    system: 'SHEIKHA_EVIDENCE_REGISTRY_V1',
    status: 'ACTIVE',
    level: 'EVIDENCE_FOUNDATION',
    above: 'SHEIKHA_MASTER_LOG_V1',
    connectsTo: [
      'SHEIKHA_MASTER_LOG_V1',
      'SHEIKHA_DECISION_REGISTRY_V2',
      'SHEIKHA_AUDIT_LEDGER',
      'SHEIKHA_KNOWLEDGE_ENGINE_V2',
      'SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1'
    ],
    evidenceTypes: EVIDENCE_TYPES,
    governance: GOVERNANCE
  };
}

function schema() {
  return {
    schema: 'SHEIKHA_EVIDENCE_SCHEMA_V1',
    status: 'ACTIVE',
    fields: [
      'evidenceId',
      'timestamp',
      'source',
      'owner',
      'type',
      'classification',
      'sensitivity',
      'retentionClass',
      'message',
      'logRefs',
      'decisionRefs',
      'auditRefs',
      'knowledgeRefs',
      'impactRefs',
      'correlationId'
    ]
  };
}

function classify(input = {}) {
  const message = String(input.message || '').toLowerCase();
  const type = String(input.type || '').toLowerCase();

  const sensitive =
    message.includes('secret') ||
    message.includes('token') ||
    message.includes('api key') ||
    message.includes('password') ||
    type.includes('security');

  const highRisk =
    sensitive ||
    message.includes('leak') ||
    message.includes('breach') ||
    message.includes('critical') ||
    message.includes('production');

  return {
    engine: 'SHEIKHA_EVIDENCE_CLASSIFIER_V1',
    status: 'ACTIVE',
    classification: {
      type: EVIDENCE_TYPES.includes(type) ? type : 'log',
      sensitivity: sensitive ? 'restricted' : 'standard',
      risk: highRisk ? 'HIGH' : 'LOW',
      retentionClass: sensitive ? 'restricted-audit' : 'standard-audit',
      requiresHumanReview: highRisk
    }
  };
}

function createEvidence(input = {}) {
  const result = classify(input);
  const now = new Date().toISOString();

  return {
    registry: 'SHEIKHA_EVIDENCE_REGISTRY_V1',
    status: 'ACCEPTED_REFERENCE',
    evidence: {
      evidenceId: input.evidenceId || `ev-${Date.now()}`,
      timestamp: input.timestamp || now,
      source: input.source || 'sheikha-runtime',
      owner: input.owner || 'system',
      type: result.classification.type,
      message: String(input.message || '').slice(0, 500),
      classification: result.classification,
      refs: {
        logRefs: input.logRefs || [],
        decisionRefs: input.decisionRefs || [],
        auditRefs: input.auditRefs || [],
        knowledgeRefs: input.knowledgeRefs || [],
        impactRefs: input.impactRefs || []
      },
      correlationId: input.correlationId || 'pending-correlation'
    },
    governance: {
      evidenceBeforeDecision: true,
      noSecretExposure: true,
      requiresHumanReview: result.classification.requiresHumanReview,
      decision: result.classification.requiresHumanReview
        ? 'HUMAN_REVIEW_REQUIRED'
        : 'GOVERNED_ACCEPT'
    }
  };
}

function linkEvidence(input = {}) {
  return {
    engine: 'SHEIKHA_EVIDENCE_LINKER_V1',
    status: 'ACTIVE',
    evidenceId: input.evidenceId || 'pending-evidence',
    links: {
      logs: input.logs || [],
      decisions: input.decisions || [],
      audits: input.audits || [],
      knowledge: input.knowledge || [],
      impact: input.impact || []
    },
    rule: 'Evidence must remain traceable from event to decision to audit to impact.'
  };
}

module.exports = {
  status,
  schema,
  classify,
  createEvidence,
  linkEvidence
};
