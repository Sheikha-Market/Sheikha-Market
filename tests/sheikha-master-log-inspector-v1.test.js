'use strict';

const integration = require('../runtime/master-log-inspector/sheikha-master-log-inspector-v1');

describe('Sheikha Master Log Inspector Integration V1', () => {
  test('integration is active and governed', () => {
    const result = integration.status();
    expect(result.system).toBe('SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.boundaries.evidenceBeforeDecision).toBe(true);
    expect(result.boundaries.noSecretExposure).toBe(true);
  });

  test('security event escalates to human review', () => {
    const result = integration.inspectEvent({
      message: 'API key token leak risk detected',
      correlationId: 'test-correlation'
    });

    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_INSPECTOR_ENGINE_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.action).toBe('ESCALATE_TO_HUMAN_GOVERNANCE_REVIEW');
    expect(result.governance.decision).toBe('ADVISORY_ONLY');
  });

  test('inspector report is active', () => {
    const result = integration.inspectorReport();
    expect(result.report).toBe('SHEIKHA_MASTER_LOG_INSPECTOR_REPORT_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.sections).toContain('security-events');
  });
});
