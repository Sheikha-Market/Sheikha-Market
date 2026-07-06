'use strict';

const {
  buildLivingFederationOperatingSystem,
  eventTypes,
  getLivingFederationOperatingSystemStatus,
  sdkTargets
} = require('../core/living-federation-operating-system/sheikha-living-federation-operating-system-v13');

describe('Sheikha Living Federation Operating System V13', () => {
  test('activates living federation runtime above knowledge graph and governed activation gate', () => {
    const report = buildLivingFederationOperatingSystem();

    expect(report.system).toBe('SHEIKHA_LIVING_FEDERATION_OPERATING_SYSTEM_V13');
    expect(report.status).toBe('ACTIVE_100');
    expect(report.linkedLayers.universalKnowledgeGraphV9).toBe('ACTIVE');
    expect(report.linkedLayers.governedActivationGateV12).toBe('APPROVED_INTERNAL_PLAN');
    expect(report.runtimeState.lifecycle.current).toBe('GOVERNED_READY');
    expect(report.health.status).toBe('HEALTHY');
    expect(report.evolutionEngine.status).toBe('ACTIVE');
  });

  test('builds event bus, dependency engine, marketplace, services, SDKs, and languages', () => {
    const report = buildLivingFederationOperatingSystem();

    expect(report.eventBus.events).toHaveLength(eventTypes.length);
    expect(report.eventBus.events.every((event) => event.noExternalMutation)).toBe(true);
    expect(report.dependencies.circularDetection.circular).toBe(false);
    expect(report.capabilityMarketplace.capabilities.length).toBeGreaterThan(0);
    expect(report.serviceRegistry.services.map((service) => service.type)).toEqual(expect.arrayContaining([
      'REST',
      'gRPC',
      'CLI',
      'SDK',
      'Event'
    ]));
    expect(report.sdkRegistry.sdks).toHaveLength(sdkTargets.length);
    expect(report.languageFederation.summary.families).toBeGreaterThanOrEqual(7);
  });

  test('keeps AI and enterprise federations truthful and governed', () => {
    const report = buildLivingFederationOperatingSystem();

    expect(report.aiFederation.claims.agiClaimed).toBe(false);
    expect(report.aiFederation.claims.asiClaimed).toBe(false);
    expect(report.aiFederation.claims.ghaybClaimed).toBe(false);
    expect(report.enterpriseFederation.organizations.every((item) => item.partnershipClaimed === false))
      .toBe(true);
    expect(report.governance.allGreatnessBelongsToAllah).toBe(true);
    expect(report.governance.noDivineAttributeClaims).toBe(true);
    expect(report.governance.noExternalMutation).toBe(true);
  });

  test('blocks unsafe external mutation requests through the activation gate', () => {
    const report = buildLivingFederationOperatingSystem({
      name: 'Unsafe Living Federation',
      family: 'Linux Family',
      blueprint: 'Linux',
      version: '1.0.0',
      serviceRestart: true
    });

    expect(report.status).toBe('REVIEW');
    expect(report.runtimeState.status).toBe('BLOCKED');
    expect(report.linkedLayers.governedActivationGateV12).toBe('BLOCKED_REVIEW');
    expect(report.governance.noServiceRestart).toBe(true);
  });

  test('exposes compact status for inspectors and routes', () => {
    const status = getLivingFederationOperatingSystemStatus();

    expect(status.system).toBe('SHEIKHA_LIVING_FEDERATION_OPERATING_SYSTEM_V13');
    expect(status.status).toBe('ACTIVE_100');
    expect(status.summary.sdkTargets).toBe(sdkTargets.length);
    expect(status.health.score).toBeGreaterThanOrEqual(90);
  });
});
