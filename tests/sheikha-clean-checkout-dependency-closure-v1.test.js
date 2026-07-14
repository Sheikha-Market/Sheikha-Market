'use strict';

const fs = require('node:fs');
const path = require('node:path');

const hierarchy = require(
  '../tools/system-builder-fabric/' +
    'sheikha-system-builder-platform-hierarchy-v1'
);

const liveRouter = require(
  '../routes/live-realtime-fabric/' +
    'sheikha-live-realtime-fabric-routes'
);

const ROOT = path.resolve(__dirname, '..');

describe('Sheikha Clean Checkout Dependency Closure V1', () => {
  test('system builder foundation contracts exist in repository', () => {
    const required = [
      'runtime/system-builder-fabric/v1/' +
        'sheikha-system-builder-fabric-v1.json',

      'runtime/system-builder-fabric/v1/' +
        'sheikha-system-builder-tool-registry-v1.json',

      'runtime/system-builder-fabric/v1/' +
        'sheikha-system-builder-capability-matrix-v1.json'
    ];

    for (const relative of required) {
      const file = path.join(ROOT, relative);

      expect(fs.existsSync(file)).toBe(true);
      expect(() => JSON.parse(
        fs.readFileSync(file, 'utf8')
      )).not.toThrow();
    }
  });

  test('system builder hierarchy passes without untracked files', () => {
    const status =
      hierarchy.getSystemBuilderPlatformStatus();

    expect(status.passed).toBe(true);

    expect(status.coreFabric.system).toBe(
      'SHEIKHA_SYSTEM_BUILDER_FABRIC_V1'
    );

    expect(
      status.governance.defaultExecutionAuthorization
    ).toBe('DENY');
  });

  test('live route exports deep streaming profile contract', () => {
    expect(liveRouter.__test).toBeDefined();

    expect(
      typeof liveRouter.__test
        .createDeepStreamingProfile
    ).toBe('function');
  });

  test('live policy and correction evidence are committed', () => {
    const files = [
      'runtime/live-realtime-fabric/v1/policy/' +
        'sheikha-live-routing-quality-and-latency-policy-v3.json',

      'runtime/live-realtime-fabric/v1/evidence/' +
        'sheikha-live-abort-controller-normalization-v1.json',

      'runtime/live-realtime-fabric/v1/evidence/' +
        'sheikha-live-fast-model-runtime-resume-v2.json'
    ];

    for (const relative of files) {
      const file = path.join(ROOT, relative);

      expect(fs.existsSync(file)).toBe(true);

      expect(() => JSON.parse(
        fs.readFileSync(file, 'utf8')
      )).not.toThrow();
    }
  });
});
