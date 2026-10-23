'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createFoundry, dayInZone, digest } = require('../core/foundry/sheikha-visual-foundry.cjs');
const { componentSource } = require('../core/foundry/sheikha-visual-foundry-templates.cjs');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jA1sAAAAASUVORK5CYII=', 'base64');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-visual-'));
  const source = path.join(root, 'source'); fs.mkdirSync(source);
  const storage = path.join(root, 'vault');
  fs.writeFileSync(path.join(source, 'image.png 1'), png);
  fs.writeFileSync(path.join(source, 'duplicate.png'), png);
  fs.writeFileSync(path.join(source, 'review.html'), '<script>throw Error("NEVER_EXECUTE")</script>');
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { root, source, storage, foundry: createFoundry({ source, storage, watchIntervalMs: 100, debounceMs: 20 }) };
}
test('archives byte-exact versions, deduplicates content and never executes source documents', t => {
  const { source, storage, foundry } = fixture(t);
  const result = foundry.archive();
  assert.equal(result.catalog.assets.length, 3);
  assert.equal(result.guard.uniqueObjects, 2);
  for (const asset of result.catalog.assets) assert.equal(digest(path.join(source, asset.file)), digest(path.join(storage, asset.object)));
  assert.equal(result.catalog.assets.find(asset => asset.file.endsWith('html')).kind, 'document');
  assert.equal(result.catalog.assets.find(asset => asset.file.endsWith(' 1')).kind, 'image');
  assert.equal(fs.statSync(path.join(storage, 'catalog.json')).mode & 0o777, 0o600);
  const old = result.catalog.assets.find(asset => asset.file === 'image.png 1');
  fs.writeFileSync(path.join(source, 'image.png 1'), Buffer.concat([png, Buffer.from('version-2')]));
  const next = foundry.archive();
  assert.deepEqual(next.guard.changed, ['image.png 1']);
  assert.equal(digest(path.join(storage, old.object)), old.sha256);
  assert.equal(fs.readdirSync(path.join(storage, 'snapshots')).length, 2);
});
test('daily output is idempotent, does not invent generated media, and stays pending review', async t => {
  const { foundry, storage } = fixture(t);
  const date = new Date('2026-10-18T23:00:00Z');
  const first = foundry.daily(date); const second = foundry.daily(date);
  assert.equal(first.status, 'LOCAL_DRAFT_GENERATED'); assert.equal(second.status, 'EXISTING_VERIFIED');
  assert.equal(first.id, second.id); assert.match(first.id, /^2026-10-19-/);
  const brief = JSON.parse(fs.readFileSync(path.join(first.directory, 'brief.json')));
  assert.equal(brief.automaticPublishing, false); assert.equal(brief.review, 'PENDING_HUMAN_APPROVAL');
  assert.equal(brief.productionLines.find(line => line.id === 'visual').novelImagesGenerated, 0);
  assert.equal(brief.productionLines.find(line => line.id === 'motion').novelVideosGenerated, 0);
  assert.equal(brief.generationProvider, 'NOT_CONFIGURED');
  assert.equal(fs.readdirSync(path.join(storage, 'runs')).length, 1);
  await import('data:text/javascript;base64,' + Buffer.from(componentSource).toString('base64'));
});
test('missing originals remain on hold across repeated scans until restored', t => {
  const { foundry, source } = fixture(t); foundry.archive();
  const file = path.join(source, 'duplicate.png'); fs.unlinkSync(file);
  for (let i = 0; i < 2; i++) {
    const result = foundry.daily(); assert.equal(result.status, 'HOLD_SOURCE_REVIEW');
    assert.deepEqual(result.guard.missing, ['duplicate.png']);
  }
  fs.writeFileSync(file, png); assert.equal(foundry.daily().status, 'LOCAL_DRAFT_GENERATED');
});
test('review copy uses visual terminology while preserving technical media identifiers', t => {
  const { foundry } = fixture(t);
  const run = foundry.daily();
  const html = fs.readFileSync(path.join(run.directory, 'index.html'), 'utf8');
  const improvements = fs.readFileSync(path.join(run.directory, 'improvements.json'), 'utf8');
  assert.match(html, /data-filter="image" aria-pressed="false">المرئيات<\/button>/);
  assert.match(improvements, /لمرئيات وفيديوهات/);
  assert.doesNotMatch(html + improvements, /(?<![\p{L}])(?:صور|صورة|الصور|الصورة|لصور)(?![\p{L}])/u);
});
test('rejects source symlinks, corrupt archives and modified daily output', t => {
  const { foundry, source, storage, root } = fixture(t);
  fs.symlinkSync('/etc/passwd', path.join(source, 'link'));
  assert.equal(foundry.daily().status, 'HOLD_SOURCE_REVIEW'); fs.unlinkSync(path.join(source, 'link'));
  const daily = foundry.daily();
  const component = path.join(daily.directory, 'component.mjs'); fs.appendFileSync(component, '// changed');
  assert.throws(() => foundry.daily(), /OUTPUT_INTEGRITY_FAILED/);
  const catalog = JSON.parse(fs.readFileSync(path.join(storage, 'catalog.json')));
  fs.writeFileSync(path.join(storage, catalog.assets[0].object), 'corrupt');
  assert.throws(() => foundry.guard(), /ARCHIVE_INTEGRITY_FAILED/);
  fs.symlinkSync(source, path.join(root, 'source-link'));
  assert.throws(() => createFoundry({ source: path.join(root, 'source-link'), storage: path.join(root, 'second') }).archive(), /SYMLINK_DENIED/);
});
test('archive lock prevents concurrent writes and bounded storage rejects overflow', t => {
  const { root, foundry, source, storage } = fixture(t);
  fs.mkdirSync(path.join(storage, '.lock')); fs.writeFileSync(path.join(storage, '.lock/owner.json'), JSON.stringify({ pid: process.pid }));
  assert.throws(() => foundry.archive(), /FOUNDRY_BUSY/);
  assert.throws(() => createFoundry({ source, storage: path.join(root, 'tiny'), maxStorageBytes: 16 }).archive(), /STORAGE_LIMIT/);
  assert.throws(() => createFoundry({ source, storage: source }), /SOURCE_STORAGE_OVERLAP/);
  assert.throws(() => createFoundry({ source, storage, automaticPublishing: true }), /UNSUPPORTED_EXECUTION_POLICY/);
});
test('HTML escapes source filenames and session generation keeps provenance', t => {
  const { source, foundry, storage } = fixture(t);
  fs.writeFileSync(path.join(source, '<img onerror=alert(1)>.png'), png);
  const asset = foundry.importGenerated(path.join(source, 'duplicate.png'), { tool: 'built-in-image_gen', prompt: 'Architecture concept', references: [] });
  assert.equal(asset.kind, 'image'); assert.throws(() => foundry.importGenerated('missing', {}), /PROVENANCE_REQUIRED/);
  const run = foundry.daily(); const html = fs.readFileSync(path.join(run.directory, 'index.html'), 'utf8');
  assert.match(html, /&lt;img onerror=alert\(1\)&gt;/); assert.doesNotMatch(html, /<img onerror=/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(storage, 'generated.json')))[0].humanApproval, 'PENDING');
});
test('watch records live changes and reports stopped without pretending to run indefinitely', async t => {
  const { source, foundry, storage } = fixture(t); const stop = foundry.watch(); t.after(stop);
  assert.equal(foundry.status().watch.fresh, true);
  fs.writeFileSync(path.join(source, 'new.png'), png);
  const end = Date.now() + 3000;
  while (Date.now() < end && JSON.parse(fs.readFileSync(path.join(storage, 'catalog.json'))).assets.length !== 4) await new Promise(resolve => setTimeout(resolve, 40));
  assert.equal(JSON.parse(fs.readFileSync(path.join(storage, 'catalog.json'))).assets.length, 4);
  stop(); assert.equal(foundry.status().watch.fresh, false);
});
test('daily clock follows Riyadh across UTC midnight', () => {
  assert.equal(dayInZone(new Date('2026-10-18T22:00:00Z'), 'Asia/Riyadh'), '2026-10-19');
});
test('Foundry advertises actual local capabilities without claiming external generation or publication', () => {
  const { buildSheikhaFoundryStatus } = require('../runtime/sheikha-studio/core/sheikha-foundry-v1.js');
  const status = buildSheikhaFoundryStatus();
  assert.equal(status.visualProduction.automaticPublishing, false);
  assert.equal(status.visualProduction.scheduledNovelImageOrVideoGeneration, 'PROVIDER_NOT_CONFIGURED');
  assert.equal(status.visualProduction.physicalProductionActivated, false);
  assert.equal(status.executionStarted, false);
});
test('guard distinguishes cached metadata checks from full source and archive verification', t => {
  const { source, storage, foundry } = fixture(t);
  foundry.archive(); const cached = foundry.archive();
  assert.equal(cached.guard.verification, 'METADATA_AND_CHANGED_CONTENT_SHA256');
  assert.equal(foundry.guard().verification, 'FULL_SOURCE_SHA256');
  assert.equal(foundry.status().archiveIntegrity.decision, 'PASS_ARCHIVE_SHA256');
  const before = foundry.daily();
  const file = path.join(source, 'duplicate.png'); const now = new Date(); fs.utimesSync(file, now, now);
  assert.equal(foundry.daily().id, before.id);
  const catalog = JSON.parse(fs.readFileSync(path.join(storage, 'catalog.json')));
  const object = path.join(storage, catalog.assets[0].object);
  const bytes = fs.readFileSync(object); bytes[bytes.length - 1] ^= 1; fs.writeFileSync(object, bytes);
  assert.throws(() => foundry.guard(), /ARCHIVE_INTEGRITY_FAILED/);
});
