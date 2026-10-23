'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {initKey, seal, inspect, main} = require('../tools/training/sheikha-artifact-custody-v1');

const root = path.resolve(__dirname, '../reports/private');
let temp, source, store, key, input, plain;
function write(file, bytes) { fs.writeFileSync(file, bytes, {mode: 0o600}); }
beforeEach(() => {
  temp = fs.mkdtempSync(path.join(root, 'custody-test-'));
  fs.chmodSync(temp, 0o700);
  source = path.join(temp, 'source'); store = path.join(temp, 'store'); key = path.join(temp, 'key.bin');
  fs.mkdirSync(source, {mode: 0o700}); fs.mkdirSync(store, {mode: 0o700});
  plain = Buffer.alloc(2 * 1024 * 1024 + 17, 42);
  write(path.join(source, 'model.safetensors'), plain);
  write(path.join(source, 'config.json'), '{"testFixture":true}');
  const index = {runId: 'run', tenantRef: 'tenant', modelRef: 'model', objective: 'test-not-a-trained-model', contractRef: 'fixture', licenseRef: 'fixture'};
  for (const f of ['baseSha256', 'tokenizerSha256', 'recipeSha256', 'datasetManifestSha256', 'evaluationSha256']) index[f] = 'a'.repeat(64);
  index.artifactSha256 = crypto.createHash('sha256').update(plain).digest('hex');
  input = {sourceDir: source, storeDir: store, files: ['model.safetensors', 'config.json'], index};
  initKey(key);
});
afterEach(() => fs.rmSync(temp, {recursive: true, force: true}));

test('encrypts, indexes, verifies and restores large streamed bytes with private permissions', async () => {
  const backup = await seal(input, key);
  expect(backup.encrypted).toBe(true);
  expect(fs.readFileSync(path.join(backup.bundleDir, '0.bin')).equals(plain)).toBe(false);
  expect(fs.statSync(backup.bundleDir).mode & 0o777).toBe(0o700);
  expect(fs.statSync(path.join(backup.bundleDir, 'manifest.json')).mode & 0o777).toBe(0o600);
  expect((await inspect(backup.bundleDir, key)).plaintextHashesVerified).toBe(true);
  const destination = path.join(temp, 'restored');
  const restored = await inspect(backup.bundleDir, key, destination);
  expect(restored.restored).toBe(true);
  expect(restored.remoteBackupVerified).toBe(false);
  expect(restored.trainingReuseAuthorized).toBe(false);
  expect(restored.declaredIndex.rightsVerified).toBe(false);
  expect(fs.readFileSync(path.join(destination, 'model.safetensors')).equals(plain)).toBe(true);
});
test('different backups have distinct salts, IVs and ciphertext', async () => {
  const a = await seal(input, key); const b = await seal(input, key);
  expect(a.bundleDir).not.toBe(b.bundleDir);
  expect(fs.readFileSync(path.join(a.bundleDir, '0.bin')).equals(fs.readFileSync(path.join(b.bundleDir, '0.bin')))).toBe(false);
});
test('rejects the wrong key', async () => {
  const b = await seal(input, key); const wrong = path.join(temp, 'wrong.key'); initKey(wrong);
  await expect(inspect(b.bundleDir, wrong)).rejects.toThrow('MANIFEST_AUTHENTICATION_FAILED');
});
test('tampered manifest cannot grant reuse rights', async () => {
  const b = await seal(input, key); const file = path.join(b.bundleDir, 'manifest.json');
  const m = JSON.parse(fs.readFileSync(file)); m.manifest.trainingReuseAuthorized = true; write(file, JSON.stringify(m));
  await expect(inspect(b.bundleDir, key)).rejects.toThrow('MANIFEST_AUTHENTICATION_FAILED');
});
test('tampered ciphertext fails without a restored directory or leftovers', async () => {
  const b = await seal(input, key); const file = path.join(b.bundleDir, '0.bin'); const bytes = fs.readFileSync(file); bytes[100] ^= 1; write(file, bytes);
  const to = path.join(temp, 'restored');
  await expect(inspect(b.bundleDir, key, to)).rejects.toThrow();
  expect(fs.existsSync(to)).toBe(false);
  expect(fs.readdirSync(temp).some(n => n.startsWith('.restore-'))).toBe(false);
});
test('refuses to overwrite keys, source or an existing restore destination', async () => {
  expect(() => initKey(key)).toThrow();
  const b = await seal(input, key);
  await expect(inspect(b.bundleDir, key, source)).rejects.toThrow('RESTORE_REQUIRES_NEW_DIRECTORY_OUTSIDE_BUNDLE');
  expect(fs.readFileSync(path.join(source, 'model.safetensors')).equals(plain)).toBe(true);
});
test.each(['../model.safetensors', '/model.safetensors', 'nested/../model.safetensors', 'model.pkl', 'dataset.json', 'secret.key', 'a\\b.safetensors'])('rejects unsafe or unselected artifact type %s', name => {
  return expect(seal({...input, files: [name]}, key)).rejects.toThrow();
});
test('refuses duplicate selections and mismatched lineage', async () => {
  await expect(seal({...input, files: ['config.json', 'config.json']}, key)).rejects.toThrow('DUPLICATE_ARTIFACT');
  await expect(seal({...input, index: {...input.index, artifactSha256: 'b'.repeat(64)}}, key)).rejects.toThrow('INDEX_PRIMARY_ARTIFACT_NOT_FOUND');
  expect(fs.readdirSync(store)).toEqual([]);
});
test('refuses symlinked files and directories', async () => {
  fs.symlinkSync(path.join(source, 'model.safetensors'), path.join(source, 'linked.safetensors'));
  await expect(seal({...input, files: ['linked.safetensors']}, key)).rejects.toThrow();
  const link = path.join(temp, 'linked-source'); fs.symlinkSync(source, link);
  await expect(seal({...input, sourceDir: link}, key)).rejects.toThrow('SYMLINK_DIRECTORY_REJECTED');
});
test('refuses hardlinks and group-readable keys', async () => {
  fs.linkSync(path.join(source, 'model.safetensors'), path.join(source, 'hard.safetensors'));
  await expect(seal(input, key)).rejects.toThrow('INVALID_CUSTODY_FILE');
  fs.chmodSync(key, 0o640);
  await expect(seal(input, key)).rejects.toThrow('OWNER_ONLY_PERMISSIONS_REQUIRED');
});
test('refuses publicly located or nonprivate destinations', async () => {
  await expect(seal({...input, storeDir: path.resolve(__dirname, '../public')}, key)).rejects.toThrow('CUSTODY_MUST_STAY_IN_PRIVATE_REPORTS');
  fs.chmodSync(store, 0o755);
  await expect(seal(input, key)).rejects.toThrow('OWNER_ONLY_PERMISSIONS_REQUIRED');
});
test('does not package raw datasets or create a network uploader', async () => {
  const help = await main(['help']);
  expect(help.boundary).toContain('NO_UPLOAD');
  await expect(main(['upload', '--bundle', source])).rejects.toThrow('INVALID_CUSTODY_ARGUMENTS');
});
test('refuses accidentally selecting the custody key as metadata', async () => {
  const misplacedKey = path.join(source, 'recipe.json');
  initKey(misplacedKey);
  await expect(seal({...input, files: [...input.files, 'recipe.json']}, misplacedKey)).rejects.toThrow('CUSTODY_KEY_MUST_NOT_BE_AN_ARTIFACT');
  expect(fs.readdirSync(store)).toEqual([]);
});

test('preserves recovery metadata as opaque bytes without executing templates', async () => {
  const names = ['tokenizer.json', 'tokenizer_config.json', 'chat_template.jinja', 'vocab.json', 'merges.txt', 'LICENSE', 'README.md'];
  for (const name of names) write(path.join(source, name), `INERT_FIXTURE_${name}`);
  const bundle = await seal({...input, files: [...input.files, ...names]}, key);
  const destination = path.join(temp, 'restored');
  await inspect(bundle.bundleDir, key, destination);
  for (const name of names) expect(fs.readFileSync(path.join(destination, name), 'utf8')).toBe(`INERT_FIXTURE_${name}`);
});

test.each(['optimizer.pt', 'rng_state.pth', 'training_args.bin', 'model.py', 'customer-data.jsonl', '.env', 'tokenizer.json.exe'])('recovery metadata support still rejects executable, raw or unselected content %s', name => {
  return expect(seal({...input, files: [name]}, key)).rejects.toThrow();
});
