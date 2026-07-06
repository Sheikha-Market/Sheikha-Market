'use strict';

const {
  buildCommercialLaunchValidation,
  missingRequiredDomains
} = require('../core/commercial-launch-validation/sheikha-commercial-launch-validation-v1');

function launchEvidence(overrides = {}) {
  return {
    system: 'SHEIKHA_COMMERCIAL_LAUNCH_EVIDENCE_V1',
    backup: {
      database: { verified: true, artifactReference: 'secure-backup-ticket-1' },
      environment: { verified: true, artifactReference: 'secure-env-ticket-1' }
    },
    rollback: {
      rehearsal: {
        successful: true,
        tag: 'sheikha-v1-production-candidate',
        environment: 'staging'
      }
    },
    monitoring: {
      alerts: {
        enabled: true,
        owner: 'operations',
        channels: ['internal-ops']
      }
    },
    revenue: {
      paymentOrRevenuePath: { verified: true, mode: 'test', provider: 'manual-invoice' },
      billingFlow: { verified: true },
      contracts: { humanApproved: true, templateReference: 'contract-template-v1' }
    },
    customerLifecycle: {
      endToEndTest: {
        verified: true,
        stages: ['registration', 'contract', 'invoice', 'activation', 'support', 'renewal']
      }
    },
    support: {
      flow: {
        verified: true,
        owner: 'support',
        slaReference: 'support-sla-v1'
      }
    },
    governance: {
      noHarm: true,
      humanApprovalRequiredForCommercialLaunch: true,
      noSecretsInThisFile: true
    },
    ...overrides
  };
}

describe('Sheikha Commercial Launch Validation V1', () => {
  test('allows controlled commercial launch only with complete evidence', () => {
    const report = buildCommercialLaunchValidation({
      evidence: launchEvidence()
    });

    expect(report.system).toBe('SHEIKHA_COMMERCIAL_LAUNCH_VALIDATION_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH');
    expect(report.pending).toHaveLength(0);
    expect(report.readiness.commercialLaunchReady).toBe(true);
    expect(report.enterpriseOperatingPlatform.commercialLaunchReady).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('keeps launch gated when evidence is incomplete', () => {
    const evidence = launchEvidence({
      backup: {
        database: { verified: false },
        environment: { verified: false }
      },
      revenue: {
        paymentOrRevenuePath: { verified: false },
        billingFlow: { verified: false },
        contracts: { humanApproved: false }
      }
    });
    const report = buildCommercialLaunchValidation({ evidence });

    expect(report.status).toBe('PENDING_EVIDENCE');
    expect(report.decision).toBe('COMMERCIAL_LAUNCH_REMAINS_GATED');
    expect(report.pending.length).toBeGreaterThan(0);
    expect(report.readiness.commercialLaunchReady).toBe(false);
  });

  test('detects missing evidence domains', () => {
    expect(missingRequiredDomains({ backup: {} })).toContain('backup.database');
  });
});
