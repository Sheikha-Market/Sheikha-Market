'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const DAY = 86400000;
const SCHEMA = 'SHEIKHA_EXPLICIT_WORKSPACE_MEMORY_V1';

function noLinks(target) {
  let current = path.resolve(target);
  while (true) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('MEMORY_LINK_DENIED');
    const parent = path.dirname(current); if (parent === current) return;
    current = parent;
  }
}
function privateStat(stat, directory = false) {
  if ((directory ? !stat.isDirectory() : !stat.isFile() || stat.nlink !== 1) ||
      (stat.mode & 0o077) !== 0 || (process.getuid && stat.uid !== process.getuid())) throw Error('MEMORY_PRIVATE_PERMISSIONS_REQUIRED');
}

class CognitiveMemory {
  constructor({ directory = path.join(os.homedir(), '.local/share/sheikha-cognition/v1'), now = () => Date.now() } = {}) {
    if (!path.isAbsolute(directory)) throw Error('MEMORY_ABSOLUTE_DIRECTORY_REQUIRED');
    this.directory = directory; this.now = now;
  }
  scope(workspace) {
    if (!path.isAbsolute(workspace) || !fs.statSync(workspace).isDirectory()) throw Error('MEMORY_WORKSPACE_REQUIRED');
    return sha(fs.realpathSync(workspace));
  }
  file(workspace) { return path.join(this.directory, this.scope(workspace) + '.json'); }
  read(workspace) {
    const scope = this.scope(workspace); const file = this.file(workspace);
    noLinks(this.directory);
    if (!fs.existsSync(this.directory)) return { schema: SCHEMA, scope, revision: 0, records: [] };
    privateStat(fs.lstatSync(this.directory), true);
    let fd;
    try { fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW); }
    catch (error) { if (error.code === 'ENOENT') return { schema: SCHEMA, scope, revision: 0, records: [] }; throw error; }
    let state;
    try {
      const stat = fs.fstatSync(fd); privateStat(stat);
      if (stat.size > 1024 * 1024) throw Error('MEMORY_SIZE_LIMIT');
      state = JSON.parse(fs.readFileSync(fd, 'utf8'));
    } finally { fs.closeSync(fd); }
    if (!state || state.schema !== SCHEMA || state.scope !== scope || !Number.isSafeInteger(state.revision) || state.revision < 1 ||
        !Array.isArray(state.records) || state.records.length > 100 || new Set(state.records.map(r => r.id)).size !== state.records.length ||
        state.records.some(r => !r || !/^[a-f0-9-]{36}$/.test(r.id) || typeof r.title !== 'string' || !r.title.trim() || r.title.length > 100 ||
          typeof r.text !== 'string' || !r.text.trim() || r.text.length > 2000 || r.sha256 !== sha(r.text) ||
          !Number.isSafeInteger(r.createdAt) || !Number.isSafeInteger(r.expiresAt) || r.expiresAt <= r.createdAt || r.expiresAt > r.createdAt + 90 * DAY ||
          r.source !== 'USER_APPROVED_NOTE' || r.trustedAsInstructions !== false)) throw Error('MEMORY_INVALID_STATE');
    return state;
  }
  list(workspace, query = '') {
    if (typeof query !== 'string' || query.length > 200) throw Error('MEMORY_QUERY_LIMIT');
    const terms = query.toLocaleLowerCase().split(/\s+/u).filter(Boolean);
    return this.read(workspace).records.filter(r => r.expiresAt > this.now())
      .filter(r => terms.every(term => (r.title + ' ' + r.text).toLocaleLowerCase().includes(term)));
  }
  update(workspace, change) {
    noLinks(this.directory);
    fs.mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    privateStat(fs.lstatSync(this.directory), true);
    const file = this.file(workspace); const lock = file + '.lock'; let lockFd;
    try { lockFd = fs.openSync(lock, 'wx', 0o600); } catch { throw Error('MEMORY_BUSY_OR_UNSAFE_LOCK'); }
    const temporary = file + '.' + crypto.randomUUID() + '.tmp';
    try {
      const state = this.read(workspace);
      state.records = state.records.filter(r => r.expiresAt > this.now());
      change(state); state.revision += 1;
      const fd = fs.openSync(temporary, 'wx', 0o600);
      try { fs.writeFileSync(fd, JSON.stringify(state)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
      fs.renameSync(temporary, file);
      const directoryFd = fs.openSync(this.directory, 'r');
      try { fs.fsyncSync(directoryFd); } finally { fs.closeSync(directoryFd); }
      return state;
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
      fs.closeSync(lockFd); fs.unlinkSync(lock);
    }
  }
  save(workspace, { title, text, days = 30, consent }) {
    if (consent !== true || typeof title !== 'string' || !title.trim() || title.length > 100 ||
        typeof text !== 'string' || !text.trim() || text.length > 2000 || !Number.isInteger(days) || days < 1 || days > 90) throw Error('EXPLICIT_BOUNDED_MEMORY_REQUIRED');
    const record = { id: crypto.randomUUID(), title, text, createdAt: this.now(), expiresAt: this.now() + days * DAY,
      source: 'USER_APPROVED_NOTE', sha256: sha(text), trustedAsInstructions: false };
    this.update(workspace, state => { if (state.records.length >= 100) throw Error('MEMORY_RECORD_LIMIT'); state.records.push(record); });
    return record;
  }
  forget(workspace, id, consent) {
    if (consent !== true || typeof id !== 'string') throw Error('EXPLICIT_MEMORY_REMOVAL_REQUIRED');
    this.update(workspace, state => {
      if (!state.records.some(r => r.id === id)) throw Error('MEMORY_RECORD_NOT_FOUND');
      state.records = state.records.filter(r => r.id !== id);
    });
  }
}

module.exports = { CognitiveMemory, sha };
