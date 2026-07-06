'use strict';

const masterLog = require('../master-log/sheikha-master-log-v1');
const inspector = require('../../core/enterprise/sheikha-enterprise-inspector-v3');

function status() {
  return {
    system: 'SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1',
    status: 'ACTIVE',
    above: ['SHEIKHA_MASTER_LOG_V1', 'SHEIKHA_ENTERPRISE_INSPECTOR_V3'],
    purpose: 'Governed bridge between Master Log evidence lifecycle and Enterprise Inspector diagnostics.',
    lifecycle: [
      'inspect',
      'classify',
      'govern',
      'link-evidence',
      'escalate-if-high-risk',
      'audit',
      'improve'
    ],
    boundaries: {
      governanceBeforeAction: true,
      evidenceBeforeDecision: true,
      noSecretExposure: true,
      advisoryOnlyForAI: true,
      humanApprovalForHighRisk: true,
      noAutonomousFinalJudgment: true
    }
  };
}

function inspectEvent(input = {}) {
  const message = String(input.message || '');
  const classification = masterLog.classify({ message });

  return {
    engine: 'SHEIKHA_MASTER_LOG_INSPECTOR_ENGINE_V1',
    status: 'ACTIVE',
    inspectorAvailable: Boolean(inspector),
    inputSummary: message.slice(0, 240),
    classification,
    evidence: {
      evidenceRequired: true,
      evidenceRef: input.evidenceRef || null,
      correlationId: input.correlationId || 'pending-correlation'
    },
    governance: {
      requiresHumanReview: classification.classification.requiresHumanReview,
      action:
        classification.classification.requiresHumanReview
          ? 'ESCALATE_TO_HUMAN_GOVERNANCE_REVIEW'
          : 'ALLOW_GOVERNED_OBSERVATION',
      decision: 'ADVISORY_ONLY'
    }
  };
}

function inspectorReport() {
  return {
    report: 'SHEIKHA_MASTER_LOG_INSPECTOR_REPORT_V1',
    status: 'ACTIVE',
    sections: [
      'runtime-events',
      'security-events',
      'governance-decisions',
      'audit-events',
      'deployment-events',
      'test-results',
      'impact-measurements'
    ],
    output: 'governed-inspection-summary'
  };
}

module.exports = {
  status,
  inspectEvent,
  inspectorReport
};
