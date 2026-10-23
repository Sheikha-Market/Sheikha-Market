'use strict';

const fs = require('node:fs');
const os = require('node:os');
const { parseEnv } = require('node:util');
const { performance } = require('node:perf_hooks');
const crypto = require('node:crypto');

const DISTRIBUTIONS = Object.freeze([
  Object.freeze({ id: 'debian', name: 'Debian', steward: 'Debian Project' }),
  Object.freeze({ id: 'ubuntu', name: 'Ubuntu', steward: 'Canonical / Ubuntu community' }),
  Object.freeze({ id: 'pop', name: 'Pop!_OS', steward: 'System76' })
]);
const ARCHITECTURE = Object.freeze({
  system: 'SHEIKHA_OS_HOST_INTEGRATION_V1', scope: 'USER_SPACE_GOVERNANCE_NOT_A_NEW_KERNEL',
  layers: [
    { id: 'identity', responsibility: 'Observe OS identity without taking ownership of upstream products' },
    { id: 'perception', responsibility: 'Bounded host metrics; no hostname, serials, users or network inventory' },
    { id: 'memory', responsibility: 'Explicit project notes with expiry and deletion; no automatic training' },
    { id: 'reasoning', responsibility: 'Local model draft, critique and evidence; no command execution from output' },
    { id: 'governance', responsibility: 'Trust, scope, expiry, least privilege and independent high-impact approval' },
    { id: 'pulse', responsibility: 'Measured sampling during an explicit bounded observation session' },
    { id: 'release', responsibility: 'Commit-bound tests, Native evidence, recovery and separate promotion' }
  ],
  transitions: ['REQUESTED', 'SCOPE_CHECKED', 'OBSERVED', 'REVIEW_REQUIRED', 'CLOSED_WITH_EVIDENCE'],
  owners: { operator: 'Approves a scoped action', engineer: 'Reviews compatibility and artifacts',
    security: 'Reviews privacy and authority', releaseReviewer: 'Approves independent release evidence' },
  rules: ['OBSERVATION_IS_NOT_COMPATIBILITY_PROOF', 'REGISTRATION_IS_NOT_EXECUTION', 'NO_SELF_GRANTED_AUTHORITY',
    'NO_AUTOMATIC_OS_UPGRADE', 'NO_MODEL_OUTPUT_AS_COMMAND', 'NO_CROSS_CUSTOMER_MEMORY', 'NO_UNVERIFIED_PRODUCTION_CLAIM'],
  consciousnessClaim: false, biologicalLifeClaim: false, independentWillClaim: false,
  fatwaAuthorityClaim: false, automaticTraining: false, autonomousRepair: false
});

function parseRelease(text) {
  if (typeof text !== 'string' || Buffer.byteLength(text) > 16384 || text.includes('\0')) throw Error('OS_RELEASE_LIMIT');
  // parseEnv never expands variables or executes shell input. Identity fields are additionally restricted.
  const fields = parseEnv(text);
  const id = /^[a-z0-9._-]{1,64}$/.test(fields.ID || '') ? fields.ID : null;
  const like = (fields.ID_LIKE || '').split(/\s+/).filter(Boolean);
  if (like.length > 16 || like.some(value => !/^[a-z0-9._-]{1,64}$/.test(value))) throw Error('OS_RELEASE_ID_LIKE_INVALID');
  const version = /^[a-zA-Z0-9._-]{1,64}$/.test(fields.VERSION_ID || '') ? fields.VERSION_ID : null;
  const name = fields.PRETTY_NAME && fields.PRETTY_NAME.length <= 160 && !/[\x00-\x1f\x7f$`\\]/.test(fields.PRETTY_NAME) ? fields.PRETTY_NAME : null;
  return { id, idLike: like, version, name, identityKnown: Boolean(id),
    recognizedDistribution: DISTRIBUTIONS.find(item => item.id === id) || null,
    debianFamilyHint: id === 'debian' || like.includes('debian'), compatibilityVerified: false };
}

function readRelease(io = fs) {
  let target;
  try { target = io.realpathSync('/etc/os-release'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; target = io.realpathSync('/usr/lib/os-release'); }
  if (!['/etc/os-release', '/usr/lib/os-release', '/etc/pop-os/os-release'].includes(target)) throw Error('OS_RELEASE_LOCATION_REJECTED');
  const fd = io.openSync(target, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const before = io.fstatSync(fd, { bigint: true });
    if (!before.isFile() || before.size > 16384n || before.uid !== 0n || (before.mode & 0o022n) !== 0n) throw Error('OS_RELEASE_FILE_REJECTED');
    const bytes = Buffer.alloc(16385); let size = 0;
    while (size < bytes.length) { const n = io.readSync(fd, bytes, size, bytes.length - size, null); if (!n) break; size += n; }
    const after = io.fstatSync(fd, { bigint: true });
    if (size > 16384 || BigInt(size) !== before.size || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) throw Error('OS_RELEASE_CHANGED');
    const data = bytes.subarray(0, size);
    return { ...parseRelease(data.toString('utf8')), source: target, sourceSha256: crypto.createHash('sha256').update(data).digest('hex') };
  } finally { io.closeSync(fd); }
}

class HostObserver {
  constructor({ system = os, release = readRelease, monotonic = () => performance.now(), wall = () => new Date().toISOString() } = {}) {
    Object.assign(this, { system, release, monotonic, wall }); this.sequence = 0; this.previous = null; this.stopActive = null;
  }
  sample() {
    const platform = this.system.platform(); let identity = null; let identityError = null;
    if (platform === 'linux') { try { identity = this.release(); } catch { identityError = 'OS_RELEASE_UNVERIFIED'; } }
    else identityError = 'NON_LINUX_HOST';
    const time = this.monotonic(); const elapsedMs = this.previous === null ? null : Math.max(0, time - this.previous); this.previous = time;
    const finite = n => Number.isFinite(n) && n >= 0 ? n : null;
    const total = finite(this.system.totalmem()); const free = finite(this.system.freemem());
    return { system: 'SHEIKHA_OS_HOST_OBSERVATION_V1', checkedAt: this.wall(), status: identity?.identityKnown ? 'HOST_OBSERVED_NOT_RELEASED' : 'HOST_IDENTITY_UNKNOWN',
      host: { platform, architecture: this.system.arch(), kernelRelease: this.system.release(), identity, identityError },
      metrics: { logicalCpuCount: this.system.cpus().length, loadAverage: this.system.loadavg().map(finite),
        memoryTotalBytes: total, memoryFreeBytes: free,
        memoryUsedPercent: total > 0 && free !== null && free <= total ? Math.round((1 - free / total) * 10000) / 100 : null,
        hostUptimeSeconds: finite(this.system.uptime()), cpuUtilizationPercent: null, gpuAvailability: 'NOT_PROBED' },
      pulse: { sequence: ++this.sequence, elapsedMs, continuousMonitoring: Boolean(this.stopActive) },
      compatibilityVerified: false, productionReady: false, modelInferenceExecuted: false, trainingExecuted: false,
      boundaries: { networkUsed: false, filesWritten: false, hardwareIdentifiersRead: false, tpmAccessed: false,
        firmwareModified: false, secureBootModified: false, osPackagesChanged: false, automaticRepairExecuted: false,
        publicPublicationAllowed: false, evidenceScope: 'LOCAL_PROCESS_OBSERVATION_NOT_INDEPENDENT_ATTESTATION' } };
  }
  watch({ intervalMs = 10000, maxSamples = 12, onSample, signal } = {}) {
    if (this.stopActive) throw Error('HOST_WATCH_ALREADY_ACTIVE');
    if (!Number.isInteger(intervalMs) || intervalMs < 1000 || intervalMs > 60000 || !Number.isInteger(maxSamples) || maxSamples < 1 || maxSamples > 60 || typeof onSample !== 'function') throw Error('BOUNDED_HOST_WATCH_REQUIRED');
    if (signal?.aborted) return Promise.resolve({ status: 'CANCELLED', samples: 0 });
    return new Promise((resolve, reject) => {
      let count = 0; let timer; let closed = false;
      const stop = (status = 'CANCELLED', error) => { if (closed) return; closed = true; clearTimeout(timer); signal?.removeEventListener('abort', abort); this.stopActive = null; error ? reject(error) : resolve({ status, samples: count }); };
      const abort = () => stop(); this.stopActive = stop;
      const tick = async () => { try { const sample = this.sample(); count++; await onSample(sample); if (closed) return; if (count >= maxSamples) stop('COMPLETED'); else timer = setTimeout(tick, intervalMs); } catch (error) { stop('FAILED', error); } };
      signal?.addEventListener('abort', abort, { once: true }); if (signal?.aborted) abort(); else void tick();
    });
  }
  stop() { this.stopActive?.(); }
}

module.exports = { DISTRIBUTIONS, ARCHITECTURE, parseRelease, readRelease, HostObserver };
