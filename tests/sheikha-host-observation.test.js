'use strict';
const { parseRelease, readRelease, HostObserver, ARCHITECTURE } = require('../runtime/sheikha-os-enterprise-federation/sheikha-host-observation');
const osRelease = 'ID=pop\nID_LIKE="ubuntu debian"\nVERSION_ID="22.04"\nPRETTY_NAME="Pop!_OS 22.04 LTS"\n';
function fixture() {
  let clock = 10;
  const system = { platform: () => 'linux', arch: () => 'x64', release: () => 'fixture-kernel', cpus: () => [{}, {}],
    totalmem: () => 1000, freemem: () => 400, loadavg: () => [1, 2, 3], uptime: () => 123 };
  const release = jest.fn(() => parseRelease(osRelease));
  return { system, release, observer: new HostObserver({ system, release, monotonic: () => clock += 1000, wall: () => 'fixture-time' }) };
}
test.each(['debian', 'ubuntu', 'pop'])('recognizes explicit distribution %s without claiming compatibility', id => {
  const result = parseRelease('ID=' + id + '\nVERSION_ID="22.04"');
  expect(result.recognizedDistribution.id).toBe(id); expect(result.compatibilityVerified).toBe(false);
});
test('keeps Pop and System76 identity distinct from Sheikha branding or hardware', () => {
  const result = parseRelease(osRelease); expect(result.idLike).toEqual(['ubuntu', 'debian']);
  expect(result.recognizedDistribution.steward).toBe('System76'); expect(result.debianFamilyHint).toBe(true);
  expect(result).not.toHaveProperty('hardwareManufacturer');
});
test('parser never evaluates shell input or exposes unrelated fields', () => {
  const result = parseRelease('ID=$(touch /tmp/never-run)\nSECRET=private-token\nPRETTY_NAME="$(uname)"');
  expect(result.id).toBeNull(); expect(result.name).toBeNull(); expect(JSON.stringify(result)).not.toMatch(/private-token|never-run/);
  expect(() => parseRelease('a'.repeat(16385))).toThrow('OS_RELEASE_LIMIT');
  expect(() => parseRelease('ID=pop\0')).toThrow('OS_RELEASE_LIMIT');
  expect(() => parseRelease('ID_LIKE="ubuntu $(id)"')).toThrow('OS_RELEASE_ID_LIKE_INVALID');
});
test('missing identity stays unknown instead of defaulting to Linux certification', () => {
  const { observer, release } = fixture(); release.mockImplementation(() => { throw Error('PRIVATE_ERROR'); });
  const report = observer.sample(); expect(report.status).toBe('HOST_IDENTITY_UNKNOWN');
  expect(report.host.identityError).toBe('OS_RELEASE_UNVERIFIED'); expect(JSON.stringify(report)).not.toContain('PRIVATE_ERROR');
});
test('non-Linux host is not read through Linux release files', () => {
  const { observer, system, release } = fixture(); system.platform = () => 'darwin';
  expect(observer.sample().host.identityError).toBe('NON_LINUX_HOST'); expect(release).not.toHaveBeenCalled();
});
test('actual samples measure pulse and memory but do not infer CPU utilization or GPU availability', () => {
  const { observer } = fixture(); const first = observer.sample(); const second = observer.sample();
  expect(first.pulse).toEqual({ sequence: 1, elapsedMs: null, continuousMonitoring: false });
  expect(second.pulse.elapsedMs).toBe(1000); expect(second.metrics.memoryUsedPercent).toBe(60);
  expect(second.metrics.memoryFreeBytes).toBe(400);
  expect(second.metrics.cpuUtilizationPercent).toBeNull(); expect(second.metrics.gpuAvailability).toBe('NOT_PROBED');
  expect(second.boundaries).toMatchObject({ networkUsed: false, filesWritten: false, hardwareIdentifiersRead: false, tpmAccessed: false, publicPublicationAllowed: false });
  expect(second.productionReady).toBe(false); expect(second.trainingExecuted).toBe(false);
  expect(ARCHITECTURE).toMatchObject({ consciousnessClaim: false, biologicalLifeClaim: false, automaticTraining: false, autonomousRepair: false });
});
test('invalid metrics stay unknown rather than becoming successful zeros', () => {
  const { observer, system } = fixture(); system.totalmem = () => NaN; system.freemem = () => -1;
  expect(observer.sample().metrics.memoryUsedPercent).toBeNull();
});
function releaseIo(target = '/etc/pop-os/os-release') {
  const data = Buffer.from(osRelease); let offset = 0;
  const stat = { isFile: () => true, size: BigInt(data.length), uid: 0n, mode: 0o100644n, mtimeNs: 1n, ctimeNs: 1n };
  const io = { realpathSync: jest.fn(() => target), openSync: jest.fn(() => 7), fstatSync: jest.fn(() => ({ ...stat })),
    closeSync: jest.fn(), readSync: jest.fn((fd, buffer, start, length) => {
      const n = data.copy(buffer, start, offset, offset + length); offset += n; return n;
    }) };
  return { io, stat };
}
test('reads the root-owned Pop vendor target and closes the descriptor', () => {
  const { io } = releaseIo(); const result = readRelease(io);
  expect(result.id).toBe('pop'); expect(result.source).toBe('/etc/pop-os/os-release');
  expect(result.sourceSha256).toMatch(/^[a-f0-9]{64}$/); expect(io.closeSync).toHaveBeenCalledWith(7);
  const flags = io.openSync.mock.calls[0][1];
  expect(flags & require('node:fs').constants.O_NOFOLLOW).not.toBe(0);
});
test('rejects arbitrary symlink targets before opening them', () => {
  const { io } = releaseIo('/tmp/private');
  expect(() => readRelease(io)).toThrow('OS_RELEASE_LOCATION_REJECTED'); expect(io.openSync).not.toHaveBeenCalled();
});
test.each([{ uid: 1000n }, { mode: 0o100666n }, { size: 16385n }, { isFile: () => false }])('rejects unsafe release file properties %p', override => {
  const { io, stat } = releaseIo(); Object.assign(stat, override);
  expect(() => readRelease(io)).toThrow('OS_RELEASE_FILE_REJECTED'); expect(io.readSync).not.toHaveBeenCalled();
  expect(io.closeSync).toHaveBeenCalledWith(7);
});
test('rejects changes during the bounded read', () => {
  const { io, stat } = releaseIo(); io.fstatSync.mockReturnValueOnce(stat).mockReturnValueOnce({ ...stat, ctimeNs: 2n });
  expect(() => readRelease(io)).toThrow('OS_RELEASE_CHANGED'); expect(io.closeSync).toHaveBeenCalledWith(7);
});
test('watch runs only its bounded sample count and stops its timer', async () => {
  jest.useFakeTimers();
  try {
    const { observer } = fixture(); const onSample = jest.fn();
    const run = observer.watch({ intervalMs: 1000, maxSamples: 3, onSample });
    expect(() => observer.watch({ onSample })).toThrow('HOST_WATCH_ALREADY_ACTIVE');
    await jest.advanceTimersByTimeAsync(2000);
    await expect(run).resolves.toEqual({ status: 'COMPLETED', samples: 3 });
    expect(onSample).toHaveBeenCalledTimes(3); expect(observer.stopActive).toBeNull();
    await jest.advanceTimersByTimeAsync(60000); expect(onSample).toHaveBeenCalledTimes(3);
  } finally { jest.useRealTimers(); }
});
test('cancelled watch cannot emit late samples', async () => {
  jest.useFakeTimers();
  try {
    const { observer } = fixture(); const c = new AbortController(); const onSample = jest.fn();
    const run = observer.watch({ intervalMs: 1000, maxSamples: 5, signal: c.signal, onSample });
    c.abort(); await expect(run).resolves.toEqual({ status: 'CANCELLED', samples: 1 });
    await jest.advanceTimersByTimeAsync(10000); expect(onSample).toHaveBeenCalledTimes(1);
    expect(observer.stopActive).toBeNull();
  } finally { jest.useRealTimers(); }
});
test('pre-cancellation, callback failure and unbounded requests cannot leave an active timer', async () => {
  const { observer } = fixture(); const c = new AbortController(); c.abort(); const onSample = jest.fn();
  await expect(observer.watch({ signal: c.signal, onSample })).resolves.toEqual({ status: 'CANCELLED', samples: 0 });
  expect(onSample).not.toHaveBeenCalled();
  await expect(observer.watch({ onSample: () => { throw Error('CALLBACK_FAILED'); } })).rejects.toThrow('CALLBACK_FAILED');
  expect(observer.stopActive).toBeNull();
  expect(() => observer.watch({ intervalMs: 0, onSample })).toThrow('BOUNDED_HOST_WATCH_REQUIRED');
});
