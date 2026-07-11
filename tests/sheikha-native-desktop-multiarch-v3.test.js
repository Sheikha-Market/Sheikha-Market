'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  ALLOWED_STATES,
  DECISION_PATH,
  RELEASE_ROOT,
  baselineV2Integrity,
  verifyReleaseTree
} = require('../distribution/pipeline/sheikha-native-delivery-v3');
const {
  createCapabilityBridge,
  createReadOnlyStatusAdapters
} = require('../desktop/bridge/sheikha-desktop-capability-bridge-v1');
const {
  createDesktopIntent,
  createDesktopProductCore
} = require('../desktop/core/sheikha-desktop-product-core-v1');
const {
  DesktopInstallerAdapterV1,
  PROFILES
} = require('../desktop/installer-contracts/sheikha-desktop-installer-adapter-v1');
const { createSheikhaApiClient } = require('../sdk/sheikha-api');

const ROOT = path.join(__dirname, '..');
const REPORT_ROOT = path.join(ROOT, 'runtime', 'distribution', 'v3');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function request(capability, extra = {}) {
  return {
    requestId: `test-${capability}`,
    requestedAt: '2026-01-01T00:00:00.000Z',
    capability,
    actor: { id: 'test-human', type: 'human' },
    payload: {},
    ...extra
  };
}

describe('Sheikha Native Desktop and Multi-Architecture Delivery V3', () => {
  test('records a measured desktop decision without inventing an executable shell', () => {
    const decision = readJson(DECISION_PATH);

    expect(decision.repositoryDiscovery).toMatchObject({
      executableDesktopRuntimeFound: false,
      electronImplemented: false,
      tauriImplemented: false,
      qtImplemented: false,
      gtkImplemented: false,
      nativeWebViewImplemented: false
    });
    expect(decision.selection).toMatchObject({
      selectedCandidate: 'TAURI_2',
      selectionType: 'ARCHITECTURE_CANDIDATE_NOT_INSTALLED',
      desktopExecutableBuilt: false,
      dependencyAdded: false,
      frameworkInstalled: false
    });
    expect(decision.candidates).toHaveLength(5);
    expect(decision.candidates.every((item) => item.measuredLocally === false)).toBe(true);
    expect(decision.candidates.every((item) => item.localArtifactBytes === null)).toBe(true);
  });

  test('executes a granted read through the governed capability bridge with evidence', async () => {
    const adapters = createReadOnlyStatusAdapters({
      runtimeStatus: () => ({ healthy: true }),
      releaseStatus: () => ({ version: '1.0.51' })
    });
    const core = createDesktopProductCore({ bridge: createCapabilityBridge({ adapters }) });
    const result = await core.dispatch(request('runtime.status.read'), {
      grantedCapabilities: ['runtime.status.read']
    });

    expect(result).toMatchObject({
      ok: true,
      status: 'SUCCEEDED',
      output: { healthy: true },
      decision: { permitted: true, aiCanAuthorize: false },
      evidence: { outcome: 'SUCCEEDED' }
    });
    expect(result.evidence.evidenceSha256).toMatch(/^[a-f0-9]{64}$/u);
  });

  test('blocks direct system control and AI-only approval before adapter execution', async () => {
    const bridge = createCapabilityBridge({
      adapters: {
        'installer.system.install': {
          id: 'test-system-installer',
          execute: jest.fn(async () => ({ installed: true }))
        }
      }
    });
    const direct = await bridge.execute(createDesktopIntent(request('shell.execute')), {
      grantedCapabilities: ['shell.execute']
    });
    const aiOnly = await bridge.execute(createDesktopIntent(request('installer.system.install', {
      aiApproval: true,
      payload: { administratorApproval: true }
    })), {
      grantedCapabilities: ['installer.system.install']
    });

    expect(direct).toMatchObject({
      ok: false,
      decision: { reason: 'DIRECT_SYSTEM_CONTROL_PROHIBITED' }
    });
    expect(aiOnly).toMatchObject({
      ok: false,
      decision: { reason: 'AI_CANNOT_AUTHORIZE_HIGH_IMPACT_ACTION' }
    });
  });

  test('requires human approval and a durable audit sink for high-impact execution', async () => {
    const execute = jest.fn(async () => ({ installed: true }));
    const intent = createDesktopIntent(request('installer.system.install', {
      payload: { administratorApproval: true },
      humanApproval: { approved: true, approvedBy: 'test-human', approvalId: 'approval-v3' }
    }));
    const withoutAudit = await createCapabilityBridge({
      adapters: { 'installer.system.install': { id: 'system-installer', execute } }
    }).execute(intent, { grantedCapabilities: ['installer.system.install'] });
    expect(withoutAudit.decision.reason).toBe('DURABLE_AUDIT_SINK_REQUIRED_FOR_HIGH_IMPACT_ACTION');
    expect(execute).not.toHaveBeenCalled();

    const audit = [];
    const withAudit = await createCapabilityBridge({
      adapters: { 'installer.system.install': { id: 'system-installer', execute } },
      auditSink: async (evidence) => audit.push(evidence)
    }).execute(intent, { grantedCapabilities: ['installer.system.install'] });
    expect(withAudit).toMatchObject({ ok: true, status: 'SUCCEEDED' });
    expect(execute).toHaveBeenCalledTimes(1);
    expect(audit.map((item) => item.outcome)).toEqual(['AUTHORIZED', 'SUCCEEDED']);
  });

  test('uses one installer adapter with distinct user and system profiles', () => {
    const user = new DesktopInstallerAdapterV1({ profile: 'user' });
    const system = new DesktopInstallerAdapterV1({ profile: 'system' });

    expect(user).toBeInstanceOf(DesktopInstallerAdapterV1);
    expect(system).toBeInstanceOf(DesktopInstallerAdapterV1);
    expect(PROFILES.user).toMatchObject({ installationScope: 'current-user', administratorRequired: false });
    expect(PROFILES.system).toMatchObject({ installationScope: 'machine-wide', administratorRequired: true });
    expect(() => new DesktopInstallerAdapterV1({ profile: 'unknown' })).toThrow();
  });

  test('defines seven complete native runner lifecycle contracts', () => {
    const files = [
      'distribution/native-runners/windows/x64-runner-contract.json',
      'distribution/native-runners/windows/arm64-runner-contract.json',
      'distribution/native-runners/macos/intel-runner-contract.json',
      'distribution/native-runners/macos/apple-silicon-runner-contract.json',
      'distribution/native-runners/linux/x86_64-runner-contract.json',
      'distribution/native-runners/linux/arm64-runner-contract.json',
      'distribution/native-runners/linux/armv7-runner-contract.json'
    ];
    const expectedStages = [
      'build', 'install', 'launch', 'health', 'version', 'upgrade', 'uninstall',
      'rollback', 'logs', 'evidence', 'cleanup'
    ];

    expect(files.every((file) => fs.existsSync(path.join(ROOT, file)))).toBe(true);
    for (const file of files) {
      const contract = readJson(path.join(ROOT, file));
      expect(contract.contractDefined).toBe(true);
      expect(contract.runnerImplementedByThisContract).toBe(false);
      expect(Object.keys(contract.lifecycle)).toEqual(expectedStages);
      expect(Object.values(contract.lifecycle).every((stage) => stage.structuredArgvOnly === true)).toBe(true);
    }
  });

  test('reports all five products across three Linux architectures with required evidence fields', () => {
    const report = readJson(path.join(REPORT_ROOT, 'sheikha-cross-architecture-eligibility-v3.json'));
    const required = [
      'sourcePortable', 'dependenciesPortable', 'nativeModulesDetected', 'compilerAvailable',
      'linkerAvailable', 'runtimeAvailable', 'artifactBuilt', 'architectureInspected',
      'nativeTested', 'blockers'
    ];

    expect(report).toMatchObject({ productCount: 5, architectureCount: 3, eligibilityRecordCount: 15 });
    expect(report.entries.every((entry) => ALLOWED_STATES.includes(entry.status))).toBe(true);
    expect(report.entries.every((entry) => required.every((field) => Object.hasOwn(entry, field)))).toBe(true);
    expect(report.entries.find((entry) => entry.id === 'sheikha-cli-x86_64').status).toBe('NATIVE_VERIFIED');
    expect(report.entries.find((entry) => entry.id === 'sheikha-desktop-x86_64').status).toBe('TOOLCHAIN_MISSING');
    expect(report.entries.find((entry) => entry.id === 'sheikha-bare-metal-seed-aarch64'))
      .toMatchObject({ status: 'TOOLCHAIN_MISSING', sourcePortable: false, artifactBuilt: false });
  });

  test('preserves the immutable V2 baseline and artifact hashes', () => {
    const integrity = baselineV2Integrity();

    expect(integrity.status).toBe('V2_BASELINE_VERIFIED_UNMODIFIED');
    expect(integrity.artifactCount).toBe(6);
    expect(integrity.workspaceArtifacts.every((item) => item.valid)).toBe(true);
    expect(integrity.workspaceAndLocalArtifactSetMatch).toBe(true);
    expect(integrity.v2ModifiedPaths).toEqual([]);
  });

  test('contains one real inspected Product Core archive and no fabricated native installer', () => {
    const verification = verifyReleaseTree(RELEASE_ROOT);

    expect(verification.valid).toBe(true);
    expect(verification.artifactCount).toBe(1);
    expect(verification.inheritedArtifactCount).toBe(6);
    expect(verification.index.desktopExecutableArtifactCount).toBe(0);
    expect(verification.index.artifacts[0]).toMatchObject({
      artifactKind: 'PLATFORM_NEUTRAL_SOURCE_ARCHIVE',
      architecture: 'neutral-source',
      desktopExecutable: false,
      nativeVerified: false
    });
    expect(verification.index.artifacts.some((item) => /\.(?:exe|dmg|rpm|snap)$/iu.test(item.name))).toBe(false);
  });

  test('exposes only read-only V3 delivery operations through the local SDK', async () => {
    const calls = [];
    const client = createSheikhaApiClient({
      fetchImpl: async (url, options) => {
        calls.push({ url, options });
        return { ok: true, status: 200, json: async () => ({ success: true }) };
      }
    });

    await client.nativeDelivery.status();
    await client.nativeDelivery.desktopReadiness();
    await client.nativeDelivery.eligibility();
    await client.nativeDelivery.runners();
    await client.nativeDelivery.releaseIndex();
    expect(calls.map((call) => call.url)).toEqual([
      'http://localhost:8080/api/sheikha/distribution-apex/v3/status',
      'http://localhost:8080/api/sheikha/distribution-apex/v3/desktop-readiness',
      'http://localhost:8080/api/sheikha/distribution-apex/v3/eligibility',
      'http://localhost:8080/api/sheikha/distribution-apex/v3/runners',
      'http://localhost:8080/api/sheikha/distribution-apex/v3/release-index'
    ]);
    expect(calls.every((call) => call.options.method === 'GET')).toBe(true);
  });
});
