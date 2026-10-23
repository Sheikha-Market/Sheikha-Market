'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

// Shared bounded storage for historical snapshots and their separate review journals.
function createPrivateStore({ root, limits, prefix }) {
  root = path.resolve(root);
  const owner = process.getuid();
  let locked = false;
  const fail = code => { throw Error(`${prefix}_${code}`); };
  const validId = id => { if (typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id)) fail('INPUT_REJECTED'); };
  function directory(create = false) {
    let current = path.parse(root).root, missing = false;
    for (const part of root.slice(current.length).split(path.sep).filter(Boolean)) {
      current = path.join(current, part);
      try { if (!fs.lstatSync(current).isDirectory()) fail('UNAVAILABLE'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; missing = true; break; }
    }
    if (missing && !create) return false;
    if (missing) { fs.mkdirSync(root, { recursive: true, mode: 0o700 }); return directory(); }
    const stat = fs.lstatSync(root);
    if (stat.uid !== owner || (stat.mode & 0o077) !== 0) fail('UNAVAILABLE');
    return true;
  }
  function entries() {
    if (!directory()) return [];
    const dir = fs.opendirSync(root), names = [];
    try {
      let entry;
      while ((entry = dir.readSync())) {
        if (names.length >= limits.directoryEntries) fail('CAPACITY_LIMIT');
        names.push(entry.name);
      }
    } finally { dir.closeSync(); }
    return names;
  }
  function read(id) {
    validId(id);
    if (!directory()) fail('NOT_FOUND');
    let fd;
    try {
      fd = fs.openSync(path.join(root, `${id}.json`), fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
      const before = fs.fstatSync(fd, { bigint: true });
      if (!before.isFile() || before.nlink !== 1n || before.uid !== BigInt(owner) || (before.mode & 0o077n) !== 0n
        || before.size < 1n || before.size > BigInt(limits.bytes)) fail('RECORD_REJECTED');
      const buffer = Buffer.alloc(Number(before.size) + 1);
      let length = 0, n;
      while (length < buffer.length && (n = fs.readSync(fd, buffer, length, buffer.length - length, null))) length += n;
      const after = fs.fstatSync(fd, { bigint: true });
      if (length !== Number(before.size) || ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs'].some(k => before[k] !== after[k])) fail('RECORD_REJECTED');
      return JSON.parse(buffer.subarray(0, length).toString('utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') fail('NOT_FOUND');
      fail('RECORD_REJECTED');
    } finally { if (fd !== undefined) fs.closeSync(fd); }
  }
  function withLock(fn) {
    directory(true);
    const lock = path.join(root, '.write-lock');
    try { fs.mkdirSync(lock, { mode: 0o700 }); }
    catch (error) { if (error.code === 'EEXIST') fail('BUSY'); throw error; }
    locked = true;
    try { return fn(); }
    finally { locked = false; fs.rmdirSync(lock); }
  }
  function write(id, record, { replace = false } = {}) {
    validId(id);
    if (!locked) fail('BUSY');
    const bytes = Buffer.from(JSON.stringify(record) + '\n');
    if (bytes.length > limits.bytes) fail('INPUT_REJECTED');
    const names = entries(), file = `${id}.json`;
    if (names.includes(file)) {
      if (!replace) fail('BUSY');
      read(id); // Refuse to replace links, special files or unreadable records.
    } else if (names.filter(n => n !== '.write-lock').length >= limits.records) fail('CAPACITY_LIMIT');
    let temp = path.join(root, `.${randomUUID()}.tmp`), fd;
    try {
      fd = fs.openSync(temp, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
      fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); fs.closeSync(fd); fd = undefined;
      if (replace) fs.renameSync(temp, path.join(root, file));
      else { fs.linkSync(temp, path.join(root, file)); fs.unlinkSync(temp); }
      temp = undefined;
      const dir = fs.openSync(root, fs.constants.O_RDONLY | fs.constants.O_DIRECTORY | fs.constants.O_NOFOLLOW);
      try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); }
    } finally {
      if (fd !== undefined) fs.closeSync(fd);
      if (temp) fs.unlinkSync(temp);
    }
  }
  return { read, write, entries, withLock };
}
module.exports = { createPrivateStore };
