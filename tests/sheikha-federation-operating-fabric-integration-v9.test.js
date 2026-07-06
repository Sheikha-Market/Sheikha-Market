'use strict';

const {
  buildFederationOperatingFabricIntegrationV9,
  buildFederationOperatingFabricStatus
} = require('../core/federation-operating-fabric-integration/sheikha-federation-operating-fabric-integration-v9');

describe('Sheikha Federation Operating Fabric Integration V9', () => {
  test('integrates architecture registry and federation engines into one governed fabric', () => {
    const report = buildFederationOperatingFabricIntegrationV9();

    expect(report.system).toBe('SHEIKHA_FEDERATION_OPERATING_FABRIC_INTEGRATION_V9');
    expect(report.status).toBe('ACTIVE');
    expect(report.readiness.overall).toBe('FEDERATION_OPERATING_FABRIC_INTEGRATED');
    expect(report.engines.map((engine) => engine.system)).toEqual(expect.arrayContaining([
      'SHEIKHA_ENTERPRISE_ARCHITECTURE_V2',
      'SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_V2',
      'SHEIKHA_FEDERATION_EXPANSION_ENGINE_V4',
      'SHEIKHA_UNIVERSAL_FEDERATION_ENGINE_V5',
      'SHEIKHA_META_FEDERATION_ORCHESTRATOR_V6',
      'SHEIKHA_FEDERATION_BLUEPRINT_ENGINE_V7',
      'SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8'
    ]));
  });

  test('exposes a complete operating map for activated layers', () => {
    const report = buildFederationOperatingFabricIntegrationV9();

    expect(report.operatingMap.architecture.layers).toBeGreaterThanOrEqual(24);
    expect(report.operatingMap.architecture.healthScore).toBe(100);
    expect(report.operatingMap.federation.relationshipTypes).toBeGreaterThanOrEqual(20);
    expect(report.operatingMap.federation.expansionStages).toBeGreaterThanOrEqual(10);
    expect(report.operatingMap.federation.templates).toBeGreaterThanOrEqual(10);
    expect(report.operatingMap.capability.capabilities).toBeGreaterThanOrEqual(10);
  });

  test('keeps developer outputs descriptor-only and internally governed', () => {
    const report = buildFederationOperatingFabricIntegrationV9();

    expect(report.package.status).toBe('COMMITTED');
    expect(report.package.openapi).toBe('3.1.0');
    expect(report.package.sdkTargets).toEqual(expect.arrayContaining([
      'javascript',
      'python',
      'go',
      'rust',
      'java',
      'php',
      'csharp'
    ]));
    expect(report.operatingMap.developerSurface.sdkDescriptorOnly).toBe(true);
    expect(report.package.writeScope).toBe('SHEIKHA_INTERNAL_PERSISTENT_REGISTRY_ONLY');
  });

  test('enforces no external mutation governance boundaries', () => {
    const report = buildFederationOperatingFabricIntegrationV9();

    expect(report.governance.internalRegistryWriteAllowed).toBe(true);
    expect(report.governance.externalSystemWriteAllowed).toBe(false);
    expect(report.governance.noKernelModification).toBe(true);
    expect(report.governance.noBootModification).toBe(true);
    expect(report.governance.noFirmwareModification).toBe(true);
    expect(report.governance.noPackageInstall).toBe(true);
    expect(report.governance.noServiceRestart).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('builds a compact status for routes and inspectors', () => {
    const status = buildFederationOperatingFabricStatus();

    expect(status.system).toBe('SHEIKHA_FEDERATION_OPERATING_FABRIC_INTEGRATION_V9');
    expect(status.status).toBe('ACTIVE');
    expect(status.layers.templates).toBeGreaterThanOrEqual(10);
    expect(status.governance.externalSystemWriteAllowed).toBe(false);
  });
});
