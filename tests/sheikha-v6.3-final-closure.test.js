'use strict';

const closure = require(
  '../runtime/production-readiness/v6.3/sheikha-v6.3-final-closure.json'
);

describe('Sheikha V6.3 final closure', () => {
  test('closes the verified artifact without overclaiming platform production', () => {
    expect(closure.status).toBe(
      'RELEASE_ARTIFACT_CLOSED_PLATFORM_PRODUCTION_BLOCKED'
    );
    expect(closure.release.nativeLifecycleVerified).toBe(true);
    expect(closure.release.upgradeFromV62Verified).toBe(true);
    expect(closure.release.rollbackToV62Verified).toBe(true);
    expect(closure.backup.bundleVerified).toBe(true);
    expect(closure.backup.restoreTestVerified).toBe(true);
    expect(closure.security.productionAudit.high).toBe(14);
    expect(closure.security.productionSecurityGatePassed).toBe(false);
    expect(closure.platform.productionReady).toBe(false);
    expect(closure.quality.fullSuitePassed).toBe(false);
    expect(closure.defaultAuthorization).toBe('DENY');
  });
});
