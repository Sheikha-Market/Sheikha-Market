'use strict';

const vscode = require('vscode');
const { sheikhaSmartRoute, governMode } = require('../sheikhaApiClient');

class SheikhaChatProvider {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView) {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (!msg || msg.command !== 'ask') return;

      const text = String(msg.text || '').trim();
      const selectedMode = msg.mode || 'agentic';
      const governance = governMode(text, selectedMode);

      webviewView.webview.postMessage({
        command: 'thinking',
        text: 'شيخة تعمل الآن...'
      });

      try {
        const result = await sheikhaSmartRoute(text, {
          mode: governance.effectiveMode,
          selectedMode,
          governance
        });

        if (result && result.data) {
          result.data.governance = governance;
          result.data.mode = governance.effectiveMode;
        }

        const answer =
          result?.data?.reply ||
          result?.data?.answer ||
          result?.data?.message ||
          JSON.stringify(result, null, 2);

        const meta = {
          provider: result?.data?.provider || 'Sheikha',
          model: result?.data?.model || result?.data?.officialModel || 'Sheikha-Core',
          governance,
          localModelOnline: result?.data?.localModelOnline
        };

        webviewView.webview.postMessage({
          command: 'answer',
          text: answer,
          meta
        });
      } catch (e) {
        webviewView.webview.postMessage({
          command: 'answer',
          text: 'خطأ في شات شيخة: ' + e.message,
          meta: { provider: 'Sheikha', model: 'Sheikha-Core', governance }
        });
      }
    });
  }

  getHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
body{margin:0;background:#0b0f14;color:#e8f5ee;font-family:system-ui;padding:10px}
.header{background:#174f38;padding:12px;border-radius:8px;font-weight:700}
.tools{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:10px 0}
button{background:#1f2937;color:#fff;border:1px solid #334155;border-radius:8px;padding:10px;cursor:pointer}
button.active{background:#166534}
#log{height:calc(100vh - 210px);overflow:auto;border-top:1px solid #1f2937;padding-top:10px}
.msg{background:#102b24;border:1px solid #22c55e;border-radius:10px;padding:10px;margin:8px 0;white-space:pre-wrap}
.user{background:#1f2937;border-color:#334155}
.meta{font-size:11px;color:#9ca3af;border-top:1px solid #14532d;margin-top:8px;padding-top:6px;direction:rtl}
.input{display:flex;gap:8px;border-top:1px solid #1f2937;padding-top:10px}
textarea{flex:1;background:#111827;color:#fff;border:1px solid #22c55e;border-radius:10px;padding:10px;resize:none}
.send{width:54px;background:#22c55e;color:#052e16;font-weight:700}

.sheikha-layout-compact .messages { font-size: 12px; }
.sheikha-layout-wide .chat-root { max-width: 100%; width: 100%; }
.sheikha-layout-focus .toolbar,
.sheikha-layout-focus .status-bar { display: none; }
.sheikha-layout-focus .messages { min-height: calc(100vh - 120px); }

/* SHEIKHA_LAYOUT_FABRIC_V3 */
.layout-tools {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 8px 0 12px;
}
.layout-tools button {
  cursor: pointer;
  border: 1px solid #375a4b;
  border-radius: 8px;
  padding: 8px 10px;
  background: #14251f;
  color: #e8fff3;
}
.layout-tools button.active {
  background: #2f6f3e;
  border-color: #5fe38b;
}
body.sheikha-layout-compact { font-size: 12px; }
body.sheikha-layout-wide .chat-root,
body.sheikha-layout-wide .container,
body.sheikha-layout-wide .messages,
body.sheikha-layout-wide #messages {
  width: 100% !important;
  max-width: 100% !important;
}
body.sheikha-layout-focus .mode-grid,
body.sheikha-layout-focus .header {
  display: none !important;
}
body.sheikha-layout-focus .messages,
body.sheikha-layout-focus #messages {
  min-height: calc(100vh - 130px) !important;
}

/* SHEIKHA_TOOLS_DRAWER_V1 */
.sheikha-tools-toggle-row {
  display: flex;
  justify-content: flex-end;
  margin: 8px 0;
}
#sheikha-tools-toggle {
  border: 1px solid #375a4b;
  border-radius: 8px;
  padding: 8px 12px;
  background: #143323;
  color: #e8fff3;
  cursor: pointer;
}
.sheikha-tools-drawer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  border: 1px solid #244335;
  border-radius: 10px;
  padding: 10px;
  margin: 8px 0 12px;
  background: #0c1512;
}
.sheikha-tools-drawer.collapsed {
  display: none;
}
.sheikha-tools-drawer button {
  cursor: pointer;
  border: 1px solid #375a4b;
  border-radius: 8px;
  padding: 8px 10px;
  background: #1d2736;
  color: #e8fff3;
}
.sheikha-tools-drawer button.active,
.sheikha-tools-drawer button[data-layout].active {
  background: #2f6f3e;
  border-color: #5fe38b;
}
.drawer-section-title {
  grid-column: 1 / -1;
  color: #9ad9b0;
  font-weight: 700;
  margin-top: 4px;
}
body.sheikha-layout-compact { font-size: 12px; }
body.sheikha-layout-wide .chat-root,
body.sheikha-layout-wide .container,
body.sheikha-layout-wide .messages,
body.sheikha-layout-wide #messages {
  width: 100% !important;
  max-width: 100% !important;
}
body.sheikha-layout-focus #sheikha-tools-drawer,
body.sheikha-layout-focus .mode-grid,
body.sheikha-layout-focus .header {
  display: none !important;
}


/* SHEIKHA_PRO_CHAT_UI_V1 */
#sheikha-tools-toggle {
  width: 100%;
  border: 1px solid #375a4b;
  border-radius: 10px;
  padding: 10px 12px;
  background: #143323;
  color: #e8fff3;
  cursor: pointer;
}
.sheikha-tools-drawer.collapsed { display: none; }
.sheikha-tools-drawer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 10px 0 12px;
  padding: 10px;
  border: 1px solid #244335;
  border-radius: 10px;
  background: #0c1512;
}
.sheikha-tools-drawer button {
  border: 1px solid #375a4b;
  border-radius: 8px;
  padding: 8px 10px;
  background: #1d2736;
  color: #e8fff3;
  cursor: pointer;
}
.sheikha-tools-drawer button.active {
  background: #2f6f3e;
  border-color: #5fe38b;
}
.drawer-section-title {
  grid-column: 1 / -1;
  color: #9ad9b0;
  font-weight: 700;
}
body.sheikha-layout-compact { font-size: 12px; }
body.sheikha-layout-focus .sheikha-tools-drawer { display: none !important; }

</style>
</head>
<body>
<div class="header">Sheikha Advanced Chat</div>
<div class="tools">
<button data-mode="mcp">MCP</button>
<button data-mode="rag">RAG</button>
<button data-mode="agentic" class="active">Agent</button>
<button data-mode="graphics">Graphics</button>


<button data-mode="cli">CLI</button>
<button data-mode="sdk">SDK</button>

</div>
<div id="log"><div class="msg">مرحبًا، أنا شيخة. اكتب طلبك ثم اضغط Enter أو زر الإرسال.</div></div>
<div class="input">
<textarea id="input" rows="2" placeholder="اكتب طلبك هنا..."></textarea>
<button id="sendBtn" class="send">➤</button>
</div>
<script>
const vscode = acquireVsCodeApi();

function setSheikhaLayout(mode) {
  document.body.classList.remove('sheikha-layout-compact','sheikha-layout-wide','sheikha-layout-focus');
  document.body.classList.add('sheikha-layout-' + mode);
  try { localStorage.setItem('sheikha.layout', mode); } catch (_) {}
}

setSheikhaLayout(localStorage.getItem('sheikha.layout') || 'wide');

setTimeout(() => {
  document.getElementById('layout-compact')?.addEventListener('click', () => setSheikhaLayout('compact'));
  document.getElementById('layout-wide')?.addEventListener('click', () => setSheikhaLayout('wide'));
  document.getElementById('layout-focus')?.addEventListener('click', () => setSheikhaLayout('focus'));
}, 0);
let mode = 'agentic';
const log = document.getElementById('log');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

document.querySelectorAll('[data-mode]').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('[data-mode]').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    mode = btn.dataset.mode;
  });
});

function addMessage(text, cls, meta) {
  const box = document.createElement('div');
  box.className = 'msg ' + (cls || '');
  box.textContent = text;

  if (meta) {
    const m = document.createElement('div');
    m.className = 'meta';
    const g = meta.governance || {};
    m.textContent =
      '🧭 المصدر: ' + (meta.provider || 'Sheikha') +
      '\\n🧠 النموذج: ' + (meta.model || '-') +
      '\\n🎛️ الاختيار: ' + (g.requestedMode || mode) +
      '\\n⚖️ قرار الحوكمة: ' + (g.intent || '-') +
      '\\n🛤️ المسار الفعلي: ' + (g.effectiveMode || mode) +
      '\\n🔌 المحلي: ' + (meta.localModelOnline ? 'متصل' : 'غير مؤكد');
    box.appendChild(m);
  }

  log.appendChild(box);
  log.scrollTop = log.scrollHeight;
}

function send() {
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  input.value = '';
  vscode.postMessage({ command: 'ask', text: text, mode: mode });
}

sendBtn.addEventListener('click', send);
input.addEventListener('keydown', function(e){
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

window.addEventListener('message', function(event){
  const msg = event.data || {};
  if (msg.command === 'thinking') addMessage(msg.text || 'شيخة تعمل الآن...');
  if (msg.command === 'answer') addMessage(msg.text || '', '', msg.meta);
});




// SHEIKHA_TOOLS_DRAWER_HANDLER_V1
(function () {
  function applyLayout(mode) {
    const allowed = ['compact', 'wide', 'focus'];
    if (!allowed.includes(mode)) mode = 'wide';
    document.body.classList.remove('sheikha-layout-compact','sheikha-layout-wide','sheikha-layout-focus');
    document.body.classList.add('sheikha-layout-' + mode);
    document.querySelectorAll('[data-layout]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-layout') === mode);
    });
    try { localStorage.setItem('sheikha.layout', mode); } catch (_) {}
  }

  function bootSheikhaTools() {
    const drawer = document.getElementById('sheikha-tools-drawer');
    const toggle = document.getElementById('sheikha-tools-toggle');

    toggle?.addEventListener('click', () => {
      drawer?.classList.toggle('collapsed');
    });

    let saved = 'wide';
    try { saved = localStorage.getItem('sheikha.layout') || 'wide'; } catch (_) {}
    applyLayout(saved);

    document.addEventListener('click', function (event) {
      const layoutBtn = event.target.closest('[data-layout]');
      if (!layoutBtn) return;
      event.preventDefault();
      applyLayout(layoutBtn.getAttribute('data-layout'));
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSheikhaTools);
  } else {
    bootSheikhaTools();
  }
})();


// SHEIKHA_PRO_CHAT_UI_HANDLER_V1
(function () {
  function applyLayout(mode) {
    if (!['wide','compact','focus'].includes(mode)) mode = 'wide';
    document.body.classList.remove('sheikha-layout-wide','sheikha-layout-compact','sheikha-layout-focus');
    document.body.classList.add('sheikha-layout-' + mode);
    document.querySelectorAll('[data-layout]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-layout') === mode);
    });
    try { localStorage.setItem('sheikha.layout', mode); } catch (_) {}
  }

  function boot() {
    document.getElementById('sheikha-tools-toggle')?.addEventListener('click', () => {
      document.getElementById('sheikha-tools-drawer')?.classList.toggle('collapsed');
    });

    let saved = 'wide';
    try { saved = localStorage.getItem('sheikha.layout') || 'wide'; } catch (_) {}
    applyLayout(saved);

    document.addEventListener('click', (event) => {
      const layout = event.target.closest('[data-layout]');
      if (layout) {
        event.preventDefault();
        applyLayout(layout.getAttribute('data-layout'));
      }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

</script>
</body>
</html>`;
  }
}

module.exports = { SheikhaChatProvider };
