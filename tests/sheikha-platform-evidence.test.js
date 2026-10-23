'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { LANES, describePlatformIntegration, inspectPlatformEvidence, gitIdentity } = require('../runtime/sheikha-os-enterprise-federation/sheikha-platform-evidence');
const { SheikhaOSEnterpriseFederationFabric } = require('../runtime/sheikha-os-enterprise-federation/sheikha-os-enterprise-federation-fabric');
const { main } = require('../tools/os/sheikha-os-observe.cjs');
const head = 'a'.repeat(40); const tree = 'b'.repeat(40);
let root;
beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-platform-evidence-')); });
afterEach(() => { jest.restoreAllMocks(); fs.rmSync(root, { recursive: true, force: true }); });
function write(id, data = {}) {
  const lane = LANES.find(item => item.id === id); const file = path.join(root, lane.file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ system: lane.system, status: 'VERIFIED', ...data }), { mode: 0o600 }); return file;
}
function inspect(overrides = {}) { return inspectPlatformEvidence({ repo: root, expectedHead: head, identityReader: () => ({ head, tree, clean: true }), ...overrides }); }

test('descriptor separates host Native from firmware release and QEMU from physical boot', () => {
  const d = describePlatformIntegration(); expect(d.lanes.map(lane => lane.id)).toEqual(['FIRMWARE', 'BARE_METAL', 'NATIVE_C', 'NATIVE_TAURI']);
  expect(d).toMatchObject({ nativeRequiresSheikhaFirmwareRelease: false, qemuSuccessProvesPhysicalBoot: false, productionReady: false, executionAuthorized: false });
  d.lanes[0].requiredEvidence.push('FORGED'); expect(describePlatformIntegration().lanes[0].requiredEvidence).not.toContain('FORGED');
});
test('missing reports remain missing, not successful zero counts', () => {
  const r = inspect(); expect(r.lanes.every(lane => lane.reportState === 'REPORT_MISSING')).toBe(true);
  expect(r.lanes.every(lane => !lane.evidenceAcceptedForRelease && !lane.productionReady)).toBe(true);
  expect(r.sha256).toMatch(/^[a-f0-9]{64}$/); expect(r.source.sourceMatchIsArtifactAttestation).toBe(false);
});
test('all success claims and a matching declared head cannot promote release or authorize actions', () => {
  write('FIRMWARE', { readiness: { namedBoardFirmwareReady: true, oemOdmCommercialReleaseReady: true }, actualFirmwareReleaseGate: { decision: 'RELEASE_ALLOW' } });
  write('BARE_METAL', { qemuBootVerified: true, physicalBootVerified: true, physicalBootExecuted: true });
  write('NATIVE_C', { sourceBaselineCommit: head, nativeVerifiedTargetCount: 1 });
  write('NATIVE_TAURI', { actualStartHead: head, desktopExecutableBuilt: true, nativeLaunchVerified: true, artifact: { sha256: 'c'.repeat(64) } });
  const r = inspect(); expect(r.source.sourceMatches).toBe(true);
  expect(r.lanes.find(l => l.id === 'NATIVE_TAURI').sourceBinding).toBe('DECLARED_HEAD_MATCH_NOT_PROOF');
  expect(r.lanes.find(l => l.id === 'NATIVE_C').sourceBinding).toBe('BASELINE_REFERENCE_NOT_BUILD_BINDING');
  expect(r.lanes.every(l => !l.evidenceAcceptedForRelease && !l.artifactBytesVerified)).toBe(true);
  expect(r).toMatchObject({ executionAuthorized: false, productionReady: false });
  expect(r.boundaries).toMatchObject({ nativeBuildExecuted: false, qemuExecuted: false, tpmAccessed: false, firmwareAccessed: false, releaseGateChanged: false });
});
test('historical native head is explicitly separated from the requested head', () => {
  write('NATIVE_TAURI', { actualStartHead: 'd'.repeat(40), nativeLaunchVerified: true });
  expect(inspect().lanes.find(l => l.id === 'NATIVE_TAURI').sourceBinding).toBe('DIFFERENT_SOURCE_COMMIT');
});
test('QEMU claim does not invent a physical boot claim and preserves false', () => {
  write('BARE_METAL', { qemuBootVerified: true, physicalBootExecuted: false });
  expect(inspect().lanes.find(l => l.id === 'BARE_METAL').reportedClaims).toEqual({ qemuBootVerified: true, physicalBootExecuted: false, physicalBootVerified: null, physicalMediaWritten: null });
});
test('report fields cannot leak device identities, arbitrary text, paths or coerced booleans', () => {
  write('FIRMWARE', { status: '/home/private', releaseIdentity: { boardBinding: 'PRIVATE_BOARD' }, readiness: { namedBoardFirmwareReady: 'true' } });
  write('NATIVE_TAURI', { actualStartHead: 'PRIVATE_HEAD', artifact: { path: '/private/weight', sha256: 'PRIVATE_SHA' }, instructions: 'RUN_PRIVATE_COMMAND', nativeLaunchVerified: 1 });
  const r = inspect(); expect(JSON.stringify(r)).not.toMatch(/PRIVATE_|\/home\/private|\/private\/weight/);
  expect(r.lanes[0].reportedStatus).toBeNull(); expect(r.lanes[0].reportedClaims.namedBoardFirmwareReady).toBeNull();
  expect(r.lanes[3].reportedClaims.nativeLaunchVerified).toBeNull(); expect(JSON.stringify(r)).not.toContain(root);
});
test.each(['null', '[]', '{invalid', 'x'.repeat(2 * 1024 * 1024 + 1)])('malformed or oversized report stays unverified (case %#)', content => {
  const file = write('FIRMWARE'); fs.writeFileSync(file, content);
  expect(inspect().lanes[0].reportState).toBe('REPORT_UNVERIFIED');
});
test('wrong report system cannot contribute claims', () => {
  write('BARE_METAL', { system: 'WRONG', physicalBootVerified: true });
  const r = inspect().lanes[1]; expect(r.reportState).toBe('REPORT_SCHEMA_MISMATCH'); expect(r.reportedClaims).toEqual({});
});
test.each(['symlink', 'hardlink'])('rejects %s reports', kind => {
  const file = write('FIRMWARE'); const secret = path.join(root, 'secret.json'); fs.renameSync(file, secret);
  kind === 'symlink' ? fs.symlinkSync(secret, file) : fs.linkSync(secret, file);
  expect(inspect().lanes[0].reportState).toBe('REPORT_UNVERIFIED');
});
test('rejects a symlinked repository root', () => {
  const alias = path.join(root, 'alias'); fs.symlinkSync(root, alias);
  expect(() => inspect({ repo: alias })).toThrow('CANONICAL_REPOSITORY_REQUIRED');
});
test('detects a report changing during the read', () => {
  write('FIRMWARE'); const original = fs.fstatSync; let calls = 0;
  jest.spyOn(fs, 'fstatSync').mockImplementation((...args) => {
    const stat = original(...args); if (++calls === 2) stat.ctimeNs += 1n; return stat;
  });
  expect(inspect().lanes[0].reportState).toBe('REPORT_UNVERIFIED');
});
test.each([false, null])('dirty or unknown worktree cleanliness %p cannot be a matching snapshot', clean => {
  const r = inspect({ identityReader: () => ({ head, tree, clean }) }); expect(r.source.sourceMatches).toBe(false);
  expect(r.blockers).toContain('SOURCE_IDENTITY_OR_CLEANLINESS_NOT_ESTABLISHED');
});
test('source identity drift between reads invalidates matching state', () => {
  const identityReader = jest.fn().mockReturnValueOnce({ head, tree, clean: true }).mockReturnValueOnce({ head: 'e'.repeat(40), tree, clean: true });
  expect(inspect({ identityReader }).source.identityStable).toBe(false);
});
test('Git reader runs only identity queries with sanitized environment and no worktree status claim', () => {
  const runner = jest.fn().mockReturnValueOnce({ status: 0, stdout: head }).mockReturnValueOnce({ status: 0, stdout: tree });
  expect(gitIdentity(root, runner)).toEqual({ head, tree, clean: null });
  expect(runner).toHaveBeenCalledTimes(2);
  for (const [program, args, options] of runner.mock.calls) {
    expect(program).toBe('/usr/bin/git'); expect(args).toContain('rev-parse');
    expect(args).not.toContain('status'); expect(args).not.toContain('diff');
    expect(options.env.GIT_OPTIONAL_LOCKS).toBe('0'); expect(options.env.GIT_CONFIG_GLOBAL).toBe('/dev/null');
    expect(options.env).not.toHaveProperty('NODE_OPTIONS'); expect(options.env).not.toHaveProperty('GIT_DIR');
  }
});
test('requires an explicit absolute root and full commit; CLI cannot accept an action or extra command', async () => {
  expect(() => inspect({ repo: '.' })).toThrow('EXPLICIT_REPOSITORY_AND_FULL_HEAD_REQUIRED');
  expect(() => inspect({ expectedHead: 'main' })).toThrow('EXPLICIT_REPOSITORY_AND_FULL_HEAD_REQUIRED');
  await expect(main(['--integration', '--repo', root, '--head', head, '--flash'])).rejects.toThrow('USE_INTEGRATION_REPO_ABSOLUTE_PATH_HEAD_FULL_SHA');
});
test('OS status exposes the descriptor without automatically reading report files', () => {
  const read = jest.spyOn(fs, 'openSync'); const fabric = new SheikhaOSEnterpriseFederationFabric();
  const s = fabric.getStatus(); expect(s.platformIntegration.mode).toBe('LOCAL_REPORT_REVIEW_ONLY'); expect(read).not.toHaveBeenCalled();
  expect(fabric.inspectPlatformEvidence({ repo: root, expectedHead: head, identityReader: () => ({ head, tree, clean: true }) }).lanes).toHaveLength(4);
});
