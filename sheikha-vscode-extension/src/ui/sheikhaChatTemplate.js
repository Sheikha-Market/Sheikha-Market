'use strict';

const QUICK_ACTIONS = Object.freeze([
  {
    label: 'لوحة المالك',
    prompt:
      'اعرض حالة مركز المالك والأدوار والمهام الآلية وحدود الموافقات البشرية.'
  },
  {
    label: 'حالة المنظومة',
    prompt: 'حلل حالة منظومة شيخة الحالية من Enterprise Inspector وحدد أفضل إجراء تالٍ.'
  },
  {
    label: 'مراجعة المشروع',
    prompt: 'حلل Workspace وGit الحاليين وحدد مخاطر الاختبار والدمج.'
  },
  {
    label: 'التشخيص',
    prompt: 'راجع أخطاء وتحذيرات VS Code الحالية واقترح خطة إصلاح مرتبة.'
  },
  {
    label: 'التوزيع V2',
    prompt: 'افحص حالة Universal Delivery V2 والحزم والأدلة المحلية دون نشر خارجي.'
  },
  {
    label: 'حوار الأفكار',
    prompt:
      'قارن الليبرالية والاشتراكية في مفهوم العدالة بحوار بنّاء موثق.',
    mode: 'constructive'
  }
]);

const CHAT_TOOL_GROUPS = Object.freeze([
  Object.freeze({
    id: 'conversation',
    label: 'المحادثة والوكلاء',
    tools: Object.freeze([
      { command: 'sheikha.openChat', label: 'تركيز الشات', icon: 'ش', description: 'فتح شات شيخة وإحضاره إلى الواجهة' },
      { command: 'sheikha.ask', label: 'سؤال جديد', icon: '?', description: 'فتح إدخال لسؤال جديد وإرساله إلى الشات' },
      { command: 'sheikha.inlineChat', label: 'محادثة مع التحديد', icon: '<>', description: 'إرسال النص أو الملف المحدد مع تعليمة محكومة' },
      { command: 'sheikha.startAgent', label: 'وكيل محكوم', icon: 'A', description: 'بدء مهمة وكيل ضمن حدود التنفيذ والمراجعة' },
      { command: 'sheikha.agent.run', label: 'مهمة وكيل', icon: 'AI', description: 'تشغيل مسار مهمة بخطة واختبارات وحدود أمان' },
      { command: 'sheikha.triggerCompletion', label: 'اقتراح كود', icon: '+', description: 'طلب اقتراح كود للسياق المفتوح' },
      { command: 'sheikha.nextEditSuggestion', label: 'التعديل التالي', icon: '>>', description: 'إظهار اقتراح التعديل التالي داخل المحرر' },
      { command: 'sheikha.enableNES', label: 'شبكة NES', icon: 'N', description: 'تفعيل أو تعطيل اقتراحات الشبكة الرقمية' }
    ])
  }),
  Object.freeze({
    id: 'code',
    label: 'الكود والتحقق',
    tools: Object.freeze([
      { command: 'sheikha.refactorCode', label: 'إعادة الهيكلة', icon: 'R', description: 'إعادة هيكلة التحديد مع الحفاظ على السلوك' },
      { command: 'sheikha.explainCode', label: 'شرح الكود', icon: 'i', description: 'شرح المدخلات والمخرجات والمخاطر بالعربية' },
      { command: 'sheikha.generateTests', label: 'توليد الاختبارات', icon: 'T', description: 'إنشاء اختبارات وفق إطار المشروع الحالي' },
      { command: 'sheikha.reviewCode', label: 'مراجعة الكود', icon: 'V', description: 'مراجعة الأخطاء والانحدارات والاختبارات الناقصة' },
      { command: 'sheikha.optimizePerformance', label: 'تحسين الأداء', icon: '%', description: 'اقتراح تحسينات أداء مقيسة دون تغيير السلوك' },
      { command: 'sheikha.checkSharia', label: 'مراجعة قيمية', icon: '✓', description: 'مراجعة السياسات القيمية مع إحالة الأحكام لمختص بشري' }
    ])
  }),
  Object.freeze({
    id: 'diagnostics',
    label: 'الحالة والتشخيص',
    tools: Object.freeze([
      { command: 'sheikha.showStatus', label: 'Enterprise Inspector', icon: 'I', description: 'فتح حالة المنظومة الموثقة من المفتش المؤسسي' },
      { command: 'sheikha.cli.status', label: 'الحالة العامة', icon: 'S', description: 'قراءة حالة Runtime المحلية' },
      { command: 'sheikha.cli.health', label: 'فحص الصحة', icon: '+', description: 'قراءة نقطة الصحة المحلية' },
      { command: 'sheikha.debugger.run', label: 'الفحص الكامل', icon: 'D', description: 'فتح نتيجة Debugging Apex الحالية' },
      { command: 'sheikha.debugger.logs', label: 'سجلات التشغيل', icon: '≡', description: 'فتح سجلات PM2 المحلية في الطرفية' },
      { command: 'sheikha.openWorkspaceControl', label: 'تحكم مساحة العمل', icon: 'W', description: 'فتح لوحة Enterprise Inspector' },
      { command: 'sheikha.awareness.scan', label: 'وعي VS Code', icon: '@', description: 'جمع لقطة وعي محلية وعرضها دون تعديل' }
    ])
  }),
  Object.freeze({
    id: 'intelligence',
    label: 'الذكاء والسجلات',
    tools: Object.freeze([
      { command: 'sheikha.neuralNetwork', label: 'الشبكة العصبية', icon: 'NN', description: 'فتح حالة Root Neural Fabric' },
      { command: 'sheikha.activateNeuralEngine', label: 'تفعيل المحرك', icon: 'ON', description: 'طلب تفعيل صريح بعد موافقة بشرية', impact: 'approval' },
      { command: 'sheikha.validateRootNeuralIntegration', label: 'تحقق التكامل', icon: '✓', description: 'تشغيل تحقق قراءة فقط للتكامل الجذري' },
      { command: 'sheikha.registry.unified', label: 'السجل الموحد', icon: 'U', description: 'عرض سجل القدرات الموحد' },
      { command: 'sheikha.registry.broker', label: 'وسيط السجلات', icon: 'B', description: 'عرض وسيط السجلات المحلي' },
      { command: 'sheikha.registry.global', label: 'نسيج السجل العام', icon: 'G', description: 'عرض نسيج السجل العام المكتشف' }
    ])
  }),
  Object.freeze({
    id: 'account',
    label: 'الحساب والتكامل',
    tools: Object.freeze([
      { command: 'sheikha.signIn', label: 'تسجيل الدخول', icon: '+@', description: 'تسجيل الدخول إلى حساب شيخة المحلي' },
      { command: 'sheikha.signOut', label: 'تسجيل الخروج', icon: '-@', description: 'حذف جلسة الحساب من SecretStorage المحلي' },
      { command: 'sheikha.manageAccount', label: 'إدارة الحساب', icon: '@', description: 'عرض حالة الحساب المحلي دون كشف الأسرار' },
      { command: 'sheikha.syncIntegrations', label: 'مزامنة التكاملات', icon: '<>', description: 'مزامنة قائمة الإضافات مع الخادم المحلي بطلب صريح' },
      { command: 'sheikha.openIntegrationsDashboard', label: 'لوحة التكاملات', icon: '[]', description: 'فتح لوحة التكاملات في المفتش' },
      { command: 'sheikha.gitStatus', label: 'حالة Git', icon: 'G', description: 'فتح لوحة التحكم بالمصدر المحلية' },
      { command: 'sheikha.openPullRequest', label: 'Pull Request اختياري', icon: 'PR', description: 'فتح مزود GitHub فقط إن كان مثبتًا ومطلوبًا' },
      { command: 'sheikha.openMergeRequest', label: 'Merge Request اختياري', icon: 'MR', description: 'فتح مزود GitLab فقط إن كان مثبتًا ومطلوبًا' }
    ])
  }),
  Object.freeze({
    id: 'runtime',
    label: 'التشغيل والتطوير',
    tools: Object.freeze([
      { command: 'sheikha.runtime.restart', label: 'إعادة Runtime', icon: '↻', description: 'طلب إعادة تشغيل محلية بعد موافقة بشرية', impact: 'approval' },
      { command: 'sheikha.devtools.toggle', label: 'أدوات المطور', icon: '</>', description: 'فتح أو إغلاق أدوات مطور VS Code' },
      { command: 'sheikha.console.open', label: 'وحدة شيخة', icon: '>_', description: 'فتح طرفية التشخيص المحلي المحكومة' },
      { command: 'sheikha.inspector.devtools', label: 'أدوات المفتش', icon: 'DI', description: 'فتح وحدة شيخة وأدوات المطور معًا' }
    ])
  })
]);

const CHAT_TOOLS = Object.freeze(
  CHAT_TOOL_GROUPS.flatMap((group) => group.tools)
);
const CHAT_TOOL_COMMAND_IDS = Object.freeze(
  CHAT_TOOLS.map((tool) => tool.command)
);

function getChatTool(command) {
  return CHAT_TOOLS.find((tool) => tool.command === command) || null;
}

const CHAT_MODES = Object.freeze([
  ['smart', 'ذكي'],
  ['constructive', 'حوار فكري محكوم'],
  ['standard', 'قياسي'],
  ['pro', 'احترافي متعدد النماذج'],
  ['ultra', 'فائق بميزانية معتمدة'],
  ['streaming', 'بث مباشر'],
  ['generative', 'توليد'],
  ['rag', 'استرجاع موثق'],
  ['agentic', 'وكيل محكوم'],
  ['multi-agent', 'وكلاء متعددون'],
  ['mcp', 'أدوات MCP'],
  ['sdk', 'تكامل SDK'],
  ['cli', 'CLI'],
  ['graphics', 'واجهات ورسوم'],
  ['agi-research', 'بحث AGI'],
  ['asi-research', 'بحث ASI']
]);

const DIALOGUE_AUDIENCES = Object.freeze([
  ['GENERAL_PUBLIC', 'الجمهور العام'],
  ['LEARNER', 'المتعلم'],
  ['TECHNICAL_PROFESSIONAL', 'الممارس التقني'],
  ['RESEARCHER', 'الباحث'],
  ['COMMUNITY_FACILITATOR', 'ميسر الحوار'],
  ['DECISION_REVIEWER', 'مراجع القرار']
]);

const APEX_LAYERS = Object.freeze([
  ['L24', 'Computing Cognitive Apex'],
  ['L23', 'Extension Streaming Artifact Apex'],
  ['L21', 'Streaming Multilingual Chat Apex'],
  ['L20', 'Technical Capability Apex'],
  ['L19', 'IDE Apex'],
  ['L18', 'Debugging Apex'],
  ['L17', 'Chat Interface Apex'],
  ['L16', 'Vital Chat Apex']
]);

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSheikhaChatTemplate(options = {}) {
  const nonce = esc(options.nonce || '');
  const version = esc(options.version || 'unknown');
  const modeOptions = CHAT_MODES.map(([value, label]) => (
    `<option value="${esc(value)}">${esc(label)}</option>`
  )).join('');
  const audienceOptions = DIALOGUE_AUDIENCES.map(
    ([value, label]) => (
      `<option value="${esc(value)}">${esc(label)}</option>`
    )
  ).join('');
  const quickActions = QUICK_ACTIONS.map((action) => (
    `<button class="quick-action" data-prompt="${esc(action.prompt)}" data-mode="${esc(action.mode || '')}" title="${esc(action.label)}">${esc(action.label)}</button>`
  )).join('');
  const apexRows = APEX_LAYERS.map(([level, name]) => (
    `<li data-layer="${esc(level)}"><span><b>${esc(level)}</b> ${esc(name)}</span><em>جارٍ الفحص</em></li>`
  )).join('');
  const toolGroups = CHAT_TOOL_GROUPS.map((group) => {
    const tools = group.tools.map((tool) => (
      `<button type="button" class="tool-action" data-tool-command="${esc(tool.command)}" data-tool-label="${esc(tool.label)}" data-tool-search="${esc(`${tool.label} ${tool.description} ${tool.command}`)}" data-tool-impact="${esc(tool.impact || 'standard')}" title="${esc(tool.description)}"><span class="tool-glyph" aria-hidden="true">${esc(tool.icon)}</span><span class="tool-copy"><b>${esc(tool.label)}</b><small>${esc(tool.description)}</small></span>${tool.impact === 'approval' ? '<em>موافقة</em>' : ''}</button>`
    )).join('');
    return `<section class="tool-group" data-tool-group="${esc(group.id)}"><h2>${esc(group.label)}<span>${group.tools.length}</span></h2><div class="tool-grid">${tools}</div></section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{
  color-scheme:light dark;
  --bg:var(--vscode-sideBar-background,#0d1117);
  --surface:var(--vscode-editor-background,#10161e);
  --surface-raised:var(--vscode-input-background,#151d27);
  --line:var(--vscode-panel-border,#303b48);
  --text:var(--vscode-foreground,#eef2f6);
  --muted:var(--vscode-descriptionForeground,#98a4b2);
  --focus:var(--vscode-focusBorder,#5b9bd5);
  --accent:var(--vscode-button-background,#2f6f4e);
  --accent-text:var(--vscode-button-foreground,#fff);
  --good:#68c083;
  --warn:#d5ad45;
  --bad:#e36d72;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--text);font:13px/1.55 system-ui,sans-serif;letter-spacing:0}
button,input,select,textarea{font:inherit;letter-spacing:0}
button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:1px solid var(--focus);outline-offset:1px}
.app{min-height:100%;display:grid;grid-template-rows:auto auto auto minmax(280px,1fr) auto}
.topbar{padding:12px 12px 9px;border-bottom:1px solid var(--line);background:var(--surface)}
.identity{display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:center;gap:9px}
.mark{width:34px;height:34px;display:grid;place-items:center;border:1px solid #39744e;border-radius:7px;background:#12251a;color:var(--good);font-weight:800}
.title{min-width:0}.title h1{margin:0;font-size:15px;line-height:1.35}.title p{margin:2px 0 0;color:var(--muted);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:ltr;text-align:right}
.health{display:inline-flex;align-items:center;gap:6px;color:var(--good);font-size:10px;white-space:nowrap}.health::before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}
.health[data-state="busy"]{color:var(--warn)}.health[data-state="error"]{color:var(--bad)}
.toolbar{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;align-items:center;gap:8px;margin-top:10px}
.mode-field{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:7px;color:var(--muted);font-size:11px}
select{min-width:0;width:100%;height:30px;border:1px solid var(--line);border-radius:6px;background:var(--surface-raised);color:var(--text);padding:0 8px}
.governance{border-top:1px solid var(--line);margin-top:9px;padding-top:7px}
.governance summary{cursor:pointer;color:var(--muted);font-size:11px;list-style:none;display:flex;justify-content:space-between;gap:8px}.governance summary::-webkit-details-marker{display:none}.governance summary::after{content:'⌄';color:var(--good)}.governance[open] summary::after{content:'⌃'}
.layer-list{list-style:none;margin:8px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px;direction:ltr}
.layer-list li{display:flex;justify-content:space-between;gap:8px;min-width:0;padding:4px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 55%,transparent);font-size:10px;color:var(--muted)}
.layer-list span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.layer-list b{color:var(--text)}.layer-list em{color:var(--warn);font-style:normal;white-space:nowrap}.layer-list li[data-state="active"] em{color:var(--good)}.layer-list li[data-state="error"] em{color:var(--bad)}
.quickbar{display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:thin}
button{height:30px;border:1px solid var(--line);border-radius:6px;background:var(--surface-raised);color:var(--text);padding:0 9px;cursor:pointer;white-space:nowrap}
button:hover{border-color:var(--focus)}button:disabled{opacity:.55;cursor:wait}
.quick-action{font-size:11px;color:var(--muted)}
.toolbox{border-bottom:1px solid var(--line);background:var(--surface)}
.toolbox>summary{height:34px;padding:0 12px;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--text);font-size:11px}
.toolbox>summary::-webkit-details-marker{display:none}.toolbox>summary::after{content:'⌄';color:var(--good);margin-inline-start:2px}.toolbox[open]>summary::after{content:'⌃'}
.toolbox>summary span:first-child{font-weight:700}.toolbox>summary em{margin-inline-start:auto;color:var(--muted);font-style:normal;font-size:10px}
.toolbox-body{max-height:min(58vh,520px);overflow-y:auto;padding:0 12px 12px;scrollbar-width:thin}
.tool-filter{position:sticky;z-index:1;top:0;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 0;background:var(--surface)}
#toolSearch{width:100%;height:30px;border:1px solid var(--line);border-radius:6px;background:var(--surface-raised);color:var(--text);padding:0 9px}
#toolStatus{color:var(--muted);font-size:10px;white-space:nowrap}#toolStatus[data-state="running"]{color:var(--warn)}#toolStatus[data-state="success"]{color:var(--good)}#toolStatus[data-state="error"]{color:var(--bad)}
.tool-group{padding:7px 0 4px;border-top:1px solid color-mix(in srgb,var(--line) 65%,transparent)}
.tool-group h2{display:flex;align-items:center;justify-content:space-between;margin:0 0 6px;color:var(--muted);font-size:10px;font-weight:600}.tool-group h2 span{direction:ltr;font-variant-numeric:tabular-nums}
.tool-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:6px}
.tool-action{position:relative;height:auto;min-height:44px;display:grid;grid-template-columns:28px minmax(0,1fr) auto;align-items:center;gap:7px;padding:6px;text-align:start;white-space:normal}
.tool-action:hover{background:color-mix(in srgb,var(--focus) 9%,var(--surface-raised))}.tool-action[data-available="false"]{opacity:.45}
.tool-glyph{width:28px;height:28px;display:grid;place-items:center;border:1px solid var(--line);border-radius:5px;color:var(--good);direction:ltr;font-size:10px;font-weight:800}
.tool-copy{min-width:0;display:grid;gap:1px}.tool-copy b{overflow:hidden;color:var(--text);font-size:11px;text-overflow:ellipsis;white-space:nowrap}.tool-copy small{display:-webkit-box;overflow:hidden;color:var(--muted);font-size:9px;line-height:1.35;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.tool-action em{align-self:start;border:1px solid color-mix(in srgb,var(--warn) 65%,var(--line));border-radius:4px;padding:1px 4px;color:var(--warn);font-size:8px;font-style:normal}
.conversation{display:flex;flex-direction:column;gap:10px;padding:12px;overflow-y:auto;min-height:0;scrollbar-width:thin}
.message{max-width:94%;min-width:0;align-self:flex-start;border-inline-start:3px solid var(--line);padding:8px 10px;background:color-mix(in srgb,var(--surface) 82%,transparent);border-radius:0 6px 6px 0;white-space:pre-wrap;overflow-wrap:anywhere;unicode-bidi:plaintext}
.message.user{align-self:flex-end;border-inline-start:0;border-inline-end:3px solid var(--focus);background:color-mix(in srgb,var(--focus) 12%,var(--surface));border-radius:6px 0 0 6px}
.message.streaming{border-color:var(--good)}.message.error{border-color:var(--bad)}
.role{display:block;color:var(--muted);font-size:9px;margin-bottom:3px}.message.user .role{text-align:left}
.typing{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:11px}.typing::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--warn);animation:pulse 1s ease-in-out infinite}
@keyframes pulse{50%{opacity:.35}}
.trace{max-width:94%;align-self:flex-start;color:var(--muted);font-size:10px}.trace summary{cursor:pointer}.trace div{margin-top:5px;padding-inline-start:9px;border-inline-start:1px solid var(--line);unicode-bidi:plaintext}
.composer{position:sticky;z-index:2;bottom:0;padding:9px 12px 11px;border-top:1px solid var(--line);background:var(--surface)}
.compose-row{display:grid;grid-template-columns:minmax(0,1fr) 34px;gap:7px;align-items:end;margin:0}
textarea{width:100%;max-height:180px;min-height:44px;resize:none;border:1px solid var(--line);border-radius:7px;background:var(--vscode-input-background,var(--surface-raised));color:var(--vscode-input-foreground,var(--text));padding:10px;line-height:1.5;overflow-y:auto}
#send{position:relative;z-index:3;width:34px;height:34px;padding:0;display:grid;place-items:center;background:var(--accent);border-color:transparent;color:var(--accent-text);pointer-events:auto;touch-action:manipulation}
#send svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.composer-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;color:var(--muted);font-size:9px}
#clear{height:auto;border:0;background:transparent;padding:2px 0;color:var(--muted);font-size:10px}
@media(max-width:420px){.app{grid-template-rows:auto auto auto minmax(240px,1fr) auto}.layer-list{grid-template-columns:1fr}.title p{max-width:210px}.message{max-width:100%}.tool-grid{grid-template-columns:1fr}.toolbox-body{max-height:52vh}}
</style>
</head>
<body>
<main class="app">
  <header class="topbar">
    <div class="identity">
      <div class="mark" aria-hidden="true">ش</div>
      <div class="title"><h1>شات شيخة</h1><p>Local governed runtime · Extension ${version}</p></div>
      <div class="health" id="health" data-state="ready">متصل</div>
    </div>
    <div class="toolbar">
      <label class="mode-field"><span>الوضع</span><select id="mode" title="وضع الاستدلال">${modeOptions}</select></label>
      <label class="mode-field" id="audienceField" hidden><span>الجمهور</span><select id="audience" title="سياق الجمهور">${audienceOptions}</select></label>
      <button id="clear" title="مسح سجل المحادثة">مسح</button>
    </div>
    <details class="governance" id="governance">
      <summary><span id="governanceSummary">الحوكمة والمسار التشغيلي</span><span>8 طبقات</span></summary>
      <ul class="layer-list" id="layerList">${apexRows}</ul>
    </details>
  </header>
  <nav class="quickbar" aria-label="إجراءات سريعة">${quickActions}</nav>
  <details class="toolbox" id="toolbox">
    <summary><span>أدوات شيخة</span><em id="toolCount">${CHAT_TOOLS.length} أداة محكومة</em></summary>
    <div class="toolbox-body">
      <div class="tool-filter">
        <input id="toolSearch" type="search" inputmode="search" autocomplete="off" aria-label="البحث في أدوات الشات" placeholder="ابحث عن أداة أو أمر...">
        <span id="toolStatus" role="status" aria-live="polite">جارٍ التحقق</span>
      </div>
      <div id="toolGroups">${toolGroups}</div>
    </div>
  </details>
  <section class="conversation" id="log" aria-live="polite">
    <div class="message assistant"><span class="role">شيخة</span>بسم الله الرحمن الرحيم\n\nما الذي تحتاج إليه من مساعدة أو عون؟</div>
  </section>
  <footer class="composer">
    <form class="compose-row" id="composerForm">
      <textarea id="input" rows="1" dir="auto" aria-label="رسالتك" placeholder="اكتب رسالتك..."></textarea>
      <button id="send" type="button" title="إرسال" aria-label="إرسال">
        <svg data-lucide="send-horizontal" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 3 3 9-3 9 19-9Z"></path>
          <path d="M6 12h16"></path>
        </svg>
      </button>
    </form>
    <div class="composer-meta"><span id="activity">جارٍ تهيئة قناة الإرسال</span><span>Enter للإرسال · Shift+Enter لسطر جديد</span></div>
  </footer>
</main>
<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
const previousState = vscode.getState() || {};
const log = document.getElementById('log');
const composerForm = document.getElementById('composerForm');
const input = document.getElementById('input');
const send = document.getElementById('send');
const clear = document.getElementById('clear');
const modeSelect = document.getElementById('mode');
const audienceSelect = document.getElementById('audience');
const audienceField = document.getElementById('audienceField');
const health = document.getElementById('health');
const activity = document.getElementById('activity');
const toolSearch = document.getElementById('toolSearch');
const toolStatus = document.getElementById('toolStatus');
const toolCount = document.getElementById('toolCount');
const toolButtons = Array.from(document.querySelectorAll('[data-tool-command]'));
const toolGroups = Array.from(document.querySelectorAll('[data-tool-group]'));
let busy = false;
let bridgeReady = false;
let readyAttempts = 0;
let readyTimer = null;
let requestTimer = null;
let typingMessage = null;
let streamingMessage = null;
let activeToolId = '';
let availableToolIds = null;
const REQUEST_IDLE_TIMEOUT_MS = 100000;

modeSelect.value = previousState.mode || 'smart';
audienceSelect.value = previousState.audience || 'GENERAL_PUBLIC';
input.value = previousState.draft || '';

function saveState() {
  vscode.setState({
    mode: modeSelect.value,
    audience: audienceSelect.value,
    draft: input.value
  });
}

function updateAudienceVisibility() {
  audienceField.hidden = modeSelect.value !== 'constructive';
}

function updateToolButtons() {
  toolButtons.forEach(function (button) {
    const toolId = button.dataset.toolCommand || '';
    const available = availableToolIds === null || availableToolIds.has(toolId);
    button.dataset.available = String(available);
    button.disabled = Boolean(activeToolId) || !available;
    button.setAttribute('aria-busy', String(activeToolId === toolId));
  });
}

function setToolStatus(text, state) {
  toolStatus.textContent = text;
  toolStatus.dataset.state = state || 'ready';
}

function invokeTool(button) {
  if (!button || activeToolId || button.dataset.available === 'false') return;
  const toolId = String(button.dataset.toolCommand || '');
  if (!toolId) return;
  if (!bridgeReady) announceReady();
  activeToolId = toolId;
  updateToolButtons();
  setToolStatus('تشغيل: ' + (button.dataset.toolLabel || toolId), 'running');
  vscode.postMessage({ command: 'tool', toolId: toolId });
}

function finishTool(toolId, label, success, message) {
  if (!toolId || activeToolId === toolId) activeToolId = '';
  updateToolButtons();
  const statusText = message || (success
    ? 'اكتمل: ' + (label || 'الأداة')
    : 'تعذر: ' + (label || 'الأداة'));
  setToolStatus(statusText, success ? 'success' : 'error');
}

function filterTools() {
  const query = String(toolSearch.value || '').trim().toLocaleLowerCase('ar');
  let visibleCount = 0;
  toolButtons.forEach(function (button) {
    const searchable = String(button.dataset.toolSearch || '').toLocaleLowerCase('ar');
    const visible = !query || searchable.includes(query);
    button.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  toolGroups.forEach(function (group) {
    group.hidden = !group.querySelector('.tool-action:not([hidden])');
  });
  toolCount.textContent = query
    ? visibleCount + ' من ${CHAT_TOOLS.length}'
    : '${CHAT_TOOLS.length} أداة محكومة';
}

function resizeInput() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 180) + 'px';
}

function setBusy(value, label) {
  busy = Boolean(value);
  send.disabled = busy;
  send.setAttribute('aria-busy', String(busy));
  clear.disabled = busy;
  health.dataset.state = busy ? 'busy' : 'ready';
  health.textContent = busy ? 'يعمل' : 'متصل';
  activity.textContent = label || (busy ? 'جارٍ المعالجة' : 'جاهز');
}

function finishRequest(label, errorState) {
  if (requestTimer) clearTimeout(requestTimer);
  requestTimer = null;
  setBusy(false, label);
  if (errorState) {
    health.dataset.state = 'error';
    health.textContent = 'تعذر';
  }
}

function armRequestTimeout() {
  if (requestTimer) clearTimeout(requestTimer);
  requestTimer = setTimeout(function () {
    clearTransient();
    if (streamingMessage && !String(messageTextNode(streamingMessage)?.nodeValue || '').trim()) {
      streamingMessage.remove();
    }
    streamingMessage = null;
    finishRequest('انتهت مهلة الرد؛ يمكنك إعادة الإرسال', true);
  }, REQUEST_IDLE_TIMEOUT_MS);
}

function announceReady() {
  if (bridgeReady) return;
  readyAttempts += 1;
  vscode.postMessage({
    command: 'ready',
    version: '${version}',
    attempt: readyAttempts
  });
  if (readyAttempts >= 10 && readyTimer) {
    clearInterval(readyTimer);
    readyTimer = null;
    activity.textContent = 'القناة بطيئة؛ الإرسال المباشر ما زال متاحًا';
    health.dataset.state = 'busy';
    health.textContent = 'مزامنة';
  }
}

function addMessage(text, role, className) {
  const article = document.createElement('article');
  article.className = 'message ' + (className || role || 'assistant');
  const roleLabel = document.createElement('span');
  roleLabel.className = 'role';
  roleLabel.textContent = role === 'user' ? 'أنت' : 'شيخة';
  article.appendChild(roleLabel);
  article.appendChild(document.createTextNode(String(text || '')));
  log.appendChild(article);
  article.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return article;
}

function messageTextNode(message) {
  return message && message.lastChild && message.lastChild.nodeType === Node.TEXT_NODE
    ? message.lastChild
    : null;
}

function addTrace(layers) {
  if (!Array.isArray(layers) || !layers.length) return;
  const details = document.createElement('details');
  details.className = 'trace';
  const summary = document.createElement('summary');
  summary.textContent = 'دليل مسار الرد · ' + layers.length + ' طبقات';
  const content = document.createElement('div');
  content.textContent = layers.map(function (layer) {
    return 'L' + layer.layer + ' ' + layer.name + ': ' + layer.status;
  }).join(' · ');
  details.append(summary, content);
  log.appendChild(details);
}

function clearTransient() {
  if (typingMessage) typingMessage.remove();
  typingMessage = null;
}

function ensureStreamingMessage() {
  if (!streamingMessage) streamingMessage = addMessage('', 'assistant', 'assistant streaming');
  return streamingMessage;
}

function ask(event) {
  if (event) event.preventDefault();
  if (!bridgeReady) {
    announceReady();
    activity.textContent = 'إرسال مباشر مع إعادة مزامنة القناة';
  }
  if (busy) return;
  const text = input.value.trim();
  if (!text) return;
  const requestedMode = modeSelect.value;
  let ultraBudgetApproved = false;
  if (requestedMode === 'ultra') {
    ultraBudgetApproved = window.confirm(
      'الوضع الفائق يشغّل حتى خمسة استدعاءات محلية. هل توافق على ميزانية هذا الطلب؟'
    );
    if (!ultraBudgetApproved) {
      activity.textContent = 'لم تُعتمد ميزانية الوضع الفائق';
      input.focus();
      return;
    }
  }
  addMessage(text, 'user', 'user');
  input.value = '';
  resizeInput();
  saveState();
  setBusy(true, 'إرسال الطلب');
  armRequestTimeout();
  vscode.postMessage({
    command: 'ask',
    text: text,
    mode: requestedMode === 'constructive'
      ? 'standard'
      : requestedMode,
    dialogueMode: requestedMode === 'constructive'
      ? 'constructive'
      : null,
    audienceContext: audienceSelect.value,
    religiousLensRequested:
      requestedMode === 'constructive',
    ultraBudgetApproved: ultraBudgetApproved
  });
}

function resetConversation() {
  if (busy) return;
  log.replaceChildren();
  addMessage('بسم الله الرحمن الرحيم\\n\\nما الذي تحتاج إليه من مساعدة أو عون؟', 'assistant', 'assistant');
  input.focus();
}

function setLayer(level, state) {
  const row = document.querySelector('[data-layer="' + level + '"]');
  if (!row) return;
  row.dataset.state = state === 'error' ? 'error' : 'active';
  const value = row.querySelector('em');
  if (value) value.textContent = state === 'error' ? 'تعذر' : 'نشط';
}

function readStatus(payload) {
  const root = payload && typeof payload === 'object' ? payload : {};
  const data = root.data && typeof root.data === 'object' ? root.data : root;
  return String(data.decision || data.status || (root.success === true ? 'ACTIVE' : 'UNKNOWN'));
}

function handleApexStatus(command, payload) {
  const levels = {
    organizationControlStatus: ['L24'],
    experienceStatus: ['L23'], vitalStatus: ['L16'], debuggingStatus: ['L18'],
    interfaceStatus: ['L17'], ideApexStatus: ['L19'], technicalCapabilityStatus: ['L20'],
    streamingApexStatus: ['L21'], extensionArtifactApexStatus: ['L23'],
    computingCognitiveApexStatus: ['L24']
  };
  const active = readStatus(payload).toUpperCase().includes('ACTIVE');
  (levels[command] || []).forEach(function (level) { setLayer(level, active ? 'active' : 'error'); });
  if (!active && payload && payload.success === false) {
    health.dataset.state = 'error';
    health.textContent = 'محدود';
  }
}

modeSelect.addEventListener('change', function () {
  updateAudienceVisibility();
  saveState();
});
audienceSelect.addEventListener('change', saveState);
input.addEventListener('input', function () { resizeInput(); saveState(); });
composerForm.addEventListener('submit', ask);
send.addEventListener('click', ask);
clear.addEventListener('click', resetConversation);
toolSearch.addEventListener('input', filterTools);
toolButtons.forEach(function (button) {
  button.addEventListener('click', function () { invokeTool(button); });
});
document.querySelectorAll('[data-prompt]').forEach(function (button) {
  button.addEventListener('click', function () {
    if (busy) return;
    if (button.dataset.mode) {
      modeSelect.value = button.dataset.mode;
      updateAudienceVisibility();
    }
    input.value = button.dataset.prompt || '';
    resizeInput();
    saveState();
    input.focus();
  });
});
input.addEventListener('keydown', function (event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    ask();
  }
});

window.addEventListener('message', function (event) {
  const msg = event.data || {};
  if (msg.command === 'readyAck') {
    bridgeReady = true;
    send.dataset.bridgeReady = 'true';
    if (readyTimer) clearInterval(readyTimer);
    readyTimer = null;
    document.body.dataset.webviewReady = 'true';
    if (!busy) setBusy(false, 'جاهز للإرسال');
  } else if (msg.command === 'toolAvailability') {
    availableToolIds = new Set(Array.isArray(msg.available) ? msg.available : []);
    updateToolButtons();
    const availableCount = availableToolIds.size;
    toolCount.textContent = availableCount + '/${CHAT_TOOLS.length} أداة جاهزة';
    setToolStatus(
      availableCount === ${CHAT_TOOLS.length}
        ? 'كل الأدوات جاهزة'
        : availableCount + ' متاحة، ' + (${CHAT_TOOLS.length} - availableCount) + ' غير متاحة',
      availableCount === ${CHAT_TOOLS.length} ? 'success' : 'error'
    );
  } else if (msg.command === 'toolStart') {
    activeToolId = String(msg.toolId || activeToolId || '');
    updateToolButtons();
    setToolStatus('تشغيل: ' + (msg.label || activeToolId), 'running');
  } else if (msg.command === 'toolResult') {
    finishTool(
      String(msg.toolId || ''),
      String(msg.label || ''),
      msg.success === true,
      String(msg.message || '')
    );
  } else if (msg.command === 'typing') {
    clearTransient();
    typingMessage = document.createElement('div');
    typingMessage.className = 'typing';
    typingMessage.textContent = msg.text || 'شيخة تقرأ السياق...';
    log.appendChild(typingMessage);
    typingMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setBusy(true, 'قراءة السياق');
  } else if (msg.command === 'streamStart') {
    clearTransient();
    streamingMessage = addMessage('', 'assistant', 'assistant streaming');
    setBusy(true, 'بث الاستجابة');
    armRequestTimeout();
  } else if (msg.command === 'progress') {
    if (!busy) return;
    activity.textContent = msg.text || 'يجري توليد الإجابة';
    health.dataset.state = 'busy';
    health.textContent = 'يعمل';
    armRequestTimeout();
  } else if (msg.command === 'streamToken') {
    clearTransient();
    const message = ensureStreamingMessage();
    const node = messageTextNode(message);
    if (node) node.nodeValue += msg.text || '';
    message.scrollIntoView({ behavior: 'smooth', block: 'end' });
    armRequestTimeout();
  } else if (msg.command === 'streamDone') {
    clearTransient();
    const finalText = String(msg.text || '');
    if (!streamingMessage) streamingMessage = addMessage(finalText, 'assistant', 'assistant');
    const node = messageTextNode(streamingMessage);
    if (node && finalText && node.nodeValue.trim() !== finalText.trim()) node.nodeValue = finalText;
    streamingMessage.classList.remove('streaming');
    streamingMessage = null;
    addTrace(msg.meta && msg.meta.layers);
    finishRequest('اكتمل الرد', false);
  } else if (msg.command === 'reply') {
    if (msg.meta && msg.meta.busy) {
      finishRequest('طلب سابق قيد التنفيذ', false);
      return;
    }
    clearTransient();
    if (streamingMessage && !String(messageTextNode(streamingMessage)?.nodeValue || '').trim()) streamingMessage.remove();
    streamingMessage = null;
    addMessage(msg.text || '', 'assistant', msg.meta && msg.meta.error ? 'assistant error' : 'assistant');
    addTrace(msg.meta && msg.meta.layers);
    finishRequest(
      msg.meta && msg.meta.error ? 'تعذر المسار' : 'اكتمل الرد',
      Boolean(msg.meta && msg.meta.error)
    );
  } else if (msg.command === 'prefill') {
    if (busy) return;
    input.value = msg.text || '';
    resizeInput();
    saveState();
    input.focus();
    if (msg.autoSend) ask();
  }

  const payloadByCommand = {
    experienceStatus: msg.experience, vitalStatus: msg.vital,
    debuggingStatus: msg.debugging, interfaceStatus: msg.interfaceApex,
    ideApexStatus: msg.ideApex, technicalCapabilityStatus: msg.technicalCapability,
    streamingApexStatus: msg.streamingApex, extensionArtifactApexStatus: msg.extensionArtifactApex,
    computingCognitiveApexStatus: msg.computingCognitiveApex
  };
  if (Object.prototype.hasOwnProperty.call(payloadByCommand, msg.command)) {
    handleApexStatus(msg.command, payloadByCommand[msg.command]);
  }
});

resizeInput();
updateAudienceVisibility();
updateToolButtons();
filterTools();
input.focus();
setBusy(false, 'جاهز للإرسال');
readyTimer = setInterval(announceReady, 500);
announceReady();
</script>
</body>
</html>`;
}

module.exports = {
  APEX_LAYERS,
  CHAT_MODES,
  CHAT_TOOL_COMMAND_IDS,
  CHAT_TOOL_GROUPS,
  CHAT_TOOLS,
  DIALOGUE_AUDIENCES,
  QUICK_ACTIONS,
  getChatTool,
  renderSheikhaChatTemplate
};
