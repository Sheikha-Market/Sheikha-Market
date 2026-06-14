'use strict';

const vscode = require('vscode');
const { sendExtensionChat } = require('../sheikhaExtensionChatClient');

class SheikhaChatProvider {
  constructor(context) {
    this.context = context;
    this.views = new Set();
  }

  resolveWebviewView(webviewView) {
    this.views.add(webviewView);
    webviewView.webview.options = {
      enableScripts: true
    };
    webviewView.onDidDispose(() => this.views.delete(webviewView));

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
            route: result.raw?.endpoint || result.raw?.route || 'SHEIKHA_CONVERSATION_ENGINE_V1',
            governance: 'SHEIKHA_ENTERPRISE_CHAT_GOVERNANCE_V1',
            mode: msg.mode || 'smart',
            layers: (result.raw?.layerStack?.layers || []).map((layer) => ({
              layer: layer.layer,
              name: layer.name,
              status: layer.status
            }))
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

  prefill(text, autoSend = true) {
    for (const view of this.views) {
      view.webview.postMessage({
        command: 'prefill',
        text: String(text || ''),
        autoSend
      });
    }
  }

  getHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
body { font-family: system-ui, sans-serif; margin:0; padding:12px; background:#0b0f14; color:#f4f4f4; letter-spacing:0; }
.header { border-bottom:1px solid #2d3947; padding:2px 0 10px; margin-bottom:10px; }
.header strong { display:block; font-size:14px; }
.header span { color:#9eabb9; font-size:11px; }
#log { display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
.msg { background:#111821; border:1px solid #2d3947; padding:10px; border-radius:6px; white-space:pre-wrap; overflow-wrap:anywhere; }
.user { background:#142236; border-color:#365b82; }
.controls,.quick { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:8px; }
button { border:1px solid #3a4857; background:#161f2a; color:white; padding:6px 8px; border-radius:6px; cursor:pointer; }
button:hover { border-color:#62a6df; }
button.active { background:#19452d; border-color:#50b878; }
button:disabled { cursor:wait; opacity:.6; }
.typing { opacity:.72; border-style:dashed; }
.trace { direction:ltr; text-align:left; color:#9eabb9; font-size:10px; border:0; background:transparent; padding:2px 4px; }
textarea { width:100%; box-sizing:border-box; border-radius:6px; padding:10px; background:#0f151d; color:white; border:1px solid #3a4857; resize:vertical; }
#send { width:100%; margin-top:8px; }
</style>
</head>
<body>
<div class="header"><strong>شات شيخة المؤسسي</strong><span>Conversation Stack L8 · Enterprise Governance · Foundry V2</span></div>
<div class="controls">
  <button data-mode="smart" class="active" title="اختيار تلقائي محكوم">Smart</button>
  <button data-mode="generative" title="توليد محتوى وكود وتحليل">Generative</button>
  <button data-mode="rag" title="استرجاع مؤسس على مصادر">RAG</button>
  <button data-mode="agentic" title="تخطيط وتنفيذ محدود الصلاحية">Agentic</button>
  <button data-mode="multi-agent" title="تنسيق وكلاء بأدوار محددة">Multi-Agent</button>
  <button data-mode="agi-research" title="بحث وتقييم فقط، وليس AGI فعليًا">AGI Research</button>
  <button data-mode="asi-research" title="بحث مخاطر فقط، وليس ASI فعليًا">ASI Research</button>
  <button data-mode="mcp" title="عقود أدوات MCP محكومة">MCP</button>
  <button data-mode="sdk" title="تخطيط تكامل SDK">SDK</button>
  <button data-mode="graphics" title="خطة رسوم وهوية">Graphics</button>
  <button data-mode="cli" title="فحص CLI للقراءة فقط">CLI</button>
</div>

<div class="quick">
  <button data-prompt="حلل حالة منظومة شيخة الحالية من Enterprise Inspector وحدد أفضل إجراء تالٍ.">حالة المنظومة</button>
  <button data-prompt="راجع أخطاء وتحذيرات VS Code الحالية واقترح خطة إصلاح مرتبة.">Diagnostics</button>
  <button data-prompt="حلل Workspace وGit الحاليين وحدد مخاطر الاختبار والدمج.">مراجعة المشروع</button>
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
let typingMessage = null;

document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
  });
});

document.querySelectorAll('[data-prompt]').forEach(btn => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.prompt || '';
    input.focus();
  });
});

function add(text, cls='') {
  const div = document.createElement('div');
  div.className = 'msg ' + cls;
  div.textContent = text;
  log.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return div;
}

function addTrace(layers) {
  if (!Array.isArray(layers) || !layers.length) return;
  add(layers.map(layer => 'L' + layer.layer + ' ' + layer.name + ':' + layer.status).join('  ·  '), 'trace');
}

function clearTyping() {
  if (typingMessage) typingMessage.remove();
  typingMessage = null;
}

function ask() {
  if (send.disabled) return;
  const text = input.value.trim();
  if (!text) return;
  add(text, 'user');
  input.value = '';
  send.disabled = true;
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
  if (msg.command === 'typing') {
    clearTyping();
    typingMessage = add(msg.text || 'شيخة تعمل الآن...', 'typing');
  }
  if (msg.command === 'reply') {
    clearTyping();
    send.disabled = false;
    add(msg.text || '');
    addTrace(msg.meta && msg.meta.layers);
  }
  if (msg.command === 'prefill') {
    input.value = msg.text || '';
    input.focus();
    if (msg.autoSend) ask();
  }
});
</script>
</body>
</html>`;
  }
}

module.exports = { SheikhaChatProvider };
