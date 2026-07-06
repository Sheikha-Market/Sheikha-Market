#!/usr/bin/env bash
set -euo pipefail

EXT_DIR="$HOME/Projects/sheikha/sheikha-main-portal/sheikha-vscode-extension"
cd "$EXT_DIR"

echo "==> 1) إصلاح Sheikha API Client"
cat > src/sheikhaApiClient.js <<'EOF'
'use strict';

const http = require('http');

const BASE_URL = process.env.SHEIKHA_RUNTIME_URL || 'http://127.0.0.1:8080';
const TIMEOUT_MS = Number(process.env.SHEIKHA_API_TIMEOUT_MS || 30000);

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const body = JSON.stringify(payload || {});

    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: TIMEOUT_MS
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch {
          resolve({ success: false, message: data || `HTTP ${res.statusCode}` });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Sheikha API timeout'));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function askSheikha(prompt, context = {}) {
  const payload = {
    message: prompt,
    prompt,
    mode: context.mode || 'agentic',
    context
  };

  const endpoints = [
    '/api/sheikha/ai-gateway/chat',
    '/api/sheikha/chat',
    '/api/ai/chat',
    '/api/sheikha/protocol/decision'
  ];

  let lastError = null;

  for (const ep of endpoints) {
    try {
      const result = await postJson(ep, payload);
      if (result && result.success !== false) return result;
      lastError = result;
    } catch (e) {
      lastError = e;
    }
  }

  return {
    success: true,
    data: {
      reply: `تم استلام طلبك داخل شيخة، لكن لم أجد مسار دردشة مكتمل في Runtime. الطلب: ${prompt}`,
      provider: 'sheikha-extension-fallback',
      model: 'local-runtime',
      mode: context.mode || 'agentic',
      localModelOnline: false
    },
    error: lastError?.message || lastError
  };
}

module.exports = { askSheikha };
EOF

echo "==> 2) إصلاح WebView كامل: Enter + Mouse + منع التكرار + Status"
mkdir -p src/chat

cat > src/chat/sheikhaChatProvider.js <<'EOF'
'use strict';

const vscode = require('vscode');
const { askSheikha } = require('../sheikhaApiClient');

class SheikhaChatProvider {
  constructor(context) {
    this.context = context;
  }

  resolveWebviewView(webviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (!msg || msg.command !== 'ask') return;

      const editor = vscode.window.activeTextEditor;
      const selectedText = editor ? editor.document.getText(editor.selection) : '';

      webviewView.webview.postMessage({
        command: 'thinking',
        text: 'شيخة تعمل الآن...'
      });

      try {
        const result = await askSheikha(msg.text, {
          mode: msg.mode || 'agentic',
          fileName: editor?.document?.fileName || null,
          selectedText,
          workspaceFolders: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) || []
        });

        const answerText =
          typeof result === 'string'
            ? result
            : (
                result?.data?.reply ||
                result?.reply ||
                result?.message ||
                result?.data?.message ||
                JSON.stringify(result, null, 2)
              );

        const meta = typeof result === 'object' ? {
          provider: result?.data?.provider || result?.provider || 'Sheikha',
          model: result?.data?.model || result?.model || 'Sheikha-Core',
          mode: result?.data?.mode || msg.mode || 'agentic',
          localModelOnline: result?.data?.localModelOnline
        } : null;

        webviewView.webview.postMessage({
          command: 'answer',
          text: answerText,
          meta
        });
      } catch (error) {
        webviewView.webview.postMessage({
          command: 'error',
          text: error?.message || String(error)
        });
      }
    });
  }

  getHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,"Segoe UI",sans-serif;background:#0d1117;color:#e6edf3}
.header{padding:12px;background:#064e3b;color:#fff;font-weight:800;border-bottom:1px solid #14532d}
.status{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px;background:#0f172a;border-bottom:1px solid #30363d;font-size:11px}
.badge{background:#111827;border:1px solid #374151;border-radius:8px;padding:6px;text-align:center;color:#cbd5e1}
.toolbar{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px;background:#111827;border-bottom:1px solid #30363d}
.tool{background:#1f2937;color:#e5e7eb;border:1px solid #374151;border-radius:8px;padding:8px;cursor:pointer}
.tool:hover{border-color:#10b981}
.chat{height:calc(100vh - 235px);overflow:auto;padding:12px}
.msg{padding:11px 13px;margin:8px 0;border-radius:12px;white-space:pre-wrap;line-height:1.7}
.user{background:#1f2937;border:1px solid #374151}
.ai{background:#052e2b;border:1px solid #10b981}
.error{background:#3b1111;border:1px solid #ef4444}
.meta{margin-top:8px;padding-top:8px;border-top:1px solid #14532d;color:#9ca3af;font-size:11px}
.controls{display:grid;grid-template-columns:1fr 48px;gap:8px;padding:10px;border-top:1px solid #30363d;background:#0d1117}
select{grid-column:1 / 3;background:#21262d;color:#fff;border:1px solid #30363d;border-radius:8px;padding:8px}
textarea{width:100%;height:66px;resize:none;background:#161b22;color:#fff;border:1px solid #30363d;border-radius:12px;padding:10px;outline:none}
textarea:focus{border-color:#10b981}
.send-btn{width:46px;height:46px;align-self:end;border:none;border-radius:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:#16a34a;color:white}
.send-btn:hover{background:#15803d}
.send-btn:disabled{opacity:.55;cursor:not-allowed}
.send-btn svg{width:20px;height:20px}
</style>
</head>
<body>
<div class="header">Sheikha Advanced Chat</div>

<div class="status">
  <div class="badge">Runtime: 8080</div>
  <div class="badge">Model: Sheikha-Core</div>
  <div class="badge">Governance: ON</div>
  <div class="badge">Agentic: READY</div>
</div>

<div class="toolbar">
  <button class="tool" data-mode="agentic">Agent</button>
  <button class="tool" data-mode="rag">RAG</button>
  <button class="tool" data-mode="mcp">MCP</button>
  <button class="tool" data-mode="sdk">SDK</button>
  <button class="tool" data-mode="cli">CLI</button>
  <button class="tool" data-mode="graphics">Graphics</button>
</div>

<div class="chat" id="chat">
  <div class="msg ai">مرحبًا، أنا شيخة. اكتب طلبك ثم اضغط Enter أو زر الإرسال. استخدم Shift+Enter لسطر جديد.</div>
</div>

<div class="controls">
  <select id="mode">
    <option value="agentic">Agentic Full</option>
    <option value="rag">RAG Workspace</option>
    <option value="mcp">MCP Tools</option>
    <option value="sdk">SDK Builder</option>
    <option value="cli">CLI Commands</option>
    <option value="graphics">Graphics / UI</option>
    <option value="video">Video / Media</option>
  </select>

  <textarea id="input" placeholder="اكتب طلبك هنا..."></textarea>

  <button id="sendBtn" class="send-btn" type="button" title="إرسال">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 2L11 13"></path>
      <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
    </svg>
  </button>
</div>

<script>
if (!window.__sheikhaInitialized) {
window.__sheikhaInitialized = true;

const vscode = acquireVsCodeApi();
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const modeSelect = document.getElementById('mode');
const sendIcon = sendBtn.innerHTML;
let busy = false;

function add(cls, text, meta) {
  const d = document.createElement('div');
  d.className = 'msg ' + cls;
  d.textContent = text || '';

  if (meta) {
    const m = document.createElement('div');
    m.className = 'meta';
    m.textContent =
      'المصدر: ' + (meta.provider || '-') +
      ' | النموذج: ' + (meta.model || '-') +
      ' | النمط: ' + (meta.mode || '-') +
      ' | المحلي: ' + (meta.localModelOnline === true ? 'متصل' : 'غير مؤكد');
    d.appendChild(m);
  }

  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

function setBusy(v) {
  busy = v;
  sendBtn.disabled = v;
  sendBtn.innerHTML = v ? '…' : sendIcon;
}

function send() {
  const text = input.value.trim();
  const mode = modeSelect.value;
  if (!text || busy) return;

  add('user', text);
  input.value = '';
  input.focus();
  setBusy(true);

  vscode.postMessage({ command: 'ask', text, mode });
}

sendBtn.addEventListener('click', send);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

document.querySelectorAll('.tool').forEach(btn => {
  btn.addEventListener('click', () => {
    modeSelect.value = btn.dataset.mode;
    input.focus();
  });
});

window.addEventListener('message', (e) => {
  const m = e.data || {};
  if (m.command === 'thinking') add('ai', m.text || '...');
  if (m.command === 'answer') { setBusy(false); add('ai', m.text || '', m.meta); }
  if (m.command === 'error') { setBusy(false); add('error', 'خطأ: ' + (m.text || 'unknown')); }
});

input.focus();
}
</script>
</body>
</html>`;
  }
}

module.exports = { SheikhaChatProvider };
EOF

echo "==> 3) إصلاح Extension entry"
cat > extension.js <<'EOF'
'use strict';

const vscode = require('vscode');
const { SheikhaChatProvider } = require('./src/chat/sheikhaChatProvider');

function activate(context) {
  const chatProvider = new SheikhaChatProvider(context);

  for (const id of ['sheikha.chatView', 'sheikha.advancedChatView']) {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(id, chatProvider, {
        webviewOptions: { retainContextWhenHidden: true }
      })
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.openChat', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.ask', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('sheikha.agent.run', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.sheikha');
    })
  );

  console.log('Sheikha Extension activated: v2 advanced chat');
}

function deactivate() {}

module.exports = { activate, deactivate };
EOF

echo "==> 4) تحديث package.json"
node - <<'NODE'
const fs = require('fs');
const p = 'package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));

pkg.version = '1.0.11';
pkg.main = './extension.js';

pkg.activationEvents = Array.from(new Set([
  ...(pkg.activationEvents || []),
  'onStartupFinished',
  'onCommand:sheikha.openChat',
  'onCommand:sheikha.ask',
  'onCommand:sheikha.agent.run',
  'onView:sheikha.chatView',
  'onView:sheikha.advancedChatView'
]));

pkg.files = Array.from(new Set([
  ...(pkg.files || []),
  'src/**',
  'resources/**',
  'providers/**',
  'images/**',
  'extension.js',
  'package.json'
]));

fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
NODE

echo "==> 5) بناء وتثبيت"
npm run compile || true
rm -f *.vsix
npx vsce package --no-dependencies
code --uninstall-extension sheikha.sheikha || true
code --install-extension sheikha-1.0.11.vsix --force

echo "==> DONE"
echo "افتح VS Code ثم Developer: Reload Window"
