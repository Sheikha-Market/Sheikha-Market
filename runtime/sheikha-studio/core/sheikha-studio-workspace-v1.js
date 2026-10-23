'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const DENIED_SEGMENTS = new Set(['.git', 'node_modules', '.secrets']);

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function createWorkspaceError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

class SheikhaStudioWorkspace {
  constructor({ root, writeEnabled = false, maxFileBytes = MAX_FILE_BYTES } = {}) {
    if (!root) throw createWorkspaceError('WORKSPACE_ROOT_REQUIRED', 'Workspace root is required');
    this.root = fs.realpathSync(root);
    this.writeEnabled = writeEnabled === true;
    this.maxFileBytes = maxFileBytes;
  }

  status() {
    return {
      system: 'SHEIKHA_STUDIO_WORKSPACE_V1',
      root: '.',
      readEnabled: true,
      writeEnabled: this.writeEnabled,
      maxFileBytes: this.maxFileBytes,
      pathEscapeDenied: true,
      symlinkEscapeDenied: true,
      optimisticConcurrencyRequired: true,
    };
  }

  normalize(relativePath = '.') {
    const value = String(relativePath || '.').replaceAll('\\', '/');
    if (path.posix.isAbsolute(value)) {
      throw createWorkspaceError('ABSOLUTE_PATH_DENIED', 'Absolute paths are not allowed', 403);
    }
    const normalized = path.posix.normalize(value);
    const segments = normalized.split('/').filter(Boolean);
    if (normalized === '..' || normalized.startsWith('../')) {
      throw createWorkspaceError('PATH_ESCAPE_DENIED', 'Path escapes the workspace', 403);
    }
    if (segments.some((segment) => DENIED_SEGMENTS.has(segment) || segment === '.env')) {
      throw createWorkspaceError('SENSITIVE_PATH_DENIED', 'Sensitive workspace path is not available', 403);
    }
    return normalized === '' ? '.' : normalized;
  }

  resolve(relativePath = '.', { mustExist = true } = {}) {
    const normalized = this.normalize(relativePath);
    const target = path.resolve(this.root, normalized);
    if (target !== this.root && !target.startsWith(`${this.root}${path.sep}`)) {
      throw createWorkspaceError('PATH_ESCAPE_DENIED', 'Path escapes the workspace', 403);
    }
    if (mustExist) {
      let realTarget;
      try {
        realTarget = fs.realpathSync(target);
      } catch (error) {
        if (error.code === 'ENOENT') {
          throw createWorkspaceError('WORKSPACE_PATH_NOT_FOUND', 'Workspace path was not found', 404);
        }
        throw error;
      }
      if (realTarget !== this.root && !realTarget.startsWith(`${this.root}${path.sep}`)) {
        throw createWorkspaceError('SYMLINK_ESCAPE_DENIED', 'Symlink escapes the workspace', 403);
      }
      return { normalized, target: realTarget };
    }
    const parent = fs.realpathSync(path.dirname(target));
    if (parent !== this.root && !parent.startsWith(`${this.root}${path.sep}`)) {
      throw createWorkspaceError('SYMLINK_ESCAPE_DENIED', 'Parent path escapes the workspace', 403);
    }
    return { normalized, target };
  }

  list(relativePath = '.') {
    const { normalized, target } = this.resolve(relativePath);
    const stat = fs.statSync(target);
    if (!stat.isDirectory()) {
      throw createWorkspaceError('DIRECTORY_REQUIRED', 'Workspace path is not a directory');
    }
    const entries = fs.readdirSync(target, { withFileTypes: true })
      .filter((entry) => !DENIED_SEGMENTS.has(entry.name) && entry.name !== '.env')
      .map((entry) => ({
        name: entry.name,
        path: normalized === '.' ? entry.name : `${normalized}/${entry.name}`,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
      }))
      .sort((left, right) => Number(right.isDirectory) - Number(left.isDirectory)
        || left.name.localeCompare(right.name));
    return { path: normalized, entries };
  }

  read(relativePath) {
    const { normalized, target } = this.resolve(relativePath);
    const stat = fs.statSync(target);
    if (!stat.isFile()) throw createWorkspaceError('FILE_REQUIRED', 'Workspace path is not a file');
    if (stat.size > this.maxFileBytes) {
      throw createWorkspaceError('FILE_TOO_LARGE', 'File exceeds the workspace read limit', 413);
    }
    const content = fs.readFileSync(target, 'utf8');
    return {
      path: normalized,
      content,
      size: stat.size,
      mode: stat.mode & 0o777,
      sha256: sha256(content),
    };
  }

  write(relativePath, content, expectedSha256) {
    if (!this.writeEnabled) {
      throw createWorkspaceError('WORKSPACE_WRITE_DISABLED', 'Workspace writes are disabled', 403);
    }
    if (typeof content !== 'string') {
      throw createWorkspaceError('STRING_CONTENT_REQUIRED', 'File content must be a string');
    }
    if (Buffer.byteLength(content) > this.maxFileBytes) {
      throw createWorkspaceError('FILE_TOO_LARGE', 'File exceeds the workspace write limit', 413);
    }
    const current = this.read(relativePath);
    if (!expectedSha256 || expectedSha256 !== current.sha256) {
      throw createWorkspaceError('FILE_VERSION_CONFLICT', 'File changed since it was opened', 409);
    }
    const { target } = this.resolve(relativePath);
    const temporary = `${target}.sheikha-${process.pid}-${crypto.randomUUID()}.tmp`;
    try {
      fs.writeFileSync(temporary, content, { encoding: 'utf8', mode: current.mode });
      fs.renameSync(temporary, target);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
    return this.read(relativePath);
  }
}

module.exports = { SheikhaStudioWorkspace, createWorkspaceError, MAX_FILE_BYTES };
