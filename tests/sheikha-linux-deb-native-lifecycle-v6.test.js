'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

describe('Sheikha Linux DEB Native Lifecycle V6', () => {
  test('records a fully verified dpkg lifecycle', () => {
    const report = readJson(
      'runtime/distribution/v6/' +
      'sheikha-linux-deb-native-lifecycle-v6-report.json'
    );

    expect(report.system).toBe(
      'SHEIKHA_LINUX_DEB_NATIVE_LIFECYCLE_V6'
    );

    expect(report.status).toBe(
      'DEB_NATIVE_LIFECYCLE_VERIFIED'
    );

    const required = [
      'baselineInstalled',
      'baselineLaunched',
      'upgradeExecuted',
      'upgradeVerified',
      'removeExecuted',
      'removeVerified',
      'purgeExecuted',
      'purgeVerified',
      'rollbackExecuted',
      'rollbackVerified',
      'healthVerified',
      'cliVerified',
      'cleanShutdownVerified',
      'noRemainingProcesses',
      'noRemainingPorts',
      'nativeVerified',
      'canonicalPromotionAllowed'
    ];

    for (const field of required) {
      expect(report[field]).toBe(true);
    }

    expect(report.externalNetworkUsed).toBe(false);
    expect(report.hostPackagesInstalled).toBe(false);
    expect(report.githubUsed).toBe(false);
  });

  test('promotes only the amd64 DEB target', () => {
    const status = readJson(
      'distribution/manifest/sheikha-target-status-v6.json'
    );

    expect(status.historicalMatrixUnmodified).toBe(true);
    expect(status.targetCount).toBe(27);

    expect(status.targets['linux-cli-x86_64']).toBe(
      'VERIFIED'
    );

    expect(status.targets['linux-tar-x86_64']).toBe(
      'VERIFIED'
    );

    expect(status.targets['linux-deb-amd64']).toBe(
      'VERIFIED'
    );

    expect(status.counts.verified).toBe(3);
    expect(status.counts.builtNotNativeVerified).toBe(0);
    expect(status.counts.remaining).toBe(24);
  });

  test('contains evidence from install through rollback', () => {
    const evidence = [
      'runtime/distribution/v6/evidence/environment-inspection.json',
      'runtime/distribution/v6/evidence/lifecycle-result.json',
      'runtime/distribution/v6/evidence/baseline-install.log',
      'runtime/distribution/v6/evidence/upgrade.log',
      'runtime/distribution/v6/evidence/remove.log',
      'runtime/distribution/v6/evidence/purge.log',
      'runtime/distribution/v6/evidence/rollback-downgrade.log',
      'runtime/distribution/v6/evidence/artifact-sha256.txt'
    ];

    for (const file of evidence) {
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    }
  });
});
