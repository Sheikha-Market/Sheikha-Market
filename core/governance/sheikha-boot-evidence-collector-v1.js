'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const EVIDENCE_KINDS = Object.freeze([
  'UEFI_STATE_EXPORT', 'SECURE_BOOT_STATE_EXPORT', 'TPM_EVENT_LOG_EXPORT', 'PCR_EXPORT',
  'FIRMWARE_ARTIFACT', 'BOOTLOADER_ARTIFACT', 'KERNEL_ARTIFACT', 'INITRAMFS_ARTIFACT',
  'INIT_SYSTEM_EXPORT', 'RUNTIME_ARTIFACT', 'RUNTIME_HEALTH_EXPORT', 'BMC_INVENTORY_EXPORT',
  'ROOT_OF_TRUST_EXPORT', 'PHYSICAL_BOOT_OBSERVATION', 'POST_HANDOFF_OBSERVATION',
  'DISK_IMAGE_ARTIFACT', 'SECURE_BOOT_DBX_EXPORT'
]);
const DENIED_ROOTS = ['/dev', '/proc', '/sys'];
const MAX_EVIDENCE_BYTES = 128 * 1024 * 1024;

function rejectSpecialPath(file) {
  if (DENIED_ROOTS.some(root => file === root || file.startsWith(root + path.sep))) {
    throw new Error('DIRECT_SPECIAL_FILESYSTEM_INGESTION_FORBIDDEN');
  }
}

function sameFile(a, b) {
  return a.ino === b.ino && a.dev === b.dev && a.size === b.size && a.mtimeNs === b.mtimeNs && a.ctimeNs === b.ctimeNs;
}

class BootEvidenceCollector {
  constructor({allowedRoots, maxBytes = 16 * 1024 * 1024}) {
    if (!Array.isArray(allowedRoots) || allowedRoots.length === 0) throw new Error('ALLOWED_EVIDENCE_ROOT_REQUIRED');
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_EVIDENCE_BYTES) throw new Error('INVALID_EVIDENCE_SIZE_LIMIT');
    this.allowedRoots = allowedRoots.map(root => {
      const absolute = path.resolve(root);
      rejectSpecialPath(absolute);
      const real = fs.realpathSync(absolute);
      rejectSpecialPath(real);
      if (!fs.statSync(real).isDirectory()) throw new Error('EVIDENCE_ROOT_MUST_BE_DIRECTORY');
      return real;
    });
    this.maxBytes = maxBytes;
  }

  ingest({filePath, kind, source, observedAt}) {
    if (!EVIDENCE_KINDS.includes(kind)) throw new Error('UNAPPROVED_EVIDENCE_KIND');
    const absolute = path.resolve(filePath);
    rejectSpecialPath(absolute);
    const allowedRoot = this.allowedRoots.find(root => absolute === root || absolute.startsWith(root + path.sep));
    if (!allowedRoot) throw new Error('EVIDENCE_PATH_OUTSIDE_ALLOWED_ROOT');
    let component = allowedRoot;
    for (const segment of path.relative(allowedRoot, absolute).split(path.sep).filter(Boolean)) {
      component = path.join(component, segment);
      if (fs.lstatSync(component).isSymbolicLink()) throw new Error('SYMLINK_INGESTION_FORBIDDEN');
    }
    const directStat = fs.lstatSync(absolute, {bigint: true});
    if (directStat.isSymbolicLink()) throw new Error('SYMLINK_INGESTION_FORBIDDEN');
    if (!directStat.isFile()) throw new Error('REGULAR_FILE_REQUIRED');
    if (directStat.size > BigInt(this.maxBytes)) throw new Error('EVIDENCE_SIZE_LIMIT_EXCEEDED');
    const real = fs.realpathSync(absolute);
    rejectSpecialPath(real);
    const insideAllowedRoot = this.allowedRoots.some((root) => real.startsWith(`${root}${path.sep}`));
    if (!insideAllowedRoot) throw new Error('EVIDENCE_PATH_OUTSIDE_ALLOWED_ROOT');
    const fd = fs.openSync(absolute, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    let sha256;
    try {
      const before = fs.fstatSync(fd, {bigint: true});
      if (!before.isFile() || !sameFile(before, directStat) || fs.realpathSync(absolute) !== real) throw new Error('EVIDENCE_CHANGED_DURING_READ');
      const hasher = crypto.createHash('sha256');
      const chunk = Buffer.alloc(Math.min(this.maxBytes + 1, 1024 * 1024));
      let bytes = 0;
      // Hold one descriptor and bound every read, including a one-byte growth probe.
      while (bytes <= Number(before.size)) {
        const count = fs.readSync(fd, chunk, 0, Math.min(chunk.length, Number(before.size) - bytes + 1), null);
        if (!count) break;
        bytes += count;
        if (bytes > Number(before.size)) throw new Error('EVIDENCE_CHANGED_DURING_READ');
        hasher.update(chunk.subarray(0, count));
      }
      const after = fs.fstatSync(fd, {bigint: true});
      const current = fs.lstatSync(absolute, {bigint: true});
      if (bytes !== Number(before.size) || !sameFile(before, after) || !sameFile(before, current) || fs.realpathSync(absolute) !== real) throw new Error('EVIDENCE_CHANGED_DURING_READ');
      sha256 = hasher.digest('hex');
    } finally { fs.closeSync(fd); }
    return {
      evidenceId: `EVIDENCE-${crypto.randomUUID()}`,
      kind,
      source,
      observedAt,
      collectedAt: new Date().toISOString(),
      fileName: path.basename(real),
      sizeBytes: Number(directStat.size),
      sha256,
      contentExecuted: false,
      truthfulnessEstablishedByHash: false
    };
  }
}

function buildManifest(records) {
  const normalized = records.map((record) => ({...record}));
  const recordsSha256 = crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  return {schemaVersion: '1.0.0', system: 'SHEIKHA_BOOT_EVIDENCE_MANIFEST_V1', recordCount: normalized.length, records: normalized, recordsSha256};
}

function verifyManifest(manifest) {
  if (!manifest || !Array.isArray(manifest.records) || manifest.recordCount !== manifest.records.length) return false;
  const digest = crypto.createHash('sha256').update(JSON.stringify(manifest.records)).digest('hex');
  return digest === manifest.recordsSha256;
}

module.exports = {BootEvidenceCollector, DENIED_ROOTS, EVIDENCE_KINDS, MAX_EVIDENCE_BYTES, buildManifest, verifyManifest};
