'use strict';

const {
  buildProductionIntegrationConnectionFabric
} = require('../core/production-integration-connection-fabric/sheikha-production-integration-connection-fabric-v1');

describe('Sheikha Production Integration Connection Fabric V1', () => {
  test('starts controlled production integration safely across kernel and OS family layers', () => {
    const report = buildProductionIntegrationConnectionFabric();

    expect(report.system).toBe('SHEIKHA_PRODUCTION_INTEGRATION_CONNECTION_FABRIC_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.mode).toBe('READ_ONLY_PRODUCTION_INTEGRATION_AND_CONNECTION_GATE');
    expect(report.productionStart.started).toBe(true);
    expect(report.productionStart.externalConnectionsOpened).toBe(false);
    expect(report.productionStart.servicesRestarted).toBe(false);
    expect(report.productionStart.packagesInstalled).toBe(false);
    expect(report.productionStart.productionRuntimeClaim).toBe(false);
    expect(report.safety.noHarm).toBe(true);
    expect(report.safety.humanApprovalRequiredForHighImpactAction).toBe(true);
    expect(report.layers.map((layer) => layer.id)).toEqual(expect.arrayContaining([
      'kernel-fabric',
      'kernel-stack-fabric',
      'kernel-industrial-fabric',
      'universal-os-kernel-federation',
      'os-family-industrial-federation',
      'admission-ownership-governance',
      'enterprise-inspector-readiness'
    ]));
    expect(report.connections.length).toBeGreaterThanOrEqual(7);
    expect(report.gates.noProductionClaimWithoutEvidence).toBe(true);
    expect(report.gates.humanApprovalRequiredForProductionAction).toBe(true);
    expect(report.decision).toBe('READY_FOR_CONTROLLED_PRODUCTION_INTEGRATION');
  });

  test('keeps modeled families truthful until evidence is provided', () => {
    const report = buildProductionIntegrationConnectionFabric();
    const byId = Object.fromEntries(
      report.families.map((family) => [family.id, family])
    );

    expect(byId['linux-industrial-family'].readiness.level).toBe('HOST_DETECTED');
    expect(byId['container-industrial-family'].readiness.level).toBe('READY_FOR_READ_ONLY_PROBE');
    expect(byId['windows-industrial-family'].readiness.level).toBe('MODELED_ONLY');
    expect(byId['apple-industrial-family'].readiness.productionClaim).toBe(false);
    expect(byId['virtualization-industrial-family'].readiness.productionClaim).toBe(false);
  });
});
