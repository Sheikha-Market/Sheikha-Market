'use strict';

const {
  getContinuityStatus
} = require(
  '../tools/continuity/' +
    'sheikha-provider-independent-continuity-v2'
);

describe('Sheikha Provider Independent Continuity V2', () => {
  test('continuity is active and verified', () => {
    const status = getContinuityStatus();

    expect(status.status).toBe('ACTIVE');
    expect(status.failedChecks).toEqual([]);
    expect(status.passed).toBe(true);
  });

  test('GitHub is optional and not required', () => {
    const status = getContinuityStatus();

    expect(
      status.externalProviders.github.required
    ).toBe(false);

    expect(
      status.runtimeDependencies
        .githubAuthenticationRequired
    ).toBe(false);

    expect(
      status.runtimeDependencies
        .externalGitProviderRequired
    ).toBe(false);
  });

  test('compiler and system builder support offline operation', () => {
    const status = getContinuityStatus();

    expect(
      status.runtimeDependencies
        .networkRequiredForCompiler
    ).toBe(false);

    expect(
      status.runtimeDependencies
        .networkRequiredForSystemBuilder
    ).toBe(false);

    expect(
      status.runtimeDependencies
        .networkRequiredForLocalRecovery
    ).toBe(false);
  });

  test('both local registries are present', () => {
    const status = getContinuityStatus();

    expect(status.checks.primaryRegistry).toBe(true);

    expect(
      status.checks.disasterRecoveryRegistry
    ).toBe(true);
  });

  test('deployment remains governed', () => {
    const status = getContinuityStatus();

    expect(
      status.deployment
        .automaticProductionDeployment
    ).toBe(false);

    expect(
      status.deployment.humanApprovalRequired
    ).toBe(true);

    expect(
      status.governance
        .defaultExecutionAuthorization
    ).toBe('DENY');

    expect(
      status.governance
        .defaultDeploymentAuthorization
    ).toBe('DENY');
  });
});
