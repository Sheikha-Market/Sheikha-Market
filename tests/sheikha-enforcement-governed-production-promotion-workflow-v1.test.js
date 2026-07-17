'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const workflow = require(
  '../core/production-safety/sheikha-enforcement-governed-production-promotion-workflow-v1'
);

const CANDIDATE = 'a'.repeat(40);
const PAYLOAD = 'b'.repeat(64);
const SCOPE = ['package.json', 'tools/example.js'];
const CURRENT = '/opt/sheikha/releases/current';
const TARGET = '/opt/sheikha/releases/target';

function digest(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function approval(tempDir, overrides = {}) {
  const approvalRecordPath = path.join(tempDir, 'approval.json');
  const record = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_CONTROLLED_LOCAL_PRODUCTION_APPROVAL_RECORD_V1',
    approvalChannel: 'LOCAL_HUMAN_SESSION_ACKNOWLEDGEMENT',
    authority: 'HUMAN_ONLY',
    approverId: 'SALMAN_AHMED_SALMAN_AL_RAJEH',
    candidateMainHead: CANDIDATE,
    payloadSha256: PAYLOAD,
    scopePaths: workflow.normalizeScopePaths(SCOPE),
    approved: true,
    identityProofClaimed: false,
    rollbackRequired: true,
    packageInstallAllowed: false,
    cleanupAllowed: false,
    serviceRestartAllowed: false,
    targetRelease: TARGET,
    ...overrides
  };
  fs.writeFileSync(
    approvalRecordPath,
    `${JSON.stringify(record, null, 2)}\n`,
    'utf8'
  );
  return {
    approvalRecordPath,
    approvalRecordSha256: digest(approvalRecordPath)
  };
}

function input(record, overrides = {}) {
  return {
    source: 'LOCAL_CONTROLLED_WORKFLOW',
    candidateMainHead: CANDIDATE,
    payloadSha256: PAYLOAD,
    approvalRecordPath: record.approvalRecordPath,
    approvalRecordSha256: record.approvalRecordSha256,
    currentRelease: CURRENT,
    targetRelease: TARGET,
    scopePaths: SCOPE,
    baselineVerified: true,
    operationalAssuranceVerified: true,
    driftClassification: 'NO_OPERATIONAL_DRIFT',
    criticalFailedCheckCount: 0,
    currentStateHealthy: true,
    rollbackReady: true,
    packageInstallRequested: false,
    cleanupRequested: false,
    serviceRestartRequested: false,
    gateAssessment: {
      status: 'AWAITING_HUMAN_APPROVAL',
      admissionGranted: false,
      authority: 'HUMAN_ONLY',
      trustedHumanApproval: false
    },
    ...overrides
  };
}

describe('governed production promotion workflow V1', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'sheikha-workflow-test-')
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('status is ready and non-executing', () => {
    const current = workflow.status();
    expect(current.status).toBe('READY');
    expect(current.authority).toBe('HUMAN_ONLY');
    expect(current.executesCommands).toBe(false);
    expect(current.performsProductionMutation).toBe(false);
  });

  test('self verification passes', () => {
    expect(workflow.selfVerify().status).toBe('VERIFIED');
  });

  test('scope normalization is stable', () => {
    expect(
      workflow.normalizeScopePaths(['b', 'a', 'a', ' '])
    ).toEqual(['a', 'b']);
  });

  test('creates a governed promotion plan', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(input(record));
    expect(result.status).toBe('PROMOTION_PLAN_READY');
    expect(result.workflowAdmissionGranted).toBe(true);
    expect(result.promotionPlan.phases).toHaveLength(8);
  });

  test('plan never executes production', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(input(record));
    expect(result.commandsExecuted).toBe(false);
    expect(result.productionMutationPerformed).toBe(false);
    expect(result.requiresSeparateReviewedExecutor).toBe(true);
  });

  test('denies HTTP source', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(
      input(record, { source: 'HTTP' })
    );
    expect(result.failedChecks).toContain('LOCAL_SOURCE_REQUIRED');
  });

  test('denies external approval fields', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(
      input(record, { externalApproval: true })
    );
    expect(result.failedChecks).toContain(
      'EXTERNAL_APPROVAL_FIELDS_DENIED'
    );
  });

  test('denies approval digest mismatch', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(
      input(record, { approvalRecordSha256: 'c'.repeat(64) })
    );
    expect(result.status).toBe('SAFE_HOLD');
  });

  test('denies candidate mismatch', () => {
    const record = approval(tempDir, {
      candidateMainHead: 'd'.repeat(40)
    });
    expect(
      workflow.assessPromotionWorkflow(input(record)).status
    ).toBe('SAFE_HOLD');
  });

  test('denies operational drift', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(
      input(record, { driftClassification: 'DRIFT' })
    );
    expect(result.failedChecks).toContain(
      'NO_OPERATIONAL_DRIFT_REQUIRED'
    );
  });

  test('denies when rollback is not ready', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(
      input(record, { rollbackReady: false })
    );
    expect(result.failedChecks).toContain('ROLLBACK_READY_REQUIRED');
  });

  test('denies package installation request', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(
      input(record, { packageInstallRequested: true })
    );
    expect(result.failedChecks).toContain('PACKAGE_INSTALL_DENIED');
  });

  test('denies cleanup request', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(
      input(record, { cleanupRequested: true })
    );
    expect(result.failedChecks).toContain('CLEANUP_DENIED');
  });

  test('denies service restart request', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(
      input(record, { serviceRestartRequested: true })
    );
    expect(result.failedChecks).toContain('SERVICE_RESTART_DENIED');
  });

  test('denies invalid gate invariants', () => {
    const record = approval(tempDir);
    const result = workflow.assessPromotionWorkflow(
      input(record, {
        gateAssessment: {
          status: 'GRANTED',
          admissionGranted: true,
          authority: 'AUTOMATED',
          trustedHumanApproval: true
        }
      })
    );
    expect(result.failedChecks).toContain('GATE_INVARIANTS_FAILED');
  });
});
