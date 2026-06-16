'use strict';

const vscode = require('vscode');
const crypto = require('crypto');
const {
  DEFAULT_BASE_URL,
  getChatInterfaceApexStatus,
  getDebuggingApexStatus,
  getExtensionExperienceStatus,
  getIdeApexStatus,
  getStreamingChatApexStatus,
  getTechnicalCapabilityApexStatus,
  getVitalChatApexStatus,
  sendExtensionChat
} = require('../sheikhaExtensionChatClient');

class SheikhaChatProvider {
  constructor(context) {
    this.context = context;
    this.views = new Set();
    this.conversationId = crypto.randomUUID();
    this.history = [];
  }

  resolveWebviewView(webviewView) {
    this.views.add(webviewView);
    webviewView.webview.options = {
      enableScripts: true
    };
    webviewView.onDidDispose(() => this.views.delete(webviewView));

    webviewView.webview.html = this.getHtml();
    getExtensionExperienceStatus({
      baseUrl: DEFAULT_BASE_URL
    }).then((experience) => {
      webviewView.webview.postMessage({ command: 'experienceStatus', experience });
    }).catch(() => {});
    getVitalChatApexStatus({
      baseUrl: DEFAULT_BASE_URL
    }).then((vital) => {
      webviewView.webview.postMessage({ command: 'vitalStatus', vital });
    }).catch(() => {});
    getDebuggingApexStatus({
      baseUrl: DEFAULT_BASE_URL
    }).then((debugging) => {
      webviewView.webview.postMessage({ command: 'debuggingStatus', debugging });
    }).catch(() => {});
    getChatInterfaceApexStatus({
      baseUrl: DEFAULT_BASE_URL
    }).then((interfaceApex) => {
      webviewView.webview.postMessage({ command: 'interfaceStatus', interfaceApex });
    }).catch(() => {});
    getIdeApexStatus({
      baseUrl: DEFAULT_BASE_URL
    }).then((ideApex) => {
      webviewView.webview.postMessage({ command: 'ideApexStatus', ideApex });
    }).catch(() => {});
    getTechnicalCapabilityApexStatus({
      baseUrl: DEFAULT_BASE_URL
    }).then((technicalCapability) => {
      webviewView.webview.postMessage({
        command: 'technicalCapabilityStatus',
        technicalCapability
      });
    }).catch(() => {});
    getStreamingChatApexStatus({
      baseUrl: DEFAULT_BASE_URL
    }).then((streamingApex) => {
      webviewView.webview.postMessage({
        command: 'streamingApexStatus',
        streamingApex
      });
    }).catch(() => {});

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
          text: 'شيخة تقرأ السياق والذاكرة وحالة المشروع...'
        });

        const result = await sendExtensionChat(text, {
          baseUrl: DEFAULT_BASE_URL,
          mode: msg.mode || 'smart',
          conversationId: this.conversationId,
          history: this.history
        });

        this.history.push(
          { role: 'user', content: text },
          { role: 'assistant', content: String(result.answer || '').slice(0, 4000) }
        );
        this.history = this.history.slice(-12);

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
:root {
  --bg:#080b0f;
  --panel:#101720;
  --panel-strong:#151f2b;
  --line:#2b3948;
  --text:#f5f7fa;
  --muted:#9ba8b6;
  --green:#87d99d;
  --gold:#d6b85f;
  --cyan:#80c7df;
}
body { font-family: system-ui, sans-serif; margin:0; padding:12px; background:var(--bg); color:var(--text); letter-spacing:0; }
.shell { max-width:980px; margin:0 auto; }
.header { border:1px solid var(--line); background:var(--panel); border-radius:8px; padding:10px; margin-bottom:10px; }
.header-main { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
.header strong { display:block; font-size:15px; line-height:1.4; }
.header small { color:var(--muted); font-size:11px; }
.status-pill { direction:ltr; text-align:left; color:var(--green); border:1px solid #2f6a43; background:#0e2116; border-radius:999px; padding:4px 8px; font-size:10px; white-space:nowrap; }
.apex { display:flex; flex-wrap:wrap; gap:5px; margin:10px 0 0; direction:ltr; }
.apex b { border:1px solid #35465a; background:#0f1720; color:#c3ced9; border-radius:5px; padding:4px 7px; font-size:10px; font-weight:600; min-height:18px; }
.apex b.active { color:var(--green); border-color:#2b6c47; background:#102019; }
.context-rail { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:6px; margin-bottom:8px; }
.context-rail span { border:1px solid var(--line); background:#0d131b; border-radius:6px; padding:7px 8px; color:#c9d4df; font-size:11px; min-height:18px; overflow-wrap:anywhere; }
.controls,.quick,.composer-actions { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:8px; }
button { border:1px solid #3a4857; background:#151e28; color:var(--text); padding:7px 9px; border-radius:6px; cursor:pointer; min-height:32px; }
button:hover { border-color:var(--cyan); }
button.active { background:#183321; border-color:#58b878; color:#dff9e6; }
button:disabled { cursor:wait; opacity:.65; }
#log { display:flex; flex-direction:column; gap:8px; min-height:260px; margin-bottom:10px; }
.msg { background:var(--panel); border:1px solid var(--line); padding:11px; border-radius:7px; white-space:pre-wrap; overflow-wrap:anywhere; line-height:1.65; }
.user { background:#142236; border-color:#42678d; }
.typing { opacity:.78; border-style:dashed; color:#d9e5ef; }
.trace { direction:ltr; text-align:left; color:var(--muted); font-size:10px; border:1px solid #253240; background:#0a0f15; border-radius:6px; padding:6px 8px; }
.composer { position:sticky; bottom:0; background:var(--bg); border-top:1px solid #1d2834; padding-top:8px; }
textarea { width:100%; box-sizing:border-box; border-radius:7px; padding:10px; background:#0e141c; color:var(--text); border:1px solid #3a4857; resize:vertical; min-height:74px; line-height:1.6; }
#send { flex:1 1 180px; background:#17304b; border-color:#426b95; }
#clear { flex:0 0 auto; color:#f3df9c; border-color:#6d5c24; background:#241f12; }
@media (min-width: 720px) {
  .context-rail { grid-template-columns:repeat(4, minmax(0, 1fr)); }
}
</style>
</head>
<body>
<div class="shell">
<div class="header">
  <div class="header-main">
    <div><strong>شات شيخة المتدفق المتقدم</strong><small id="experience">L21 Streaming Multilingual Chat Apex · L20 Technical Capability Apex · L19 IDE Apex · L18 Debugging Apex · L17 Chat Interface Apex · L16 Vital Chat Apex · Extension 1.0.88</small></div>
    <span class="status-pill" id="modeLabel">SMART</span>
  </div>
<div class="apex" id="apex">
  <b class="active">L21 Streaming Multilingual Chat Apex</b>
  <b class="active">L20 Technical Capability Apex</b>
  <b class="active">L19 IDE Apex</b>
  <b class="active">L18 Debugging Apex</b>
  <b class="active">L17 Chat Interface Apex</b>
  <b class="active">L16 Vital Chat Apex</b>
  <b class="active">Conversation Engine</b>
  <b class="active">Session Memory</b>
  <b class="active">Context Memory</b>
  <b class="active">Workspace</b>
  <b class="active">Git</b>
  <b class="active">Project</b>
  <b class="active">Extension Apex</b>
</div>
</div>
<div class="context-rail" id="contextRail">
  <span>apex_header</span>
  <span>governed_mode_dock</span>
  <span>context_rail</span>
  <span>evidence_trace_panel</span>
</div>
<div class="controls">
  <button data-mode="smart" class="active" title="اختيار تلقائي محكوم">Smart</button>
  <button data-mode="streaming" title="بث استجابة SSE محكوم عند توفر المسار">Streaming</button>
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
  <button data-prompt="شغّل IDE Apex وDebugging Apex واقرأ Diagnostics وGit وRuntime ثم أعطني خطة إصلاح آمنة.">IDE + Debugging</button>
  <button data-prompt="فعّل Technical Capability Apex في الرد: اربط البرمجة والتوليد وRAG وMCP وSDK والوكلاء والقوالب مع الحوكمة دون تنفيذ إجراء عالي الأثر.">Technical Apex</button>
  <button data-prompt="فعّل Streaming Multilingual Chat Apex: اكتب الرد بدعم عربي/إنجليزي واتجاه النص المناسب، واذكر كيف يعمل البث الفوري دون إجراء عالي الأثر.">Streaming Apex</button>
  <button data-prompt="راجع أخطاء وتحذيرات VS Code الحالية واقترح خطة إصلاح مرتبة.">Diagnostics</button>
  <button data-prompt="حلل Workspace وGit الحاليين وحدد مخاطر الاختبار والدمج.">مراجعة المشروع</button>
</div>

<div id="log">
  <div class="msg">بسم الله الرحمن الرحيم

أنا شيخة.

ما الذي تحتاج إليه من مساعدة أو عون؟</div>
</div>

<textarea id="input" rows="3" placeholder="اكتب ما تحتاج إليه من مساعدة أو عون..."></textarea>
<div class="composer">
  <div class="composer-actions">
    <button id="send">إرسال</button>
    <button id="clear" title="مسح سجل الشات المحلي">مسح</button>
  </div>
</div>
</div>

<script>
const vscode = acquireVsCodeApi();
const log = document.getElementById('log');
const input = document.getElementById('input');
const send = document.getElementById('send');
const clear = document.getElementById('clear');
const modeLabel = document.getElementById('modeLabel');
let mode = 'smart';
let typingMessage = null;

document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    modeLabel.textContent = String(mode || 'smart').toUpperCase();
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
  const details = document.createElement('details');
  details.className = 'trace';
  const summary = document.createElement('summary');
  summary.textContent = 'مسار الرد المحكوم · ' + layers.length + ' طبقات';
  const content = document.createElement('div');
  content.textContent = layers.map(layer => 'L' + layer.layer + ' ' + layer.name + ':' + layer.status).join('  ·  ');
  details.appendChild(summary);
  details.appendChild(content);
  log.appendChild(details);
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
clear.addEventListener('click', () => {
  log.innerHTML = '';
  add('بسم الله الرحمن الرحيم\\n\\nأنا شيخة.\\n\\nما الذي تحتاج إليه من مساعدة أو عون؟');
  input.focus();
});
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
    typingMessage = add(msg.text || 'شيخة تقرأ طلبك وتجهز جوابًا عمليًا...', 'typing');
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
  if (msg.command === 'experienceStatus' && msg.experience && msg.experience.success === true) {
    const data = msg.experience.data || {};
    document.getElementById('experience').textContent =
      'L21 Streaming Multilingual Chat Apex · L20 Technical Capability Apex · L19 IDE Apex · Layer Governance L' +
      (data.governedByApexLevel || 18) +
      ' · L18 Debugging Apex · Runtime L1-L8 · Extension 1.0.88';
  }
  if (msg.command === 'vitalStatus' && msg.vital && msg.vital.success === true) {
    const data = msg.vital.data || {};
    const stack = data.stack || {};
    document.getElementById('experience').textContent =
      'L21 Streaming Multilingual Chat Apex · L20 Technical Capability Apex · L19 IDE Apex · L18 Debugging Apex · L17 Chat Interface Apex · L16 Vital Chat Apex · ' +
      (data.decision || data.status || 'ACTIVE') + ' · Extension 1.0.88';
    document.getElementById('apex').innerHTML = [
      ['L21 Streaming Multilingual Chat Apex', 'PENDING_STATUS'],
      ['L20 Technical Capability Apex', 'PENDING_STATUS'],
      ['L19 IDE Apex', 'PENDING_STATUS'],
      ['L18 Debugging Apex', 'PENDING_STATUS'],
      ['L17 Chat Interface Apex', 'PENDING_STATUS'],
      ['L16 Vital Chat Apex', data.decision || data.status || 'ACTIVE'],
      ['Conversation Engine', stack.conversationEngine],
      ['Session Memory', stack.sessionMemory],
      ['Context Memory', stack.contextMemory],
      ['Workspace', stack.workspaceAwareness],
      ['Git', stack.gitAwareness],
      ['Project', stack.projectAwareness],
      ['Extension Apex', stack.extensionExperienceApex]
    ].map(([name, state]) => '<b class="active" title="' + String(state || 'ACTIVE') + '">' + name + '</b>').join('');
  }
  if (msg.command === 'debuggingStatus' && msg.debugging && msg.debugging.success === true) {
    const data = msg.debugging.data || {};
    document.getElementById('experience').textContent =
      'L21 Streaming Multilingual Chat Apex · L20 Technical Capability Apex · L18 Debugging Apex · L19 IDE Apex · ' +
      (data.decision || data.status || 'ACTIVE') + ' · Extension 1.0.88';
  }
  if (msg.command === 'interfaceStatus' && msg.interfaceApex && msg.interfaceApex.success === true) {
    const data = msg.interfaceApex.data || {};
    const template = data.template || {};
    document.getElementById('experience').textContent =
      'L21 Streaming Multilingual Chat Apex · L20 Technical Capability Apex · L17 Chat Interface Apex · L16 Vital Chat Apex · ' +
      (data.decision || data.status || 'ACTIVE') + ' · Extension 1.0.88';
    if (Array.isArray(template.regions)) {
      document.getElementById('contextRail').innerHTML = template.regions
        .slice(0, 8)
        .map(region => '<span>' + String(region).replace(/_/g, ' ') + '</span>')
        .join('');
    }
  }
  if (msg.command === 'ideApexStatus' && msg.ideApex && msg.ideApex.success === true) {
    const data = msg.ideApex.data || {};
    document.getElementById('experience').textContent =
      'L21 Streaming Multilingual Chat Apex · L20 Technical Capability Apex · L19 IDE Apex · L18 Debugging Apex · ' +
      (data.decision || data.status || 'ACTIVE') + ' · Extension 1.0.88';
  }
  if (
    msg.command === 'technicalCapabilityStatus' &&
    msg.technicalCapability &&
    msg.technicalCapability.success === true
  ) {
    const data = msg.technicalCapability.data || {};
    const order = Array.isArray(data.chatApexOrder) ? data.chatApexOrder : [];
    document.getElementById('experience').textContent =
      'L21 Streaming Multilingual Chat Apex · L20 Technical Capability Apex · ' +
      (data.decision || data.status || 'ACTIVE') +
      ' · Extension 1.0.88';
    if (order.length) {
      document.getElementById('apex').innerHTML = order
        .map(name => '<b class="active" title="ACTIVE">' + String(name) + '</b>')
        .join('');
    }
  }
  if (
    msg.command === 'streamingApexStatus' &&
    msg.streamingApex &&
    msg.streamingApex.success === true
  ) {
    const data = msg.streamingApex.data || {};
    const order = Array.isArray(data.chatApexOrder) ? data.chatApexOrder : [];
    document.getElementById('experience').textContent =
      'L21 Streaming Multilingual Chat Apex · ' +
      (data.decision || data.status || 'ACTIVE') +
      ' · SSE · RTL/LTR · Extension 1.0.88';
    if (order.length) {
      document.getElementById('apex').innerHTML = order
        .map(name => '<b class="active" title="ACTIVE">' + String(name) + '</b>')
        .join('');
    }
  }
});
</script>
</body>
</html>`;
  }
}

module.exports = { SheikhaChatProvider };
