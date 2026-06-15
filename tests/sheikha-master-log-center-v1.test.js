'use strict';

const center = require('../runtime/master-log-center/sheikha-master-log-center-v1');

describe('Sheikha Master Log Center V1', () => {
  test('master log center is active and governed', () => {
    const result = center.status();
    expect(result.system).toBe('SHEIKHA_MASTER_LOG_CENTER_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.above).toBe('SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1');
    expect(result.governance.readOnlyLogCenter).toBe(true);
    expect(result.governance.traceabilityRequired).toBe(true);
  });

  test('dashboard is active', () => {
    const result = center.dashboard();
    expect(result.dashboard).toBe('SHEIKHA_MASTER_LOG_CENTER_DASHBOARD_V1');
    expect(result.capabilities).toContain('prepare-audit-package');
  });

  test('search engine is active', () => {
    const result = center.search({
      query: 'security token review',
      severity: 'HIGH'
    });

    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_CENTER_SEARCH_ENGINE_V1');
    expect(result.decision).toBe('SEARCH_PLAN_READY');
  });

  test('correlation engine is active', () => {
    const result = center.correlate({
      correlationId: 'corr-test',
      logs: ['log-1'],
      evidence: ['ev-1']
    });

    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_CENTER_CORRELATION_ENGINE_V1');
    expect(result.links.evidence).toContain('ev-1');
  });

  test('sensitive audit package requires human review', () => {
    const result = center.auditPackage({
      sensitive: true,
      logs: ['log-1'],
      evidence: ['ev-1']
    });

    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_CENTER_AUDIT_PACKAGE_ENGINE_V1');
    expect(result.governance.decision).toBe('HUMAN_REVIEW_REQUIRED');
  });

  test('trace engine is active', () => {
    const result = center.trace({ startLogId: 'log-1' });
    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_CENTER_TRACE_ENGINE_V1');
    expect(result.tracePlan).toContain('master-graph');
  });
});
