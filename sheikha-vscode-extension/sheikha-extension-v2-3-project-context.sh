#!/usr/bin/env bash
set -euo pipefail

echo "==> تفعيل فهم مشروع شيخة من المسار"

cat > src/projectContext.js <<'EOF'
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
EOF

python3 - <<'PY'
from pathlib import Path

p = Path("src/sheikhaApiClient.js")
s = p.read_text()

if "buildProjectContext" not in s:
    s = s.replace(
        "const http = require('http');",
        "const http = require('http');\nconst { buildProjectContext } = require('./projectContext');"
    )

s = s.replace(
"""  const payload = { message: prompt, prompt, mode, context };""",
"""  const projectContext = buildProjectContext();

  const payload = {
    message: prompt,
    prompt,
    mode,
    context: {
      ...context,
      sheikhaProject: projectContext,
      systemInstruction:
        'أنت شيخة داخل مشروع sheikha-main-portal. افهم المشروع من مساره وبنيته وملفاته. لا تجيب كدردشة عامة فقط. اربط كل إجابة بالمسار، Runtime، Governance، Extension، CLI، Debugger، وهدف منظومة شيخة الأكبر من مجرد مشروع.'
    }
  };"""
)

p.write_text(s)
PY

python3 - <<'PY'
from pathlib import Path

p = Path("src/chat/sheikhaChatProvider.js")
s = p.read_text()

s = s.replace(
"""workspaceFolders: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) || []""",
"""workspaceFolders: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) || [],
          projectRoot: '/home/sheikha/Projects/sheikha/sheikha-main-portal',
          projectName: 'Sheikha Main Portal',
          projectPurpose: 'منظومة شيخة الكبرى: Runtime + Governance + AI + VS Code Extension + CLI + Debugger + Agentic Fabric'"""
)

p.write_text(s)
PY

node - <<'NODE'
const fs = require('fs');
const p = 'package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
pkg.version = '1.0.14';
pkg.files = Array.from(new Set([...(pkg.files || []), 'src/projectContext.js']));
fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
NODE

npm run compile || true
rm -f *.vsix
npx vsce package --no-dependencies
code --install-extension sheikha-1.0.14.vsix --force

echo "✅ تم ربط الشات بسياق مشروع شيخة من المسار"
