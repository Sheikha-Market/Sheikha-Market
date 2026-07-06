'use strict';

const {
  buildGovernedFederationActivationGateReport,
  buildGovernedFederationActivationPlan,
  classifyActivationRisk,
  detectExternalMutationRequest,
  getGovernedFederationActivationGateStatus,
  writeScopes
} = require('../core/governed-federation-activation-gate/sheikha-governed-federation-activation-gate-v12');

describe('Sheikha Governed Federation Activation Gate V12', () => {
  test('approves safe internal federation activation plans only', () => {
    const plan = buildGovernedFederationActivationPlan({
      name: 'Safe PostgreSQL Federation',
      family: 'PostgreSQL Family',
      blueprint: 'PostgreSQL',
      version: '1.0.0'
    });

    expect(plan.system).toBe('SHEIKHA_GOVERNED_FEDERATION_ACTIVATION_GATE_V12');
    expect(plan.status).toBe('APPROVED_INTERNAL_PLAN');
    expect(plan.decision.approved).toBe(true);
    expect(plan.decision.writeScope).toBe(writeScopes.internalWrite);
    expect(plan.decision.externalChangeAllowed).toBe(false);
    expect(plan.artifacts.openapi).toBe('3.1.0');
    expect(plan.artifacts.sdkTargets).toContain('javascript');
    expect(plan.governance.noHarm).toBe(true);
  });

  test('blocks external mutation requests before expansion', () => {
    const blocked = buildGovernedFederationActivationPlan({
      name: 'Unsafe Linux Federation',
      family: 'Linux Family',
      blueprint: 'Linux',
      version: '1.0.0',
      serviceRestart: true,
      packageInstall: true
    });

    expect(blocked.status).toBe('BLOCKED_REVIEW');
    expect(blocked.risk.blockedFields).toEqual(expect.arrayContaining([
      'serviceRestart',
      'packageInstall'
    ]));
    expect(blocked.decision.writeScope).toBe(writeScopes.externalBlocked);
    expect(blocked.artifacts.canonicalPackageId).toBeNull();
    expect(blocked.governance.externalSystemWriteAllowed).toBe(false);
  });

  test('classifies high impact requests as human review without external mutation', () => {
    const risk = classifyActivationRisk({
      name: 'Production Probe',
      highImpact: true
    });

    expect(risk.level).toBe('CONTROLLED');
    expect(risk.writeScope).toBe(writeScopes.humanReview);
    expect(risk.requiresHumanReview).toBe(true);
    expect(detectExternalMutationRequest({ kernelMutation: true })).toEqual(['kernelMutation']);
  });

  test('reports active gate above template unification and V10 platform', () => {
    const report = buildGovernedFederationActivationGateReport();
    const status = getGovernedFederationActivationGateStatus();

    expect(report.status).toBe('ACTIVE');
    expect(report.linkedLayers.templateEngineUnificationV11).toBe('ACTIVE');
    expect(report.linkedLayers.governedPlatform).toBe('ACTIVE_100');
    expect(report.blockedProbe.status).toBe('BLOCKED_REVIEW');
    expect(status.status).toBe('ACTIVE');
    expect(status.externalMutationFields).toBeGreaterThanOrEqual(8);
  });
});
