'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {BootEvidenceCollector, EVIDENCE_KINDS, buildManifest, verifyManifest} = require('../core/governance/sheikha-boot-evidence-collector-v1');

describe('Sheikha boot evidence collector V1', () => {
  let root;
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-evidence-')); });
  afterEach(() => { fs.rmSync(root, {recursive: true, force: true}); });

  test('supports 17 kinds and ingests a bounded regular file without executing it', () => {
    expect(EVIDENCE_KINDS).toHaveLength(17);
    const file = path.join(root, 'pcr.json');
    fs.writeFileSync(file, '{"pcr":true}\n');
    const record = new BootEvidenceCollector({allowedRoots: [root]}).ingest({filePath: file, kind: 'PCR_EXPORT', source: 'operator-export', observedAt: '2026-09-01T00:00:00Z'});
    expect(record.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(record.contentExecuted).toBe(false);
    expect(record.truthfulnessEstablishedByHash).toBe(false);
  });

  test('rejects symlink, directory, unapproved kind, and oversized file', () => {
    const file = path.join(root, 'evidence');
    fs.writeFileSync(file, 'safe');
    const link = path.join(root, 'link');
    fs.symlinkSync(file, link);
    const collector = new BootEvidenceCollector({allowedRoots: [root], maxBytes: 4});
    expect(() => collector.ingest({filePath: link, kind: 'PCR_EXPORT'})).toThrow('SYMLINK_INGESTION_FORBIDDEN');
    expect(() => collector.ingest({filePath: root, kind: 'PCR_EXPORT'})).toThrow('REGULAR_FILE_REQUIRED');
    expect(() => collector.ingest({filePath: file, kind: 'UNKNOWN'})).toThrow('UNAPPROVED_EVIDENCE_KIND');
    fs.writeFileSync(file, 'oversized');
    expect(() => collector.ingest({filePath: file, kind: 'PCR_EXPORT'})).toThrow('EVIDENCE_SIZE_LIMIT_EXCEEDED');
  });

  test('detects manifest tampering', () => {
    const manifest = buildManifest([{evidenceId: 'e1', sha256: 'a'.repeat(64)}]);
    expect(verifyManifest(manifest)).toBe(true);
    manifest.records[0].sha256 = 'b'.repeat(64);
    expect(verifyManifest(manifest)).toBe(false);
  });

  test('keeps the declared collector kind count synchronized with its implementation', () => {
    const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../runtime/governance/platform-trust/v1/sheikha-boot-evidence-collector-v1.json'), 'utf8'));
    expect(config.acceptedKindCount).toBe(EVIDENCE_KINDS.length);
  });

  test.each([0, -1, 0.5, NaN, Infinity, '1024', 128 * 1024 * 1024 + 1])('rejects invalid read limit %s', maxBytes => {
    expect(() => new BootEvidenceCollector({allowedRoots: [root], maxBytes})).toThrow('INVALID_EVIDENCE_SIZE_LIMIT');
  });

  test('rejects special roots and directory symlinks before reading', () => {
    fs.symlinkSync('/dev', path.join(root, 'devices'));
    expect(() => new BootEvidenceCollector({allowedRoots: [path.join(root, 'devices')]})).toThrow('DIRECT_SPECIAL_FILESYSTEM');
    const real = path.join(root, 'real');
    fs.mkdirSync(real);
    fs.writeFileSync(path.join(real, 'export'), 'test');
    fs.symlinkSync(real, path.join(root, 'alias'));
    const collector = new BootEvidenceCollector({allowedRoots: [root]});
    expect(() => collector.ingest({filePath: path.join(root, 'alias/export'), kind: 'PCR_EXPORT'})).toThrow('SYMLINK_INGESTION_FORBIDDEN');
    expect(() => collector.ingest({filePath: '/dev/tpmrm0', kind: 'PCR_EXPORT'})).toThrow('DIRECT_SPECIAL_FILESYSTEM');
    expect(() => collector.ingest({filePath: root + '-other/private', kind: 'PCR_EXPORT'})).toThrow('EVIDENCE_PATH_OUTSIDE_ALLOWED_ROOT');
  });

  test('hashes a large file in bounded chunks rather than reading the whole file', () => {
    const bytes = Buffer.alloc(3 * 1024 * 1024 + 17, 65);
    const file = path.join(root, 'large.bin');
    fs.writeFileSync(file, bytes);
    const read = jest.spyOn(fs, 'readSync');
    try {
      const result = new BootEvidenceCollector({allowedRoots: [root]}).ingest({filePath: file, kind: 'FIRMWARE_ARTIFACT'});
      expect(result.sha256).toBe(crypto.createHash('sha256').update(bytes).digest('hex'));
      expect(result.sizeBytes).toBe(bytes.length);
      expect(read.mock.calls.length).toBeGreaterThan(3);
      expect(read.mock.calls.every(call => call[3] <= 1024 * 1024)).toBe(true);
    } finally { read.mockRestore(); }
  });

  test.each(['growth', 'replacement', 'same-size-write'])('rejects %s during reading and closes the descriptor', change => {
    const file = path.join(root, 'moving.bin');
    fs.writeFileSync(file, 'before');
    const originalRead = fs.readSync;
    let changed = false;
    let fd;
    const read = jest.spyOn(fs, 'readSync').mockImplementation((...args) => {
      fd = args[0];
      const count = originalRead(...args);
      if (!changed) {
        changed = true;
        if (change === 'growth') fs.appendFileSync(file, 'after');
        if (change === 'replacement') {
          fs.renameSync(file, file + '.old');
          fs.writeFileSync(file, 'before');
        }
        if (change === 'same-size-write') fs.writeFileSync(file, 'AFTERS');
      }
      return count;
    });
    try {
      expect(() => new BootEvidenceCollector({allowedRoots: [root]}).ingest({filePath: file, kind: 'BOOTLOADER_ARTIFACT'})).toThrow('EVIDENCE_CHANGED_DURING_READ');
      expect(() => fs.fstatSync(fd)).toThrow();
    } finally { read.mockRestore(); }
  });
});
