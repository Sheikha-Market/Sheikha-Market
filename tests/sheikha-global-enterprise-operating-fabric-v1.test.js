'use strict';

const {
  inspectGlobalEnterpriseOperatingFabric
} = require('../core/global-enterprise-operating-fabric/sheikha-global-enterprise-operating-fabric-v1');

describe('Sheikha Global Enterprise Operating Fabric V1', () => {
  test('closes the global operating fabric safely across all layers', () => {
    const report = inspectGlobalEnterpriseOperatingFabric();
    const layerIds = report.layers.map((layer) => layer.id);

    expect(report.system).toBe('SHEIKHA_GLOBAL_ENTERPRISE_OPERATING_FABRIC_V1');
    expect(report.mode).toBe('READ_ONLY_GLOBAL_ENTERPRISE_ARCHITECTURAL_CLOSURE');
    expect(report.safety.noHarm).toBe(true);
    expect(report.safety.noKernelModification).toBe(true);
    expect(report.safety.noBootModification).toBe(true);
    expect(report.safety.noFirmwareModification).toBe(true);
    expect(layerIds).toContain('l0-hardware-federation');
    expect(layerIds).toContain('l3-kernel-federation');
    expect(layerIds).toContain('l12-enterprise-federation');
    expect(report.relations.length).toBeGreaterThanOrEqual(12);
    expect(report.closure.architectureClosed).toBe(true);
    expect(report.closure.extensionModel).toBe('ADD_NEW_FAMILY_WITHOUT_REDESIGN');
    expect(report.closure.productionRuntimeClaim).toBe(false);
    expect(report.gates.productionIntegrationReady).toBe(true);
    expect(report.gates.noExternalConnectionOpened).toBe(true);
    expect(report.productionIntegration.decision).toBe('READY_FOR_CONTROLLED_PRODUCTION_INTEGRATION');
  });
});
