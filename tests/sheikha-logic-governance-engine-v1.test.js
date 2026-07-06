'use strict';

const {
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
});
