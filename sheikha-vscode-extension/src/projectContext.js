'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.env.SHEIKHA_PROJECT_ROOT || path.join(process.env.HOME, 'Projects/sheikha/sheikha-main-portal');

const IMPORTANT_FILES = [
  'package.json',
  'README.md',
  'server.js',
  'jest.config.js',
  'docs/architecture/SHEIKHA-SOVEREIGN-RUNTIME-FABRIC.md',
  'docs/architecture/SHEIKHA-FEDERATED-ORGANIZATIONAL-RUNTIME-ARCHITECTURE.md'
];

function safeRead(file, max = 6000) {
  try {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) return null;
    return fs.readFileSync(p, 'utf8').slice(0, max);
  } catch {
    return null;
  }
}

function listDir(dir, max = 80) {
  try {
    const p = path.join(ROOT, dir);
    if (!fs.existsSync(p)) return [];
    return fs.readdirSync(p).slice(0, max);
  } catch {
    return [];
  }
}

function buildProjectContext() {
  const pkgRaw = safeRead('package.json', 12000);
  let pkg = {};
  try { pkg = JSON.parse(pkgRaw || '{}'); } catch {}

  const context = {
    projectRoot: ROOT,
    projectName: pkg.name || 'sheikha-main-portal',
    version: pkg.version || null,
    scripts: pkg.scripts || {},
    architecture: {
      runtime: 'Node.js / Express / PM2',
      activePort: 8080,
      protocolEndpoint: '/api/sheikha/protocol/status',
      aiGateway: '/api/sheikha/ai-gateway/chat',
      localModel: 'Sheikha-Core via Ollama',
      governance: 'Sheikha Protocol + Governance Engine + Decision Engine'
    },
    directories: {
      routes: listDir('routes'),
      core: listDir('core'),
      runtime: listDir('runtime'),
      docs: listDir('docs'),
      extension: listDir('sheikha-vscode-extension/src')
    },
    keyFiles: {}
  };

  for (const f of IMPORTANT_FILES) {
    const content = safeRead(f);
    if (content) context.keyFiles[f] = content;
  }

  return context;
}

module.exports = { buildProjectContext, ROOT };
