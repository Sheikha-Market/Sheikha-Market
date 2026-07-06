'use strict';

const masterLog = require('../runtime/master-log/sheikha-master-log-v1');

describe('Sheikha Master Log V1', () => {
  test('master log is active and governed', () => {
    const result = masterLog.status();
    expect(result.system).toBe('SHEIKHA_MASTER_LOG_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.noSecretExposure).toBe(true);
    expect(result.governance.evidenceBeforeDecision).toBe(true);
  });

  test('log lifecycle includes audit and improvement', () => {
    const result = masterLog.lifecycle();
    expect(result.stages).toContain('audit');
    expect(result.stages).toContain('improve');
    expect(result.stages).toContain('archive');
  });

  test('schema includes evidence and governance references', () => {
    const result = masterLog.schema();
    expect(result.fields).toContain('evidenceRef');
    expect(result.fields).toContain('governanceRef');
    expect(result.fields).toContain('correlationId');
  });

  test('classifier escalates sensitive logs', () => {
    const result = masterLog.classify({ message: 'API key token leak risk' });
    expect(result.classification.severity).toBe('HIGH');
    expect(result.classification.requiresHumanReview).toBe(true);
  });

  test('master log AI is advisory only', () => {
    const result = masterLog.analyze({ message: 'deployment test failed' });
    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_AI_ANALYZER_V1');
    expect(result.decision).toBe('ADVISORY_ONLY');
  });
});
