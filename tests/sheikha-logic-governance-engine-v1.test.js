'use strict';

const {
  DECISION_STATUS,
  evaluateEvidenceDecision,
  evaluateLogicPlan,
  buildLogicalActivationPlan
} = require('../core/sheikha-logic/sheikha-logic-governance-engine-v1');

describe('Sheikha Logic Governance Engine V1', () => {
  test('approves a complete logical governed plan', () => {
    const plan = buildLogicalActivationPlan({
      title: 'Production logical closure',
      premises: ['Runtime fixed', 'Secret scan passed', 'Tests passed'],
      evidence: ['health endpoint ok', 'pm2 online', 'lint passed'],
      steps: ['validate', 'lock', 'release', 'monitor'],
      expectedOutcome: 'Production-ready release candidate',
      quranSunnahAligned: true,
      noHarm: true,
      humanReview: true
    });

    const result = evaluateLogicPlan(plan);

    expect(result.system).toBe('SHEIKHA_LOGIC_GOVERNANCE_ENGINE_V1');
    expect(result.status).toBe('LOGICAL_APPROVED');
    expect(result.logical).toBe(true);
    expect(result.score).toBe(100);
  });

  test('requires review when logic is incomplete', () => {
    const result = evaluateLogicPlan({
      premises: [],
      evidence: [],
      steps: [],
      expectedOutcome: null
    });

    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.logical).toBe(false);
  });

  test('verifies a bounded decision from named local evidence', () => {
    const result = evaluateEvidenceDecision({
      id: 'uefi-foundation',
      proposition: 'The x86_64 UEFI foundation is verified in QEMU.',
      requiredEvidenceIds: ['phase-report', 'serial-log'],
      evidence: [
        {
          id: 'phase-report',
          source: 'runtime/bare-metal/v2/phase-report.json',
          verified: true,
          supports: true
        },
        {
          id: 'serial-log',
          source: 'runtime/bare-metal/v2/serial.log',
          verified: true,
          supports: true
        }
      ],
      noHarm: true
    });

    expect(result.status).toBe(DECISION_STATUS.VERIFIED);
    expect(result.authorization).toBe('ALLOW_BOUNDED');
    expect(result.evidence.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test('rejects contradictory evidence even when records are verified', () => {
    const result = evaluateEvidenceDecision({
      proposition: 'Physical boot is verified.',
      evidence: [
        {
          id: 'physical-positive',
          source: 'evidence/a.json',
          verified: true,
          supports: true
        },
        {
          id: 'physical-negative',
          source: 'evidence/b.json',
          verified: true,
          supports: false
        }
      ]
    });

    expect(result.status).toBe(DECISION_STATUS.CONTRADICTED);
    expect(result.authorization).toBe('DENY');
  });

  test('requires qualified human review for religious rulings', () => {
    const result = evaluateEvidenceDecision({
      proposition: 'A religious ruling should be issued.',
      domain: 'RELIGIOUS_RULING',
      evidence: [{
        id: 'reference',
        source: 'qualified-reference-register',
        verified: true,
        supports: true
      }]
    });

    expect(result.status).toBe(
      DECISION_STATUS.HUMAN_REVIEW_REQUIRED
    );
    expect(result.governance.automatedFatwa).toBe(false);
    expect(result.authorization).toBe('DENY');
  });
});
