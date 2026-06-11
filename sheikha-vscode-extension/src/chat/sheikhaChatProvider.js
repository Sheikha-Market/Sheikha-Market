'use strict';

const vscode = require('vscode');
const { sendExtensionChat } = require('../sheikhaExtensionChatClient');

class SheikhaChatProvider {
  constructor(context) {
    this.context = context;
  }

  resolveWebviewView(webviewView) {
    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      try {
        if (!msg || msg.command !== 'ask') return;

        const text = String(msg.text || '').trim();

        if (!text) {
          webviewView.webview.postMessage({
            command: 'reply',
            text: 'بسم الله الرحمن الرحيم\n\nأنا شيخة.\n\nما الذي تحتاج إليه من مساعدة أو عون؟',
            meta: { route: 'SHEIKHA_SMART_CHAT_ORCHESTRATOR' }
          });
          return;
        }

        webviewView.webview.postMessage({
          command: 'typing',
          text: 'شيخة تعمل الآن...'
        });

        const result = await sendExtensionChat(text, {
          baseUrl: process.env.SHEIKHA_API_BASE_URL || 'https://sheikha.top',
          mode: msg.mode || 'smart'
        });

        webviewView.webview.postMessage({
          command: 'reply',
          text: result.answer || 'أنا شيخة.\n\nما الذي تحتاج إليه من مساعدة أو عون؟',
          meta: {
            provider: 'Sheikha',
            model: 'شيخة',
            governance: 'SHEIKHA_SMART_CHAT_ORCHESTRATOR'
          }
        });
      } catch (e) {
        webviewView.webview.postMessage({
          command: 'reply',
          text: 'حدث خطأ في شات شيخة. أرسل الخطأ أو أعد المحاولة، وسأساعدك في إصلاحه.\n\n' + String(e.message || e),
          meta: { error: true }
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
body { font-family: system-ui, sans-serif; padding: 12px; background:#0b1410; color:#f4f4f4; }
#log { display:flex; flex-direction:column; gap:10px; margin-bottom:12px; }
.msg { background:#14251c; border:1px solid #2f5f46; padding:10px; border-radius:10px; white-space:pre-wrap; }
.user { background:#1f2f45; border-color:#43699b; }
.controls { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
button { border:1px solid #4f7f63; background:#12351f; color:white; padding:6px 9px; border-radius:8px; cursor:pointer; }
button.active { background:#1f7a43; }
textarea { width:100%; box-sizing:border-box; border-radius:10px; padding:10px; background:#0f1d16; color:white; border:1px solid #2f5f46; }
#send { width:100%; margin-top:8px; }
</style>
</head>
<body>
<div class="controls">
  <button data-mode="smart" class="active">Smart</button>
  <button data-mode="mcp">MCP</button>
  <button data-mode="rag">RAG</button>
  <button data-mode="agent">Agent</button>
  <button data-mode="graphics">Graphics</button>
  <button data-mode="cli">CLI</button>
  <button data-mode="sdk">SDK</button>
</div>

<div id="log">
  <div class="msg">بسم الله الرحمن الرحيم

أنا شيخة.

ما الذي تحتاج إليه من مساعدة أو عون؟</div>
</div>

<textarea id="input" rows="3" placeholder="اكتب ما تحتاج إليه من مساعدة أو عون..."></textarea>
<button id="send">إرسال</button>

<script>
const vscode = acquireVsCodeApi();
const log = document.getElementById('log');
const input = document.getElementById('input');
const send = document.getElementById('send');
let mode = 'smart';

document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
  });
});

function add(text, cls='') {
  const div = document.createElement('div');
  div.className = 'msg ' + cls;
  div.textContent = text;
  log.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function ask() {
  const text = input.value.trim();
  if (!text) return;
  add(text, 'user');
  input.value = '';
  vscode.postMessage({ command: 'ask', text, mode });
}

send.addEventListener('click', ask);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    ask();
  }
});

window.addEventListener('message', event => {
  const msg = event.data || {};
  if (msg.command === 'typing') add(msg.text || 'شيخة تعمل الآن...');
  if (msg.command === 'reply') add(msg.text || '');
});
</script>
</body>
</html>`;
  }
}

module.exports = { SheikhaChatProvider };
