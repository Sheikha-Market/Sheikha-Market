'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const enforcement = require(
  '../core/production-safety/sheikha-production-change-admission-enforcement-plane-v1'
);

const candidateMainHead =
  '8c3404d7a7c102fe3ff483e3b2fc53dc5e598412';

const payloadSha256 =
  'c5c1d3533f91e05ecf6a6130f6fdc6c3daa04ee5326596a92eef7be1c8a7a50c';

const scopePaths = [
  'server.js',
  'package.json'
];

const createFixture = overrides => {
  const directory =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        'sheikha-enforcement-test-'
      )
    );

  const record = {
    system:
      enforcement.APPROVAL_RECORD_SYSTEM,
    approvalChannel:
      enforcement.APPROVAL_CHANNEL,
    authority:
      enforcement.AUTHORITY,
    approverId:
      'SALMAN_AHMED_SALMAN_AL_RAJEH',
    candidateMainHead,
    payloadSha256,
    scopePaths,
    approved: true,
    identityProofClaimed: false,
    rollbackRequired: true,
    packageInstallAllowed: false,
    cleanupAllowed: false,
    ...overrides
  };

  const approvalRecordPath =
    path.join(
      directory,
      'approval.json'
    );

  fs.writeFileSync(
    approvalRecordPath,
    JSON.stringify(
      record,
      null,
      2
    ) + '\n',
    'utf8'
  );

  const expectedApprovalRecordSha256 =
    crypto
      .createHash('sha256')
      .update(
        fs.readFileSync(
          approvalRecordPath
        )
      )
      .digest('hex');

  return {
    directory,
    approvalRecordPath,
    expectedApprovalRecordSha256,
    record
  };
};

const baseRequest = () => ({
  source:
    'LOCAL_CONTROLLED_WORKFLOW',
  executionBoundary:
    enforcement.EXECUTION_BOUNDARY,
  candidateMainHead,
  payloadSha256,
  scopePaths,
  baselineVerified: true,
  operationalAssuranceVerified: true,
  driftClassification:
    'NO_OPERATIONAL_DRIFT',
  criticalFailedCheckCount: 0,
  currentStateHealthy: true,
  rollbackReady: true,
  packageInstallRequested: false,
  cleanupRequested: false
});

const gateAssessment = () => ({
  status:
    'AWAITING_HUMAN_APPROVAL',
  admissionGranted: false,
  authority: 'HUMAN_ONLY',
  trustedHumanApproval: false
});

const assess = ({
  request = baseRequest(),
  gate = gateAssessment(),
  recordOverrides,
  digestOverride
} = {}) => {
  const fixture =
    createFixture(
      recordOverrides
    );

  const result =
    enforcement
      .assessControlledPromotion({
        request,
        gateAssessment: gate,
        approvalRecordPath:
          fixture.approvalRecordPath,
        expectedApprovalRecordSha256:
          digestOverride
          || fixture
            .expectedApprovalRecordSha256
      });

  fs.rmSync(
    fixture.directory,
    {
      recursive: true,
      force: true
    }
  );

  return result;
};

describe(
  'Sheikha production change admission enforcement plane V1',
  () => {
    test(
      'status is active and non-executing',
      () => {
        expect(
          enforcement.status()
        ).toMatchObject({
          status: 'ACTIVE',
          authority: 'HUMAN_ONLY',
          failClosed: true,
          executesCommands: false,
          performsProductionMutation:
            false,
          acceptsHttpApproval: false
        });
      }
    );

    test(
      'self verification passes',
      () => {
        expect(
          enforcement.verify()
            .passed
        ).toBe(true);
      }
    );

    test(
      'scope normalization is stable',
      () => {
        expect(
          enforcement.normalizeScope([
            'server.js',
            ' package.json ',
            'server.js'
          ])
        ).toEqual([
          'package.json',
          'server.js'
        ]);
      }
    );

    test(
      'admits exact trusted local evidence',
      () => {
        const result = assess();

        expect(
          result.status
        ).toBe(
          'CONTROLLED_WORKFLOW_ADMITTED'
        );
        expect(
          result
            .controlledWorkflowAdmissionGranted
        ).toBe(true);
        expect(
          result
            .productionExecutionPerformed
        ).toBe(false);
      }
    );

    test(
      'denies external approval fields',
      () => {
        const result = assess({
          request: {
            ...baseRequest(),
            approved: true
          }
        });

        expect(
          result.status
        ).toBe('SAFE_HOLD');
        expect(
          result.externalApprovalFields
        ).toContain('approved');
      }
    );

    test(
      'denies HTTP source',
      () => {
        const result = assess({
          request: {
            ...baseRequest(),
            source: 'HTTP_REQUEST'
          }
        });

        expect(
          result
            .controlledWorkflowAdmissionGranted
        ).toBe(false);
        expect(
          result.failedChecks
        ).toContain('localSource');
      }
    );

    test(
      'denies approval digest mismatch',
      () => {
        const result = assess({
          digestOverride:
            '0'.repeat(64)
        });

        expect(
          result
            .controlledWorkflowAdmissionGranted
        ).toBe(false);
        expect(
          result.approvalRecord.reason
        ).toBe(
          'APPROVAL_RECORD_SHA256_MISMATCH'
        );
      }
    );

    test(
      'denies candidate mismatch',
      () => {
        const result = assess({
          recordOverrides: {
            candidateMainHead:
              '1'.repeat(40)
          }
        });

        expect(
          result
            .controlledWorkflowAdmissionGranted
        ).toBe(false);
        expect(
          result.approvalRecord
            .failedChecks
        ).toContain('candidate');
      }
    );

    test(
      'denies scope mismatch',
      () => {
        const result = assess({
          recordOverrides: {
            scopePaths: [
              'server.js'
            ]
          }
        });

        expect(
          result
            .controlledWorkflowAdmissionGranted
        ).toBe(false);
        expect(
          result.approvalRecord
            .failedChecks
        ).toContain('scope');
      }
    );

    test(
      'denies operational drift',
      () => {
        const result = assess({
          request: {
            ...baseRequest(),
            driftClassification:
              'RUNTIME_DRIFT'
          }
        });

        expect(
          result.failedChecks
        ).toContain(
          'noOperationalDrift'
        );
      }
    );

    test(
      'denies when rollback is not ready',
      () => {
        const result = assess({
          request: {
            ...baseRequest(),
            rollbackReady: false
          }
        });

        expect(
          result.failedChecks
        ).toContain('rollbackReady');
      }
    );

    test(
      'denies package installation request',
      () => {
        const result = assess({
          request: {
            ...baseRequest(),
            packageInstallRequested:
              true
          }
        });

        expect(
          result.failedChecks
        ).toContain(
          'noPackageInstall'
        );
      }
    );

    test(
      'denies cleanup request',
      () => {
        const result = assess({
          request: {
            ...baseRequest(),
            cleanupRequested: true
          }
        });

        expect(
          result.failedChecks
        ).toContain('noCleanup');
      }
    );

    test(
      'denies a gate that already granted',
      () => {
        const result = assess({
          gate: {
            ...gateAssessment(),
            admissionGranted: true
          }
        });

        expect(
          result.failedChecks
        ).toContain('gateDidNotGrant');
      }
    );

    test(
      'denies a non-human authority gate',
      () => {
        const result = assess({
          gate: {
            ...gateAssessment(),
            authority: 'AUTOMATED'
          }
        });

        expect(
          result.failedChecks
        ).toContain(
          'gateAuthorityHumanOnly'
        );
      }
    );
  }
);
