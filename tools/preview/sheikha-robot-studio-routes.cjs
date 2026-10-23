'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const studio = require('../../core/robotics/sheikha-design-studio.cjs');
const { preflight } = require('../media/sheikha-robot-render.cjs');
const ROOT = path.resolve(__dirname, '../..');
const ID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const ARTIFACTS = new Set(['video.mp4', 'poster.png', 'blueprint.json', 'evidence.json']);

function createStudio({ storage = path.join(ROOT, 'runtime/robot-studio'), renderWorker } = {}) {
  let running = false, worker = null, dependencyState, activeId = null;
  function safeDirectory(directory) {
    const info = fs.lstatSync(directory); if (!info.isDirectory() || info.isSymbolicLink()) throw Error('STORAGE_REJECTED');
  }
  function ensure() { fs.mkdirSync(storage, { recursive: true }); safeDirectory(storage); }
  function save(folder, job) {
    const temp = path.join(folder, 'job.tmp.json'); fs.writeFileSync(temp, JSON.stringify(job, null, 2) + '\n'); fs.renameSync(temp, path.join(folder, 'job.json'));
  }
  function read(id) {
    if (!ID.test(id)) throw Error('ID_REJECTED');
    safeDirectory(storage); const folder = path.join(storage, id); safeDirectory(folder);
    const file = path.join(folder, 'job.json'), info = fs.lstatSync(file);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 65536) throw Error('JOB_REJECTED');
    const job = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (job.status === 'RENDERING' && id !== activeId) job.status = 'WORKER_UNVERIFIED';
    return job;
  }
  function jobs() {
    if (!fs.existsSync(storage)) return [];
    safeDirectory(storage);
    return fs.readdirSync(storage).filter(id => ID.test(id)).slice(0, 24).map(id => { try { return read(id); } catch { return null; } }).filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  function ready() { if (!dependencyState) dependencyState = preflight(); return dependencyState; }
  function run(folder, origin) {
    if (renderWorker) return renderWorker(folder, origin);
    return new Promise((resolve, reject) => {
      // The URL, worker and output folder are server-owned, never caller supplied.
      worker = spawn(process.execPath, [path.join(ROOT, 'tools/media/sheikha-robot-render.cjs'), folder, origin], {
        cwd: ROOT, stdio: 'ignore', detached: true, env: { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: '/tmp',
          ...(process.env.FFMPEG ? { FFMPEG: process.env.FFMPEG } : {}), ...(process.env.FFPROBE ? { FFPROBE: process.env.FFPROBE } : {}),
          ...(process.env.LD_LIBRARY_PATH ? { LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH } : {}),
          ...(process.env.CHROME_PATH ? { CHROME_PATH: process.env.CHROME_PATH } : {}),
          ...(process.env.PLAYWRIGHT_MODULE ? { PLAYWRIGHT_MODULE: process.env.PLAYWRIGHT_MODULE } : {}) }
      });
      const timer = setTimeout(() => { if (worker?.pid) { try { process.kill(-worker.pid, 'SIGKILL'); } catch {} } }, 180000);
      worker.once('error', error => { clearTimeout(timer); reject(error); });
      worker.once('exit', code => { clearTimeout(timer); worker = null; code === 0 ? resolve() : reject(Error('RENDER_FAILED')); });
    });
  }
  function submit(input, origin) {
    const design = studio.buildDesign(input);
    if (running) throw Error('RENDER_BUSY');
    if (!renderWorker && !ready().available) throw Error('RENDER_DEPENDENCIES_UNAVAILABLE');
    ensure();
    const ids = fs.readdirSync(storage).filter(id => ID.test(id));
    if (ids.length >= 24) throw Error('LOCAL_JOB_QUOTA_REACHED');
    let bytes = 0;
    for (const id of ids) { const folder = path.join(storage, id); safeDirectory(folder); for (const entry of fs.readdirSync(folder)) { const info = fs.lstatSync(path.join(folder, entry)); if (info.isFile()) bytes += info.size; } }
    if (bytes > 256 * 1024 * 1024) throw Error('LOCAL_STORAGE_QUOTA_REACHED');
    const lockPath = path.join(storage, '.render.lock');
    let lock;
    try { lock = fs.openSync(lockPath, 'wx'); } catch { throw Error('RENDER_LOCKED'); }
    running = true;
    const id = crypto.randomUUID(), folder = path.join(storage, id);
    activeId = id;
    const job = { id, designId: design.id, family: input.family, title: design.title, createdAt: new Date().toISOString(), status: 'RENDERING', provider: 'sheikha-local', reviewApproved: false, physicalCommandSent: false };
    try { fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, jobId: id, createdAt: new Date().toISOString() })); fs.mkdirSync(folder); fs.writeFileSync(path.join(folder, 'blueprint.json'), JSON.stringify(design, null, 2) + '\n', { flag: 'wx' }); save(folder, job); }
    catch (error) { fs.closeSync(lock); fs.unlinkSync(lockPath); running = false; activeId = null; throw error; }
    run(folder, origin).then(() => {
      const evidence = JSON.parse(fs.readFileSync(path.join(folder, 'evidence.json'), 'utf8'));
      if (evidence.designId !== design.id || evidence.fullDecode !== 'PASS' || evidence.userApproved !== false) throw Error('EVIDENCE_REJECTED');
      const video = fs.readFileSync(path.join(folder, 'video.mp4'));
      if (crypto.createHash('sha256').update(video).digest('hex') !== evidence.sha256) throw Error('VIDEO_HASH_MISMATCH');
      job.status = 'DRAFT_REQUIRES_HUMAN_REVIEW'; job.evidence = evidence;
    }).catch(() => { job.status = 'FAILED'; job.error = 'LOCAL_RENDER_FAILED'; }).finally(() => {
      job.completedAt = new Date().toISOString();
      try { save(folder, job); } catch { /* A retained lock prevents another render after an evidence-write failure. */ return; }
      finally { fs.closeSync(lock); running = false; activeId = null; }
      try { fs.unlinkSync(lockPath); } catch { /* A retained lock fails closed. */ }
    });
    return job;
  }
  function attach(app, base) {
    app.get(`${base}/studio`, (_req, res) => { try { res.json({ ...studio.catalog(), renderer: ready(), busy: running, jobs: jobs(), jobLimit: 24 }); } catch { res.status(503).json({ error: 'STUDIO_UNAVAILABLE' }); } });
    for (const [route, fn] of [['design', studio.buildDesign], ['exchange', studio.exchange]]) app.post(`${base}/studio/${route}`, (req, res) => {
      try { res.json(fn(req.body)); } catch { res.status(400).json({ error: 'DESIGN_REJECTED' }); }
    });
    app.post(`${base}/studio/receipt`, (req, res) => {
      try {
        if (!req.body || Object.keys(req.body).sort().join(',') !== 'design,receipt') throw Error('INVALID');
        res.json(studio.checkReceipt(req.body.receipt, studio.buildDesign(req.body.design).id));
      } catch { res.status(400).json({ error: 'RECEIPT_REJECTED' }); }
    });
    app.post(`${base}/studio/render`, (req, res) => {
      try { res.status(202).json(submit(req.body, `http://127.0.0.1:${req.socket.localPort}`)); }
      catch (error) { const allowed = ['RENDER_BUSY', 'RENDER_LOCKED', 'RENDER_DEPENDENCIES_UNAVAILABLE', 'LOCAL_JOB_QUOTA_REACHED', 'LOCAL_STORAGE_QUOTA_REACHED']; res.status(allowed.includes(error.message) ? 409 : 400).json({ error: allowed.includes(error.message) ? error.message : 'DESIGN_REJECTED' }); }
    });
    app.get(`${base}/studio/jobs/:id`, (req, res) => { try { res.json(read(req.params.id)); } catch { res.status(404).json({ error: 'JOB_NOT_FOUND' }); } });
    app.get(`${base}/studio/jobs/:id/:file`, (req, res) => {
      try {
        const job = read(req.params.id); if (!ARTIFACTS.has(req.params.file) || job.status !== 'DRAFT_REQUIRES_HUMAN_REVIEW') throw Error('DENIED');
        const file = path.join(storage, req.params.id, req.params.file), info = fs.lstatSync(file);
        if (!info.isFile() || info.isSymbolicLink()) throw Error('DENIED');
        res.sendFile(file);
      } catch { res.status(404).json({ error: 'ARTIFACT_UNAVAILABLE' }); }
    });
    app.post(`${base}/studio/physical-command`, (_req, res) => res.status(403).json({ error: 'PHYSICAL_DRIVER_NOT_CONFIGURED', physicalCommandSent: false }));
  }
  return { attach, jobs, read, submit, ready, busy: () => running };
}
module.exports = { createStudio };
