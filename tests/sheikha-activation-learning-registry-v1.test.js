'use strict';

const {
  registerActivationRecord,
  evaluateActivationLearning
} = require('../core/activation-learning/sheikha-activation-learning-registry');

describe('Sheikha Activation Learning Registry V1', () => {
  test('registers activation script result and evaluates learning registry', () => {
    const record = registerActivationRecord({
      script: 'activate-production-lock-suite-v1.sh',
      stage: 'PRODUCTION_LOCK',
      status: 'PASSED',
      logic: ['secret-scan', 'tests', 'lint', 'pm2-health'],
      result: { suitesPassed: 223, testsPassed: 655 }
    });

    expect(record.system).toBe('SHEIKHA_ACTIVATION_LEARNING_REGISTRY_V1');
    expect(record.governance.noSecretsStored).toBe(true);

    const evaluation = evaluateActivationLearning();
    expect(evaluation.records).toBeGreaterThanOrEqual(1);
    expect(evaluation.learningMode).toBe('AUDIT_BASED_MACHINE_IMPROVEMENT');
  });
});
