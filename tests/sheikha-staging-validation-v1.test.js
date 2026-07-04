'use strict';

const {
  validateStaging
} = require('../core/staging-validation/sheikha-staging-validation-v1');

describe('Sheikha Staging Validation V1', () => {
  test('passes default required routes', () => {
    const report = validateStaging();

    expect(report.system).toBe('SHEIKHA_STAGING_VALIDATION_V1');
    expect(report.status).toBe('READY_FOR_STAGING_TEST');
    expect(report.passed).toBe(true);
  });

  test('blocks missing route path', () => {
    const report = validateStaging({
      routes: [{ id: 'broken', path: '', type: 'ui' }]
    });

    expect(report.status).toBe('BLOCKED');
    expect(report.passed).toBe(false);
  });
});
