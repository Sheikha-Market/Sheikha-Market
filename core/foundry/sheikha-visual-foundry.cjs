'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { reviewPage, componentSource, componentStyles } = require('./sheikha-visual-foundry-templates.cjs');
const projectRoot = path.resolve(__dirname, '../..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const stamp = () => new Date().toISOString();
const json = value => JSON.stringify(value, null, 2) + '\n';
const THEMES = ['المنظومة والمعمارية', 'Sheikha OS / SQL', 'Foundry والإنتاج', 'البيئة والحياة', 'الحوكمة والتكامل', 'الجودة والتحسين', 'سوق شيخة'];

function safePath(file) {
  const absolute = path.resolve(file);
  let current = path.parse(absolute).root;
  for (const segment of absolute.slice(current.length).split(path.sep)) {
    current = path.join(current, segment);
    try { if (fs.lstatSync(current).isSymbolicLink()) throw Error('SYMLINK_DENIED'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return absolute;
}
function directory(dir) { safePath(dir); fs.mkdirSync(dir, { recursive: true, mode: 0o700 }); }
function atomic(file, data) {
  safePath(file); directory(path.dirname(file));
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  const fd = fs.openSync(temp, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
  try { fs.writeFileSync(fd, data); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  fs.renameSync(temp, file);
}
function readJson(file, fallback) {
  safePath(file);
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
function digest(file) {
  safePath(file);
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  const h = crypto.createHash('sha256'); const buffer = Buffer.alloc(1024 * 1024);
  try {
    if (!fs.fstatSync(fd).isFile()) throw Error('REGULAR_FILE_REQUIRED');
    let length; while ((length = fs.readSync(fd, buffer))) h.update(buffer.subarray(0, length));
    return h.digest('hex');
  } finally { fs.closeSync(fd); }
}
function mediaType(header) {
  if (header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { kind: 'image', ext: 'png' };
  if (header[0] === 255 && header[1] === 216 && header[2] === 255) return { kind: 'image', ext: 'jpg' };
  if (header.toString('ascii', 4, 8) === 'ftyp') return { kind: 'video', ext: 'mp4' };
  return { kind: 'document', ext: 'bin' };
}
function dayInZone(date, zone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function createFoundry(overrides = {}) {
  const config = { ...readJson(path.join(projectRoot, 'config/sheikha-visual-foundry.json')), ...overrides };
  config.source = path.resolve(config.source);
  config.storage = path.resolve(projectRoot, config.storage);
  if (config.source === config.storage || config.storage.startsWith(config.source + path.sep) || config.source.startsWith(config.storage + path.sep)) throw Error('SOURCE_STORAGE_OVERLAP');
  if (config.automaticPublishing !== false || config.automaticSourceEdits !== false || config.generationProvider !== 'NOT_CONFIGURED') throw Error('UNSUPPORTED_EXECUTION_POLICY');
  for (const key of ['maxFiles', 'maxFileBytes', 'maxStorageBytes', 'watchIntervalMs', 'debounceMs']) if (!Number.isSafeInteger(config[key]) || config[key] <= 0) throw Error('INVALID_LIMIT');
  dayInZone(new Date(), config.timezone);
  const at = (...parts) => path.join(config.storage, ...parts);
  directory(config.storage);
  fs.chmodSync(config.storage, 0o700);
  directory(at('objects')); directory(at('snapshots')); directory(at('runs'));

  function locked(work) {
    const lock = at('.lock'); safePath(lock);
    try { fs.mkdirSync(lock, { mode: 0o700 }); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const owner = readJson(path.join(lock, 'owner.json'), null);
      if (!Number.isSafeInteger(owner?.pid) || owner.pid < 1) throw Error('FOUNDRY_BUSY');
      try { process.kill(owner.pid, 0); throw Error('FOUNDRY_BUSY'); }
      catch (probe) { if (probe.code !== 'ESRCH') throw probe; }
      fs.unlinkSync(safePath(path.join(lock, 'owner.json'))); fs.rmdirSync(lock);
      fs.mkdirSync(lock, { mode: 0o700 });
    }
    atomic(path.join(lock, 'owner.json'), json({ pid: process.pid, startedAt: stamp() }));
    try { return work(); }
    finally { fs.unlinkSync(path.join(lock, 'owner.json')); fs.rmdirSync(lock); }
  }

  function usedBytes(dir = config.storage) {
    safePath(dir);
    return fs.readdirSync(dir, { withFileTypes: true }).reduce((sum, item) => {
      const file = path.join(dir, item.name); safePath(file);
      return sum + (item.isDirectory() ? usedBytes(file) : fs.lstatSync(file).size);
    }, 0);
  }

  function ingestFile(file, budget) {
    safePath(file);
    const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    const before = fs.fstatSync(fd);
    const temp = at('objects', `${crypto.randomUUID()}.tmp`);
    let out;
    try {
      if (!before.isFile() || before.size > config.maxFileBytes) throw Error('FILE_SIZE_OR_TYPE_DENIED');
      // Reserve the temporary copy as well as existing objects before writing.
      if (budget.bytes + before.size > config.maxStorageBytes) throw Error('STORAGE_LIMIT');
      out = fs.openSync(temp, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
      const buffer = Buffer.alloc(1024 * 1024); const h = crypto.createHash('sha256');
      let size = 0; let count; let type;
      while ((count = fs.readSync(fd, buffer))) {
        if (!type) type = mediaType(buffer.subarray(0, count));
        size += count; if (size > config.maxFileBytes || budget.bytes + size > config.maxStorageBytes) throw Error('STORAGE_LIMIT');
        h.update(buffer.subarray(0, count)); fs.writeFileSync(out, buffer.subarray(0, count));
      }
      const after = fs.fstatSync(fd);
      const current = fs.lstatSync(file);
      if (before.size !== size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs || current.ino !== after.ino || current.isSymbolicLink()) throw Error('SOURCE_CHANGED_DURING_COPY');
      fs.fsyncSync(out); fs.closeSync(out); out = null;
      const sha256 = h.digest('hex'); type ||= { kind: 'document', ext: 'bin' };
      const object = `objects/${sha256}.${type.ext}`; const target = at(object); safePath(target);
      if (fs.existsSync(target)) {
        if (digest(target) !== sha256) throw Error('ARCHIVE_INTEGRITY_FAILED');
        fs.unlinkSync(temp);
      } else { fs.renameSync(temp, target); budget.bytes += size; }
      return { sha256, bytes: size, kind: type.kind, object };
    } finally {
      fs.closeSync(fd); if (out != null) fs.closeSync(out);
      if (fs.existsSync(temp)) fs.unlinkSync(temp);
    }
  }

  function event(type, detail) {
    const file = at('events.jsonl'); safePath(file);
    if (fs.existsSync(file) && fs.statSync(file).size > 1048576) {
      for (let i = 3; i >= 1; i--) {
        const from = `${file}.${i}`; const to = `${file}.${i + 1}`;
        safePath(from); safePath(to);
        if (fs.existsSync(from)) fs.renameSync(from, to);
      }
      fs.renameSync(file, `${file}.1`);
    }
    fs.appendFileSync(file, JSON.stringify({ at: stamp(), type, ...detail }) + '\n', { mode: 0o600 });
  }

  function scan(full = false) {
    safePath(config.source);
    if (!fs.statSync(config.source).isDirectory()) throw Error('SOURCE_DIRECTORY_REQUIRED');
    const previous = readJson(at('catalog.json'), null);
    const old = new Map((previous?.assets || []).map(asset => [asset.file, asset]));
    const previousStats = new Map((previous?.sourceStats || []).map(entry => [entry.file, entry]));
    const sourceStats = [];
    const assets = []; const issues = []; const budget = { bytes: usedBytes() };
    let examined = 0;
    function walk(dir, relative = '', depth = 0) {
      if (depth > 12) throw Error('SOURCE_DEPTH_LIMIT');
      for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
        if (++examined > config.maxFiles) throw Error('SOURCE_FILE_LIMIT');
        const name = path.join(relative, entry.name); const file = path.join(dir, entry.name);
        if (entry.isSymbolicLink()) { issues.push({ file: name, reason: 'SYMLINK_DENIED' }); continue; }
        if (entry.isDirectory()) { safePath(file); walk(file, name, depth + 1); continue; }
        if (!entry.isFile()) { issues.push({ file: name, reason: 'REGULAR_FILE_REQUIRED' }); continue; }
        safePath(file);
        const stat = fs.lstatSync(file);
        const signature = { file: name, size: stat.size, mtimeMs: stat.mtimeMs, ctimeMs: stat.ctimeMs, ino: stat.ino };
        sourceStats.push(signature);
        const known = old.get(name);
        const unchanged = known && JSON.stringify(previousStats.get(name)) === JSON.stringify(signature);
        if (unchanged && (!full || digest(file) === known.sha256)) {
          if (!/^objects\/[a-f0-9]{64}\.(png|jpg|mp4|bin)$/.test(known.object)) throw Error('ARCHIVE_REFERENCE_DENIED');
          const stored = fs.lstatSync(safePath(at(known.object)));
          if (!stored.isFile() || stored.size !== known.bytes) throw Error('ARCHIVE_INTEGRITY_FAILED');
          assets.push(known);
        } else {
          const object = ingestFile(file, budget);
          assets.push({ file: name, ...object });
        }
      }
    }
    walk(config.source);
    const current = new Map(assets.map(asset => [asset.file, asset]));
    const added = assets.filter(asset => !old.has(asset.file)).map(asset => asset.file);
    const changed = assets.filter(asset => old.has(asset.file) && old.get(asset.file).sha256 !== asset.sha256).map(asset => asset.file);
    const missing = [...old.keys()].filter(file => !current.has(file));
    // A missing original stays expected on subsequent scans; a reappearance clears it.
    const unresolvedMissing = [...new Set([...(previous?.unresolvedMissing || []), ...missing])].filter(file => !current.has(file));
    const fingerprint = hash(json({ assets, issues, unresolvedMissing }));
    const catalog = { schema: 'SHEIKHA_VISUAL_CATALOG_V2', checkedAt: stamp(), source: config.source, fingerprint, assets, sourceStats, issues, unresolvedMissing };
    const guard = { checkedAt: stamp(), decision: issues.length || unresolvedMissing.length || !assets.length ? 'HOLD_SOURCE_REVIEW' : 'PASS_LOCAL_INTEGRITY', verification: full ? 'FULL_SOURCE_SHA256' : 'METADATA_AND_CHANGED_CONTENT_SHA256', assetCount: assets.length, uniqueObjects: new Set(assets.map(asset => asset.sha256)).size, added, changed, missing: unresolvedMissing, issues, originalsModified: false, published: false };
    if (previous?.fingerprint !== fingerprint) {
      const snapshot = at('snapshots', `${fingerprint}.json`);
      if (!fs.existsSync(snapshot)) atomic(snapshot, json(catalog));
      event('SOURCE_SNAPSHOT', { fingerprint, added, changed, missing: unresolvedMissing });
    }
    atomic(at('catalog.json'), json(catalog)); atomic(at('guard.json'), json(guard));
    return { catalog, guard };
  }

  function verifyObjects() {
    const bad = [];
    for (const name of fs.readdirSync(at('objects'))) {
      if (!/^[a-f0-9]{64}\.(png|jpg|mp4|bin)$/.test(name)) { bad.push(name); continue; }
      if (digest(at('objects', name)) !== name.slice(0, 64)) bad.push(name);
    }
    if (bad.length) throw Error('ARCHIVE_INTEGRITY_FAILED');
    const count = fs.readdirSync(at('objects')).length;
    atomic(at('integrity.json'), json({ checkedAt: stamp(), decision: 'PASS_ARCHIVE_SHA256', archivedObjectsVerified: count }));
    return count;
  }

  function generatedAssets() { return readJson(at('generated.json'), []); }

  function pointToLatest(id, dir) {
    atomic(at('latest.json'), json({ id, directory: dir, checkedAt: stamp(), status: 'DRAFT_REQUIRES_REVIEW' }));
    atomic(at('index.html'), `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=runs/${id}/index.html"><title>فوندري شيخة</title><a href="runs/${id}/index.html">حزمة شيخة الحالية</a></html>\n`);
  }

  function daily(date = new Date()) {
    return locked(() => {
      const { catalog, guard } = scan(true); verifyObjects();
      if (guard.decision !== 'PASS_LOCAL_INTEGRITY') return { status: 'HOLD_SOURCE_REVIEW', guard };
      const day = dayInZone(date, config.timezone);
      const theme = THEMES[new Date(day + 'T12:00:00Z').getUTCDay()];
      const generated = generatedAssets();
      const recipe = hash(Buffer.concat([fs.readFileSync(__filename), fs.readFileSync(require.resolve('./sheikha-visual-foundry-templates.cjs'))]));
      const id = `${day}-${hash(json({ fingerprint: catalog.fingerprint, recipe, generated })).slice(0, 16)}`;
      const dir = at('runs', id);
      if (fs.existsSync(dir)) {
        const evidence = readJson(path.join(dir, 'checksums.json'));
        for (const [file, expected] of Object.entries(evidence)) {
          if (!/^[a-z][a-z0-9.-]*$/.test(file) || digest(path.join(dir, file)) !== expected) throw Error('OUTPUT_INTEGRITY_FAILED');
        }
        pointToLatest(id, dir);
        return { status: 'EXISTING_VERIFIED', id, directory: dir, novelImagesGenerated: 0, published: false };
      }
      if (usedBytes() + 1048576 > config.maxStorageBytes) throw Error('STORAGE_LIMIT');
      const duplicateCount = catalog.assets.length - guard.uniqueObjects;
      const improvements = [
        { id: 'human-visual-review', state: 'PENDING_REVIEW', action: 'مراجعة النصوص العربية والتكوين والهوية قبل الاعتماد.' },
        { id: 'responsive-ui', state: 'PENDING_BROWSER_REVIEW', action: 'فحص المكون على الجوال وسطح المكتب وإمكانية الوصول.' },
        { id: 'rights', state: 'PENDING_REVIEW', action: 'تأكيد الحقوق والتراخيص قبل الاستخدام التجاري.' },
        { id: 'provider', state: 'BLOCKED_CONFIGURATION', action: 'التوليد الآلي لمرئيات وفيديوهات جديدة يحتاج مزودًا وميزانية معتمدين.' }
      ];
      if (duplicateCount) improvements.push({ id: 'duplicate-assets', state: 'OBSERVED', count: duplicateCount, action: 'نسخ متطابقة محفوظة بأسمائها، وتخزين المحتوى مرة واحدة.' });
      const brief = { schema: 'SHEIKHA_DAILY_VISUAL_AND_UI_DRAFT', id, date: day, timezone: config.timezone, theme, recipe, catalogFingerprint: catalog.fingerprint, createdAt: stamp(), review: 'PENDING_HUMAN_APPROVAL', productionLines: [
        { id: 'archive', state: 'LOCAL_HASH_VERIFIED', files: catalog.assets.length },
        { id: 'visual', state: 'REFERENCE_BOARD_AND_GENERATION_BRIEF', novelImagesGenerated: 0, availableSessionGeneratedImages: generated.length },
        { id: 'motion', state: 'EXISTING_VIDEO_REFERENCES_AND_SHOT_LIST', novelVideosGenerated: 0 },
        { id: 'ui', state: 'LOCAL_COMPONENT_DRAFT_GENERATED', automaticCodePromotion: false },
        { id: 'watch', state: 'SEE_FRESH_HEARTBEAT_NOT_THIS_BUILD' },
        { id: 'guard', state: guard.decision }
      ], generationProvider: config.generationProvider, prompt: `Create a new Sheikha ${theme} architectural concept. Emerald glass, restrained gold details, clear natural light, visible real-world design and production elements. No claims of actual facilities, no government emblems, no text, no people. Landscape 16:9. Use only approved references.`, improvements, automaticPublishing: false, originalsModified: false, externalRequests: 0 };
      const motion = { status: 'SHOT_LIST_ONLY_NOT_RENDERED', durationSeconds: 15, shots: [
        { seconds: [0, 5], view: 'Wide campus approach', motion: 'Slow lateral movement' },
        { seconds: [5, 10], view: 'Design and production detail', motion: 'Gentle forward movement' },
        { seconds: [10, 15], view: 'Water, landscape and integrated buildings', motion: 'Slow pullback' }
      ], referenceVideos: catalog.assets.filter(asset => asset.kind === 'video'), autoplay: false, audioGeneration: false, humanApprovalRequired: true };
      const stage = at('runs', `.pending-${crypto.randomUUID()}`); directory(stage);
      try {
        const contents = {
          'brief.json': json(brief), 'motion-plan.json': json(motion),
          'improvements.json': json(improvements),
          'review.json': json({ status: 'PENDING', reviewer: null, published: false, checks: ['Arabic text', 'visual identity', 'rights', 'mobile layout', 'accessibility', 'concept label'] }),
          'component.mjs': componentSource, 'component.css': componentStyles,
          'index.html': reviewPage(brief, [...generated.map(asset => ({ ...asset, generated: true })), ...catalog.assets])
        };
        const checksums = {};
        for (const [name, content] of Object.entries(contents)) { atomic(path.join(stage, name), content); checksums[name] = hash(content); }
        atomic(path.join(stage, 'checksums.json'), json(checksums));
        fs.renameSync(stage, dir);
      } catch (error) { fs.rmSync(stage, { recursive: true, force: true }); throw error; }
      pointToLatest(id, dir);
      event('DAILY_DRAFT', { id, novelImagesGenerated: 0, novelVideosGenerated: 0, published: false });
      return { status: 'LOCAL_DRAFT_GENERATED', id, directory: dir, novelImagesGenerated: 0, published: false };
    });
  }

  function archive() { return locked(() => scan()); }
  function guard() {
    return locked(() => {
      const result = scan(true);
      result.guard.archivedObjectsVerified = verifyObjects();
      atomic(at('guard.json'), json(result.guard));
      return result.guard;
    });
  }
  function importGenerated(file, provenance) {
    if (typeof provenance?.prompt !== 'string' || !provenance.prompt || provenance.tool !== 'built-in-image_gen') throw Error('PROVENANCE_REQUIRED');
    return locked(() => {
      const asset = ingestFile(path.resolve(file), { bytes: usedBytes() });
      if (asset.kind !== 'image') throw Error('GENERATED_IMAGE_REQUIRED');
      const all = generatedAssets();
      if (!all.some(item => item.sha256 === asset.sha256)) {
        all.push({ file: path.basename(file), ...asset, generatedAt: stamp(), provenance, humanApproval: 'PENDING', conceptual: true });
        atomic(at('generated.json'), json(all));
      }
      return asset;
    });
  }
  function recordError(error) {
    const failure = { checkedAt: stamp(), decision: 'HOLD_MONITOR_ERROR', error: error.code || error.message, published: false };
    atomic(at('guard.json'), json(failure));
    if (error.message === 'ARCHIVE_INTEGRITY_FAILED') atomic(at('integrity.json'), json(failure));
    event('HOLD', failure); return failure;
  }
  function status() {
    const heartbeat = readJson(at('watch.json'), null);
    let pidAlive = false; let processProbe = 'NOT_OBSERVED';
    if (Number.isSafeInteger(heartbeat?.pid) && heartbeat.pid > 0) {
      try { process.kill(heartbeat.pid, 0); pidAlive = true; processProbe = 'RUNNING'; }
      catch (error) { processProbe = error.code === 'EPERM' ? 'UNAVAILABLE' : 'NOT_RUNNING'; }
    }
    const age = heartbeat ? Date.now() - Date.parse(heartbeat.at) : Infinity;
    return { schema: config.schema, source: config.source, storage: config.storage,
      watch: { ...heartbeat, processProbe, fresh: pidAlive && age >= 0 && age < config.watchIntervalMs * 2.5 && heartbeat.state === 'RUNNING' },
      guard: readJson(at('guard.json'), null), archiveIntegrity: readJson(at('integrity.json'), null), latest: readJson(at('latest.json'), null),
      schedule: { time: config.dailyTime, timezone: config.timezone, activation: 'VERIFY_SYSTEMD_USER_TIMER' },
      generatedImageCount: generatedAssets().length, generationProvider: config.generationProvider,
      automaticPublishing: false, automaticSourceEdits: false };
  }
  function watch() {
    let stopped = false; let debounce; let watcher; let busy = false;
    function pulse(reason) {
      if (stopped || busy) return;
      busy = true;
      try {
        const previous = readJson(at('catalog.json'), null);
        const { catalog, guard: checked } = archive();
        const changed = previous?.fingerprint !== catalog.fingerprint;
        const integrityHeld = readJson(at('integrity.json'), null)?.decision.startsWith('HOLD');
        const result = checked.decision !== 'PASS_LOCAL_INTEGRITY' ? { status: 'HOLD_SOURCE_REVIEW' }
          : integrityHeld ? { status: 'HOLD_ARCHIVE_INTEGRITY' }
            : changed || !readJson(at('latest.json'), null) ? daily() : { status: 'SOURCE_RECONCILED' };
        atomic(at('watch.json'), json({ pid: process.pid, at: stamp(), state: result.status.startsWith('HOLD') ? 'HOLD' : 'RUNNING', reason, result: result.status, intervalMs: config.watchIntervalMs }));
      } catch (error) {
        if (error.message !== 'FOUNDRY_BUSY') recordError(error);
        atomic(at('watch.json'), json({ pid: process.pid, at: stamp(), state: error.message === 'FOUNDRY_BUSY' ? 'BUSY' : 'HOLD', reason, error: error.code || error.message }));
      } finally { busy = false; }
    }
    try {
      safePath(config.source);
      watcher = fs.watch(config.source, { recursive: true }, () => {
        clearTimeout(debounce); debounce = setTimeout(() => pulse('SOURCE_EVENT'), config.debounceMs);
      });
      watcher.on('error', error => { recordError(error); watcher.close(); });
    } catch (error) { recordError(error); }
    pulse('START');
    const interval = setInterval(() => pulse('RECONCILE'), config.watchIntervalMs);
    return () => {
      if (stopped) return;
      stopped = true; clearInterval(interval); clearTimeout(debounce); watcher?.close();
      atomic(at('watch.json'), json({ pid: process.pid, at: stamp(), state: 'STOPPED' }));
    };
  }
  return { config, archive, guard, daily, importGenerated, status, watch, recordError };
}
module.exports = { createFoundry, dayInZone, mediaType, digest, safePath };
