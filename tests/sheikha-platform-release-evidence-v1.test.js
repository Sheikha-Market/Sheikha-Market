'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const {verifyManifest} = require('../core/governance/sheikha-boot-evidence-collector-v1');
const {verifyPlatformEvidence, REQUIRED_KINDS, validateInput} = require('../tools/verification/sheikha-platform-release-evidence-v1');
const {main, exitCodeForResult} = require('../tools/training/sheikha-foundry-workbench-v1');

describe('Offline platform release file verification', () => {
  let root;
  let input;
  let options;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-platform-evidence-'));
    fs.mkdirSync(path.join(root, 'evidence'));
    input = {releaseRef: 'test-release', boardRef: 'test-board', architecture: 'X86_64', artifacts: REQUIRED_KINDS.map((kind, index) => {
      const bytes = Buffer.from(`synthetic-file-${index}-not-real-firmware`);
      const relativePath = `evidence/${index}.bin`;
      fs.writeFileSync(path.join(root, relativePath), bytes);
      return {id: `test-${index}`, kind, relativePath, sha256: crypto.createHash('sha256').update(bytes).digest('hex')};
    })};
    options = {workspaceRoot: root, allowedRoots: [path.join(root, 'evidence')]};
  });
  afterEach(() => { fs.rmSync(root, {recursive: true, force: true}); });

  test('verifies bytes only and never promotes even if every file matches', () => {
    const result = verifyPlatformEvidence(input, options);
    expect(result.requiredFilesVerified).toBe(true);
    expect(result.providedFilesVerified).toBe(true);
    expect(result.status).toBe('BYTES_VERIFIED_PENDING_TRUST_CHECKS');
    expect(result.signatureVerified).toBe(false);
    expect(result.platformCompatibilityVerified).toBe(false);
    expect(result.executionAuthorized).toBe(false);
    expect(result.productionReleased).toBe(false);
    expect(result.networkCalls).toBe(0);
    expect(result.contentsExecuted).toBe(false);
    expect(result.tpmAccessed).toBe(false);
    expect(result.firmwareWritten).toBe(false);
    expect(result.secureBootModified).toBe(false);
    expect(verifyManifest(result.collectedManifest)).toBe(true);
    expect(result.remainingTrustChecks).toContain('AUTHENTICATED_RELEASE_MANIFEST_REQUIRED');
    expect(JSON.stringify(result)).not.toContain(root);
  });

  test.each(REQUIRED_KINDS)('identifies missing %s independently of supplied file matches', kind => {
    input.artifacts = input.artifacts.filter(entry => entry.kind !== kind);
    const result = verifyPlatformEvidence(input, options);
    expect(result.providedFilesVerified).toBe(true);
    expect(result.requiredFilesVerified).toBe(false);
    expect(result.status).toBe('RELEASE_HOLD');
    expect(result.byteBlockers).toContainEqual({kind, reason: 'REQUIRED_EVIDENCE_NOT_SUPPLIED'});
  });

  test('detects changed bytes, missing files, and empty exports', () => {
    fs.writeFileSync(path.join(root, input.artifacts[0].relativePath), 'changed');
    fs.unlinkSync(path.join(root, input.artifacts[1].relativePath));
    fs.writeFileSync(path.join(root, input.artifacts[2].relativePath), '');
    const result = verifyPlatformEvidence(input, options);
    expect(result.artifacts.map(entry => entry.status)).toEqual(['SHA256_MISMATCH', 'EVIDENCE_FILE_MISSING', 'EMPTY_EVIDENCE_FILE']);
    expect(result.providedFilesVerified).toBe(false);
    expect(result.status).toBe('RELEASE_HOLD');
  });

  test.each(['/dev/tpmrm0', '../outside', 'evidence/../key', 'evidence//file', 'https://host/file', 'C:\\file', 'evidence/file\u0000', 'evidence/./file'])('rejects path %s before file access', relativePath => {
    input.artifacts[0].relativePath = relativePath;
    const read = jest.spyOn(fs, 'readSync');
    try {
      expect(() => verifyPlatformEvidence(input, options)).toThrow('INVALID_PLATFORM_EVIDENCE_RELATIVE_PATH');
      expect(read).not.toHaveBeenCalled();
    } finally { read.mockRestore(); }
  });

  test('denies files outside caller roots and symbolic links', () => {
    const outside = path.join(root, 'private.bin');
    fs.writeFileSync(outside, 'outside secret');
    input.artifacts[0].relativePath = 'private.bin';
    fs.unlinkSync(path.join(root, input.artifacts[1].relativePath));
    fs.symlinkSync(outside, path.join(root, input.artifacts[1].relativePath));
    const result = verifyPlatformEvidence(input, options);
    expect(result.artifacts[0].status).toBe('EVIDENCE_PATH_OUTSIDE_ALLOWED_ROOT');
    expect(result.artifacts[1].status).toBe('SYMLINK_INGESTION_FORBIDDEN');
    expect(JSON.stringify(result)).not.toContain('outside secret');
  });

  test.each(['executionAuthorized', 'allowedRoots', 'signatureVerified'])('rejects self authorization field %s', field => {
    input[field] = true;
    expect(() => validateInput(input)).toThrow('INVALID_PLATFORM_EVIDENCE_FIELDS');
  });

  test('rejects malformed ids, hashes, kinds, architectures, and no artifacts', () => {
    expect(() => validateInput({...input, releaseRef: 'https://host'})).toThrow();
    expect(() => validateInput({...input, architecture: 'ALL'})).toThrow();
    expect(() => validateInput({...input, artifacts: []})).toThrow();
    expect(() => validateInput({...input, artifacts: Array(17).fill(input.artifacts[0])})).toThrow();
    for (const patch of [{id: ''}, {sha256: 'unknown'}, {kind: 'EXECUTE'}, {approved: true}]) {
      expect(() => validateInput({...input, artifacts: [{...input.artifacts[0], ...patch}]})).toThrow();
    }
  });

  test.each(['id', 'relativePath', 'kind'])('rejects duplicate primary artifact %s', field => {
    input.artifacts[1][field] = input.artifacts[0][field];
    expect(() => validateInput(input)).toThrow('DUPLICATE_PLATFORM_EVIDENCE');
  });

  test('permits separate historical physical observations without equating them to new boot tests', () => {
    input.artifacts[0].kind = 'PHYSICAL_BOOT_OBSERVATION';
    input.artifacts[1].kind = 'PHYSICAL_BOOT_OBSERVATION';
    const result = verifyPlatformEvidence(input, options);
    expect(result.providedFilesVerified).toBe(true);
    expect(result.requiredFilesVerified).toBe(false);
    expect(result.platformCompatibilityVerified).toBe(false);
  });

  test('CLI supports private offline input without allowing an alternate filesystem root', async () => {
    const privateRoot = path.resolve(__dirname, '../reports/private');
    fs.mkdirSync(privateRoot, {recursive: true, mode: 0o700});
    const temp = fs.mkdtempSync(path.join(privateRoot, '.platform-evidence-test-'));
    try {
      const file = path.join(temp, 'synthetic.bin');
      const bytes = Buffer.from('test-only-not-a-device-export');
      fs.writeFileSync(file, bytes, {mode: 0o600});
      input.artifacts = [{id: 'synthetic', kind: 'BOOTLOADER_ARTIFACT', relativePath: path.relative(path.resolve(__dirname, '..'), file), sha256: crypto.createHash('sha256').update(bytes).digest('hex')}];
      const config = path.join(temp, 'input.json');
      fs.writeFileSync(config, JSON.stringify(input), {mode: 0o600});
      const result = await main(['platform-evidence', '--input', config]);
      expect(result.providedFilesVerified).toBe(true);
      expect(result.productionReleased).toBe(false);
      await expect(main(['platform-evidence', '--input', config, '--root', root])).rejects.toThrow();
      expect((await main(['help'])).commands).toContain('platform-evidence --input FILE');
    } finally { fs.rmSync(temp, {recursive: true, force: true}); }
  });

  test.each([false, undefined, 'true', null])('fails the CLI integrity gate on unverified required files: %s', requiredFilesVerified => {
    expect(exitCodeForResult('platform-evidence', {requiredFilesVerified})).toBe(2);
  });

  test('CLI integrity success is not production approval and does not alter planning commands', () => {
    expect(exitCodeForResult('platform-evidence', {requiredFilesVerified: true, productionReleased: false})).toBe(0);
    expect(exitCodeForResult('platform-release', {compatibilityDecision: 'RELEASE_HOLD'})).toBe(0);
  });
});
