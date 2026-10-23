'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-reviewer-assignment-recovery-reconciliation-v1.json'
);

const {
  inspectAssignmentDrift,
} = require('./sheikha-reviewer-assignment-audit-drift-guard-v1');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function latestRecord(records) {
  return Array.isArray(records) && records.length > 0
    ? records[records.length - 1]
    : null;
}

function buildExpectedActualDiff() {
  const config = readConfig();
  const drift = inspectAssignmentDrift();
  const registry = readJson(config.registrySource);
  const auditLedger = readJson(config.auditLedgerSource);
  const writePlans = readJson(config.writePlanSource);

  const latestAudit = latestRecord(auditLedger.records);
  const latestWritePlan = latestRecord(writePlans.records);

  const expected = {
    sha256: latestAudit?.postStateSha256 || null,
    recordCount: latestAudit?.postRecordCount ?? null,
    assignmentIds: latestAudit?.assignmentIds || [],
    sourceAuditId: latestAudit?.auditId || null,
  };

  const actual = {
    sha256: drift.currentState.sha256,
    recordCount: drift.currentState.recordCount,
    assignmentIds: drift.currentState.assignmentIds,
  };

  const addedAssignmentIds = actual.assignmentIds.filter(
    (id) => !expected.assignmentIds.includes(id)
  );
  const missingAssignmentIds = expected.assignmentIds.filter(
    (id) => !actual.assignmentIds.includes(id)
  );

  return {
    expected,
    actual,
    diff: {
      hashChanged: expected.sha256 !== actual.sha256,
      recordCountChanged:
        expected.recordCount !== actual.recordCount,
      addedAssignmentIds,
      missingAssignmentIds,
    },
    provenanceHints: {
      latestAuditId: latestAudit?.auditId || null,
      latestWritePlanId:
        latestWritePlan?.planId ||
        latestWritePlan?.auditEnvelope?.patchChecksum ||
        null,
      latestWritePlanPresent: Boolean(latestWritePlan),
      registryStatus: registry.status,
    },
  };
}

function buildRecoveryPlan() {
  const config = readConfig();
  const drift = inspectAssignmentDrift();
  const comparison = buildExpectedActualDiff();

  const driftDetected =
    drift.status !== 'CLEAR' ||
    drift.summary.driftDetected > 0 ||
    drift.summary.auditChainBreaks > 0 ||
    drift.summary.auditEvidenceGaps > 0;

  const actions = [];

  if (driftDetected) {
    actions.push(
      'FREEZE_ASSIGNMENT_WRITES',
      'COLLECT_CHANGE_EVIDENCE',
      'COMPARE_EXPECTED_ACTUAL',
      'IDENTIFY_WRITE_PROVENANCE',
      'HUMAN_RECONCILIATION_REVIEW'
    );

    if (
      comparison.diff.hashChanged ||
      comparison.diff.recordCountChanged ||
      comparison.diff.addedAssignmentIds.length > 0 ||
      comparison.diff.missingAssignmentIds.length > 0
    ) {
      actions.push(
        'RESTORE_EXPECTED_STATE_MANUALLY',
        'ACCEPT_ACTUAL_AS_NEW_BASELINE_MANUALLY'
      );
    }
  }

  const status = driftDetected
    ? 'RECONCILIATION_REQUIRED'
    : 'CLEAR';

  return {
    system: config.system,
    version: config.version,
    status,
    mode: config.mode,
    governance: config.governance,
    summary: {
      driftDetected: driftDetected ? 1 : 0,
      proposedActions: actions.length,
      addedAssignmentIds:
        comparison.diff.addedAssignmentIds.length,
      missingAssignmentIds:
        comparison.diff.missingAssignmentIds.length,
      automaticRepairsPerformed: 0,
      automaticRollbacksPerformed: 0,
      baselineRefreshesPerformed: 0,
    },
    comparison,
    plan: {
      actions,
      selectedAction: null,
      executionAuthorized: false,
      humanDecisionRequired: true,
    },
    truth: {
      planOnly: true,
      noAutomaticRollback: true,
      noAutomaticRepair: true,
      noAutomaticBaselineRefresh: true,
      noAssignmentMutation: true,
    },
  };
}

function inspectRecoveryReadiness() {
  const result = buildRecoveryPlan();

  return {
    ...result,
    inspection: {
      readOnly: true,
      repairPerformed: false,
      rollbackPerformed: false,
      baselineRefreshPerformed: false,
      assignmentMutationPerformed: false,
    },
  };
}

module.exports = {
  buildExpectedActualDiff,
  buildRecoveryPlan,
  inspectRecoveryReadiness,
};
