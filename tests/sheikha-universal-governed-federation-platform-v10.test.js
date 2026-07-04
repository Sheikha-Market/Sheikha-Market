'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  eventTypes,
  buildUniversalGovernedFederationPlatformV10,
  buildUniversalGovernedFederationPlatformStatus,
  writeUniversalRegistrySnapshot,
  readUniversalRegistrySnapshot
} = require('../core/universal-governed-federation-platform/sheikha-universal-governed-federation-platform-v10');

describe('Sheikha Universal Governed Federation Platform V10', () => {
  test('activates the universal governed platform above V8, V9, and architecture V3', () => {
    const report = buildUniversalGovernedFederationPlatformV10();

    expect(report.system).toBe('SHEIKHA_UNIVERSAL_GOVERNED_FEDERATION_PLATFORM_V10');
    expect(report.status).toBe('ACTIVE_100');
    expect(report.readiness.overall).toBe('UNIVERSAL_GOVERNED_PLATFORM_READY');
    expect(report.linkedLayers.federationTemplateEngineV8).toBe('ACTIVE');
    expect(report.linkedLayers.federationOperatingFabricV9).toBe('ACTIVE');
    expect(report.linkedLayers.enterpriseArchitectureOperatingIntegrationV3)
      .toBe('ACTIVE_100_INTEGRATED');
  });

  test('builds package manager, industrial fabric, registry, graph, event bus, inspector, and governance', () => {
    const report = buildUniversalGovernedFederationPlatformV10();

    expect(report.packageManager.status).toBe('ACTIVE');
    expect(report.industrialFabric.status).toBe('ACTIVE');
    expect(report.registry.status).toBe('ACTIVE');
    expect(report.graph.status).toBe('ACTIVE');
    expect(report.eventBus.status).toBe('ACTIVE');
    expect(report.inspector.status).toBe('PASSED');
    expect(report.governance.status).toBe('PASSED');
    expect(report.components.map((component) => component.name)).toEqual(expect.arrayContaining([
      'Federation Package Manager',
      'Universal Industrial Fabric',
      'Universal Registry',
      'Universal Graph',
      'Universal Event Bus',
      'Universal Inspector',
      'Universal Governance'
    ]));
  });

  test('keeps SDK generation descriptor-only and blocks external mutation by policy', () => {
    const report = buildUniversalGovernedFederationPlatformV10();

    expect(report.registry.sdks).toHaveLength(7);
    expect(report.registry.sdks.every((sdk) => sdk.writeScope === 'DESCRIPTOR_ONLY_NO_FILE_WRITE'))
      .toBe(true);
    expect(report.governance.boundaries.noExternalMutation).toBe(true);
    expect(report.governance.boundaries.noKernelModification).toBe(true);
    expect(report.governance.boundaries.noPackageInstall).toBe(true);
    expect(report.governance.boundaries.noServiceRestart).toBe(true);
  });

  test('publishes the required governed event types', () => {
    const report = buildUniversalGovernedFederationPlatformV10();
    const types = report.eventBus.events.map((event) => event.type);

    expect(types).toEqual(eventTypes);
    expect(types).toContain('GOVERNANCE_PASSED');
    expect(types).toContain('GRAPH_UPDATED');
    expect(report.eventBus.events.every((event) => event.noExternalMutation)).toBe(true);
  });

  test('builds a compact status for routes and inspectors', () => {
    const status = buildUniversalGovernedFederationPlatformStatus();

    expect(status.status).toBe('ACTIVE_100');
    expect(status.components).toBeGreaterThanOrEqual(7);
    expect(status.registry.federations).toBe(1);
    expect(status.registry.sdks).toBe(7);
    expect(status.events).toBe(eventTypes.length);
    expect(status.governance).toBe('PASSED');
  });

  test('writes and reads an internal persistent registry snapshot', () => {
    const report = buildUniversalGovernedFederationPlatformV10();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-v10-'));
    const filePath = path.join(dir, 'registry.json');
    const write = writeUniversalRegistrySnapshot(report, { filePath });
    const read = readUniversalRegistrySnapshot(filePath);

    expect(write.status).toBe('WRITTEN');
    expect(write.noExternalMutation).toBe(true);
    expect(read.system).toBe('SHEIKHA_UNIVERSAL_REGISTRY_V10');
    expect(read.federations).toHaveLength(1);
    expect(read.writeScope).toBe('SHEIKHA_INTERNAL_RUNTIME_REGISTRY_ONLY');
  });
});
