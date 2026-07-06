'use strict';

const os = require('../runtime/enterprise-management-os/sheikha-enterprise-management-os-v1');

describe('Sheikha Enterprise Management OS V1', () => {
  test('enterprise management OS is active and governed', () => {
    const result = os.status();
    expect(result.system).toBe('SHEIKHA_ENTERPRISE_MANAGEMENT_OS_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.evidenceBeforeDecision).toBe(true);
    expect(result.governance.noAutonomousBindingDecision).toBe(true);
  });

  test('registry exposes enterprise objects', () => {
    const result = os.registry();
    expect(result.registry).toBe('SHEIKHA_ENTERPRISE_REGISTRY_V1');
    expect(result.objects).toContain('projects');
    expect(result.objects).toContain('assets');
    expect(result.objects).toContain('risks');
  });

  test('portfolio escalates high risk', () => {
    const result = os.portfolio({ projects: 5, highRisk: 2 });
    expect(result.engine).toBe('SHEIKHA_ENTERPRISE_PORTFOLIO_ENGINE_V1');
    expect(result.governance.decision).toBe('HUMAN_REVIEW_REQUIRED');
  });

  test('asset engine flags ungoverned assets', () => {
    const result = os.assets({ totalAssets: 10, ungovernedAssets: 1 });
    expect(result.engine).toBe('SHEIKHA_ENTERPRISE_ASSET_ENGINE_V1');
    expect(result.governance.decision).toBe('GOVERNANCE_REVIEW_REQUIRED');
  });

  test('executive digital twin escalates high risk score', () => {
    const result = os.executiveTwin({ riskScore: 80 });
    expect(result.engine).toBe('SHEIKHA_EXECUTIVE_DIGITAL_TWIN_V1');
    expect(result.decision).toBe('EXECUTIVE_REVIEW_REQUIRED');
  });

  test('AI advisory is advisory only', () => {
    const result = os.aiAdvisory({ request: 'prioritize projects' });
    expect(result.engine).toBe('SHEIKHA_ENTERPRISE_AI_ADVISORY_ENGINE_V1');
    expect(result.advisory.executionAllowed).toBe(false);
  });
});
