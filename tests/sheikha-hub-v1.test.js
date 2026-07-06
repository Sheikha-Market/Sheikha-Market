'use strict';

const hub = require('../runtime/hub/sheikha-hub-v1');

describe('Sheikha Hub V1', () => {
  test('hub is active and governed', () => {
    const result = hub.status();
    expect(result.system).toBe('SHEIKHA_HUB_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.unifiedEntryPoint).toBe(true);
    expect(result.governance.noSecretExposure).toBe(true);
  });

  test('hub map exposes command center and master log center', () => {
    const result = hub.map();
    const ids = result.portals.map((p) => p.id);
    expect(ids).toContain('command-center');
    expect(ids).toContain('master-log-center');
  });

  test('portal router routes known portal', () => {
    const result = hub.portal({ portal: 'master-log-center' });
    expect(result.engine).toBe('SHEIKHA_HUB_PORTAL_ROUTER_V1');
    expect(result.portal).toBe('master-log-center');
  });

  test('readiness engine marks hub ready', () => {
    const result = hub.readiness({
      commandCenter: 1,
      masterLogCenter: 1,
      masterGraph: 1,
      institutionalMemory: 1,
      impact: 1,
      experience: 1,
      evidence: 1,
      governance: 1
    });

    expect(result.engine).toBe('SHEIKHA_HUB_READINESS_ENGINE_V1');
    expect(result.decision).toBe('HUB_READY');
  });
});
