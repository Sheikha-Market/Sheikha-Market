from pathlib import Path

p = Path("src/chat/sheikhaChatProvider.js")

p.write_text(r''''use strict';

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
            : (result?.data?.reply || result?.reply || result?.message || JSON.stringify(result, null, 2));

        const meta = typeof result === 'object' ? {
          provider: result?.data?.provider,
          model: result?.data?.model,
          mode: result?.data?.mode,
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
body{
  margin:0;
  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  background:#0d1117;
  color:#e6edf3;
}
.header{
  padding:10px 12px;
  background:#064e3b;
  color:#fff;
  font-weight:700;
  border-bottom:1px solid #14532d;
}
.toolbar{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:6px;
  padding:8px;
  background:#111827;
  border-bottom:1px solid #30363d;
}
.tool{
  background:#1f2937;
  color:#e5e7eb;
  border:1px solid #374151;
  border-radius:8px;
  padding:7px;
  cursor:pointer;
}
.chat{
  height:calc(100vh - 170px);
  overflow:auto;
  padding:12px;
}
.msg{
  padding:10px 12px;
  margin:8px 0;
  border-radius:12px;
  white-space:pre-wrap;
  line-height:1.65;
}
.user{
  background:#1f2937;
  border:1px solid #374151;
}
.ai{
  background:#052e2b;
  border:1px solid #10b981;
}
.error{
  background:#3b1111;
  border:1px solid #ef4444;
}
.meta{
  margin-top:8px;
  padding-top:8px;
  border-top:1px solid #14532d;
  color:#9ca3af;
  font-size:11px;
}
.controls{
  display:grid;
  grid-template-columns:1fr 46px;
  gap:8px;
  padding:10px;
  border-top:1px solid #30363d;
  background:#0d1117;
}
select{
  grid-column:1 / 3;
  background:#21262d;
  color:#fff;
  border:1px solid #30363d;
  border-radius:8px;
  padding:8px;
}
textarea{
  width:100%;
  height:64px;
  resize:none;
  background:#161b22;
  color:#fff;
  border:1px solid #30363d;
  border-radius:10px;
  padding:9px;
  outline:none;
}
textarea:focus{
  border-color:#10b981;
}
.send-btn{
  width:44px;
  height:44px;
  align-self:end;
  border:none;
  border-radius:12px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#16a34a;
  color:white;
}
.send-btn:hover{background:#15803d}
.send-btn:disabled{opacity:.55;cursor:not-allowed}
.send-btn svg{width:19px;height:19px}
</style>
</head>
<body>
<div class="header">Sheikha Advanced Chat</div>

<div class="toolbar">
  <button class="tool" data-mode="agentic">Agent</button>
  <button class="tool" data-mode="rag">RAG</button>
  <button class="tool" data-mode="mcp">MCP</button>
  <button class="tool" data-mode="sdk">SDK</button>
  <button class="tool" data-mode="cli">CLI</button>
  <button class="tool" data-mode="graphics">Graphics</button>
</div>

<div class="chat" id="chat">
  <div class="msg ai">مرحبًا، أنا شيخة. اكتب طلبك ثم اضغط Enter أو زر الإرسال.</div>
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
const vscode = acquireVsCodeApi();
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const modeSelect = document.getElementById('mode');

const sendIcon = sendBtn.innerHTML;

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
      ' | المحلي: ' + (meta.localModelOnline ? 'متصل' : 'غير مؤكد');
    d.appendChild(m);
  }

  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

function setBusy(v) {
  sendBtn.disabled = v;
  sendBtn.innerHTML = v ? '…' : sendIcon;
}

function send() {
  const text = input.value.trim();
  const mode = modeSelect.value;
  if (!text || sendBtn.disabled) return;

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
  if (m.command === 'thinking') {
    add('ai', m.text || '...');
  }
  if (m.command === 'answer') {
    setBusy(false);
    add('ai', m.text || '', m.meta);
  }
  if (m.command === 'error') {
    setBusy(false);
    add('error', 'خطأ: ' + (m.text || 'unknown'));
  }
});

input.focus();
</script>
</body>
</html>`;
  }
}

module.exports = { SheikhaChatProvider };
''')

print("✅ Sheikha chat webview fully repaired")
