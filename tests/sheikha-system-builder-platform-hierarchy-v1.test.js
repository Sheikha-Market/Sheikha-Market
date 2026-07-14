'use strict';

const {
  getSystemBuilderPlatformStatus,
} = require(
  '../tools/system-builder-fabric/' +
  'sheikha-system-builder-platform-hierarchy-v1'
);

describe('Sheikha System Builder Platform Hierarchy V1', () => {
  test('system builder platform is the foundation', () => {
    const status = getSystemBuilderPlatformStatus();

    expect(status.foundation.role).toBe(
      'PRIMARY_SYSTEM_AND_SYSTEM_BUILDING_FOUNDATION'
    );

    expect(status.coreFabric.required).toBe(true);
  });

  test('website is the primary product surface, not the foundation', () => {
    const status = getSystemBuilderPlatformStatus();

    expect(status.productSurface.isFoundation).toBe(false);

    expect(
      status.productSurface.isPrimaryProductSurface
    ).toBe(true);

    expect(
      status.productSurface.requiredForCoreFabricExecution
    ).toBe(false);
  });

  test('VS Code and Codex are optional tools', () => {
    const status = getSystemBuilderPlatformStatus();

    expect(
      status.optionalAdapters.vscode.requiredForProduction
    ).toBe(false);

    expect(
      status.optionalAdapters.vscode
        .requiredForSystemBuilderRuntime
    ).toBe(false);

    expect(
      status.optionalAdapters.codex.requiredForProduction
    ).toBe(false);

    expect(
      status.optionalAdapters.codex
        .requiredForSystemBuilderRuntime
    ).toBe(false);
  });

  test('system-building lifecycle is governed and complete', () => {
    const status = getSystemBuilderPlatformStatus();

    expect(
      status.systemBuildingLifecycle.length
    ).toBeGreaterThanOrEqual(10);

    expect(
      status.governance.defaultExecutionAuthorization
    ).toBe('DENY');

    expect(status.failedChecks).toEqual([]);
    expect(status.passed).toBe(true);
  });
});
