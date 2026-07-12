'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  MAIN_REPORT,
  collectMissingModules,
  sourceState
} = require('../distribution/pipeline/sheikha-linux-package-native-verification-v5');
const { sha256File } = require('../distribution/common/distribution-utils');

const ROOT = path.join(__dirname, '..');

describe('Sheikha Linux Package Native Verification V5', () => {
  test('extracts unique missing-module evidence from runtime output', () => {
    const output = [
      "Error: Cannot find module '../knowledge/a.json'",
      "Error: Cannot find module '../knowledge/a.json'",
      "Error: Cannot find module '../runtime/b.js'"
    ].join('\n');

    expect(collectMissingModules(output)).toEqual([
      '../knowledge/a.json',
      '../runtime/b.js'
    ]);
  });

  test('fingerprints only the package-runtime repair scope', () => {
    const source = sourceState();

    expect(source.head).toMatch(/^[a-f0-9]{40}$/u);
    expect(source.fingerprint).toMatch(/^[a-f0-9]{20}$/u);
    expect(source.scopedDiffSha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(source.sourceFiles.map((item) => item.path)).toEqual([
      'server.js',
      'bin/sheikha',
      'distribution/common/source-staging-engine.js'
    ]);
    expect(source.unrelatedWorktreeChangesIncluded).toBe(false);
  });

  test('keeps native claims aligned with the evidence state', () => {
    const report = JSON.parse(fs.readFileSync(MAIN_REPORT, 'utf8'));

    expect(report).toMatchObject({
      system: 'SHEIKHA_LINUX_PACKAGE_NATIVE_VERIFICATION_V5',
      historicalIntegrity: { status: 'VERIFIED_UNMODIFIED' },
      restrictions: {
        sudoUsed: false,
        packagesInstalledOnHost: false,
        githubUsed: false,
        v2HistoricalArtifactsOverwritten: false
      },
      deb: {
        status: 'BLOCKED_NATIVE_DPKG_LIFECYCLE',
        nativeVerified: false,
        structuralInspection: {
          extractionPassed: true,
          cliHelpPassed: true,
          serverSyntaxPassed: true,
          rollbackVerified: true
        },
        nativePackageManagerLifecycle: {
          dpkgInstallExecuted: false,
          upgradeExecuted: false,
          uninstallExecuted: false,
          purgeExecuted: false
        }
      }
    });
    if (report.nativeLaunchExecuted) {
      expect(report.tar).toMatchObject({
        status: 'NATIVE_VERIFIED',
        checksumVerified: true,
        secretScanPassed: true,
        nativeVerified: true,
        cli: { cliVerified: true },
        run: {
          nativeLaunchVerified: true,
          healthPassed: true,
          runtimeReadinessPassed: true,
          cleanShutdownVerified: true,
          noRemainingProcesses: true,
          noRemainingPorts: true,
          loopbackOnly: true
        }
      });
    } else {
      expect(report).toMatchObject({
        status: 'CANDIDATE_BUILT_NATIVE_EXECUTION_PENDING_DEB_BLOCKED',
        nativeLaunchVerified: false,
        canonicalPromotionAllowed: false
      });
    }
  });

  test('verifies the candidate checksum and required bootstrap files', () => {
    const report = JSON.parse(fs.readFileSync(MAIN_REPORT, 'utf8'));
    const artifactPath = path.join(ROOT, report.candidate.artifact.path);
    const listing = spawnSync('tar', ['-tzf', artifactPath], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      timeout: 300000
    });
    const rootName = 'sheikha-1.0.51-linux-x86_64';
    const required = [
      'knowledge/quranic-atlas/sheikha-quranic-architectural-atlas.json',
      'knowledge/quranic-operating-system/sheikha-quranic-operating-system-atlas-omega-v1.json',
      'knowledge/unified-graph/sheikha-unified-graph-fabric-v1.json',
      'routes/pr-governance/status.routes.js',
      'routes/runtime/verification/status.routes.js',
      'runtime/distribution/v2/sheikha-universal-delivery-v2-status.js',
      'runtime/distribution/v3/sheikha-native-delivery-v3-status.js',
      'runtime/distribution/v3.1/sheikha-native-desktop-v31-status.js',
      'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json',
      'runtime/snapshots/sheikha-snapshot-engine.js',
      'sheikha-language/compiler/lexer.js',
      'tools/activation/sheikha-unified-apex-manifest-v1.json'
    ];

    expect(listing.status).toBe(0);
    expect(fs.statSync(artifactPath).size).toBe(report.candidate.artifact.bytes);
    expect(sha256File(artifactPath)).toBe(report.candidate.artifact.sha256);
    required.forEach((relative) => {
      expect(listing.stdout).toContain(`${rootName}/${relative}`);
    });
  });

  test('supports packaged CLI help and version flags', () => {
    const source = fs.readFileSync(path.join(ROOT, 'bin', 'sheikha'), 'utf8');

    expect(source).toContain("commands['--help'] = commands.help");
    expect(source).toContain("commands['--version'] = () => console.log(version)");
    expect(source).toContain("require('../package.json').version");
  });
});
