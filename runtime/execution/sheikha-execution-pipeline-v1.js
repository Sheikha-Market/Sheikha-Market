'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const modelExecutor = require('../model-cluster/sheikha-model-executor-v1');

function safeExec(cmd, cwd) {
  try {
    return cp.execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 8000
    }).trim();
  } catch (e) {
    return '';
  }
}

function readJsonSafe(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

function classifyIntent(message) {
  const text = String(message || '');

  if (/شعار|logo|هوية|brand|علامة/i.test(text)) return 'GRAPHICS_LOGO_PLAN';
  if (/دبق|ديبق|ديبنق|debug|fix|اصلح|اختبار|test|error/i.test(text)) return 'DEBUG_PIPELINE';
  if (/تقرير|report/i.test(text)) {
    return /المشروع|المستودع|repo|repository|git|runtime|التشغيل|الفرع|ملفات معدلة/i.test(text)
      ? 'REPORT_PIPELINE'
      : 'CONTENT_REPORT';
  }
  if (/حلل|تحليل|افحص/i.test(text)) {
    return /المشروع|المستودع|repo|repository|git|runtime|التشغيل|الكود/i.test(text)
      ? 'REPORT_PIPELINE'
      : 'GENERAL_AGENT';
  }
  if (/فرع|branch|git status|ملفات معدلة|changed files/i.test(text)) return 'CLI_READ_ONLY';
  if (/وثائق|معمارية|حوكمة|docs|architecture|governance/i.test(text)) return 'RAG_LOOKUP';
  if (/مخطط|رسم|graph|diagram/i.test(text)) return 'GRAPHICS_PLAN';
  if (/sdk|api|client|تكامل/i.test(text)) return 'SDK_PLAN';

  return 'GENERAL_AGENT';
}

function isFoundryTopic(message) {
  return /foundry|فوندري|فوندرى|الفنودري|الفاوندري|فاوندري|فاندر/i.test(String(message || ''));
}

function buildFoundryReport() {
  const { status } = require('../../core/foundry/sheikha-foundry-v1');
  const foundry = status();
  const activeLayers = Object.entries(foundry.layers || {})
    .filter(([, state]) => state === 'ACTIVE')
    .map(([name]) => name);

  return [
    '## تقرير عن Sheikha Foundry V1',
    '',
    `- الحالة: ${foundry.status}`,
    `- النظام: ${foundry.foundry}`,
    `- الغرض: ${foundry.purpose}`,
    '',
    '### الطبقات الفعالة',
    ...activeLayers.map((layer) => `- ${layer}`),
    '',
    '### المخرجات',
    ...(foundry.outputs || []).map((output) => `- ${output}`),
    '',
    '### دورة العمل',
    '1. استقبال الفكرة أو الطلب وتحديد المقصود.',
    '2. تطبيق الحوكمة وتقييم المخاطر قبل التنفيذ.',
    '3. تصميم Capability وعقد Route وسياسة واضحة.',
    '4. إعداد خطة التنفيذ والاختبارات.',
    '5. ربط Inspector وExtension عند الحاجة.',
    '6. إصدار خطة النشر والمراقبة والأدلة.',
    '',
    '### الحوكمة',
    `- الحوكمة قبل التنفيذ: ${foundry.governance.beforeExecution ? 'نعم' : 'لا'}`,
    `- الوضع الآمن افتراضيًا: ${foundry.governance.safeByDefault ? 'نعم' : 'لا'}`,
    `- منع الإجراء المدمر بلا مراجعة: ${foundry.governance.noDestructiveActionWithoutReview ? 'نعم' : 'لا'}`,
    `- المبدأ: ${foundry.governance.principle}`,
    '',
    '### التقييم',
    'Sheikha Foundry V1 مفعّل كمصنع قدرات برمجية محكوم. وهو ينظم الانتقال من الفكرة إلى التصميم والاختبار والإصدار، ولا يعني وحده أن كل قدرة مقترحة نُشرت إنتاجيًا.'
  ].join('\n');
}

const MODE_ALIASES = {
  agent: 'agentic',
  multi_agent: 'multi-agent',
  agi: 'agi-research',
  asi: 'asi-research'
};

function normalizeIntelligenceMode(mode) {
  const normalized = String(mode || 'smart').trim().toLowerCase();
  return MODE_ALIASES[normalized] || normalized || 'smart';
}

function intentForMode(message, mode) {
  const modeIntents = {
    generative: 'GENERATIVE_AI',
    rag: 'RAG_LOOKUP',
    agentic: 'AGENTIC_PLAN',
    'multi-agent': 'MULTI_AGENT_COORDINATION',
    'agi-research': 'AGI_RESEARCH_EVALUATION',
    'asi-research': 'ASI_RESEARCH_EVALUATION',
    mcp: 'MCP_TOOL_PLAN',
    sdk: 'SDK_PLAN',
    cli: 'CLI_READ_ONLY',
    graphics: 'GRAPHICS_PLAN'
  };

  return modeIntents[mode] || classifyIntent(message);
}

function buildRagContract(message) {
  return [
    '## RAG محكوم بالمصادر',
    '',
    `- السؤال: ${message || 'غير محدد'}`,
    '- الحالة: طلب استرجاع جاهز، ولا توجد إجابة مصدرية ملفقة.',
    '- المطلوب: تحديد المصادر المصرح بها، الاسترجاع، ترتيب الأدلة، ثم فحص التأصيل.',
    '- المخرج المقبول: إجابة مع أثر مصدر وحدود ثقة واضحة.',
    '',
    '### بوابات التنفيذ',
    '1. حقوق الوصول إلى المصدر.',
    '2. تتبع الاقتباس والمرجع.',
    '3. فحص توافق الإجابة مع الأدلة.',
    '4. إظهار النقص أو التعارض بدل التخمين.'
  ].join('\n');
}

function buildAgenticPlan(message) {
  return [
    '## خطة Agentic محكومة',
    '',
    `- الهدف: ${message || 'غير محدد'}`,
    '- الاستقلالية: محدودة بالسياسة والصلاحية والأدوات المعتمدة.',
    '',
    '### دورة العمل',
    '1. تحليل الهدف وحدود النجاح.',
    '2. جمع الأدلة والسياق.',
    '3. تقسيم العمل إلى خطوات قابلة للتحقق.',
    '4. طلب أقل صلاحية لازمة لكل أداة.',
    '5. تنفيذ الخطوات المأذونة فقط.',
    '6. اختبار النتيجة وتسجيل الدليل.',
    '7. إحالة القرارات عالية الأثر للمراجعة البشرية.'
  ].join('\n');
}

function buildMultiAgentPlan(message) {
  return [
    '## تنسيق Multi-Agent محكوم',
    '',
    `- المهمة: ${message || 'غير محددة'}`,
    '- النمط: أدوار منفصلة وسياق مشترك محكوم، بلا صلاحية مطلقة.',
    '',
    '### الأدوار',
    '- وكيل المعرفة: يجمع المصادر والسياق.',
    '- وكيل الأدلة: يتحقق من التتبع والتعارض.',
    '- وكيل التخطيط: يبني خطوات التنفيذ.',
    '- وكيل المخاطر: يصنف الأثر والصلاحيات.',
    '- وكيل التنفيذ: ينفذ الخطوات الموافق عليها فقط.',
    '- وكيل المراجعة: يختبر النتيجة ويسجل الدروس.',
    '',
    'أي تعارض أو قرار عالي الأثر ينتقل إلى المراجعة البشرية.'
  ].join('\n');
}

function buildResearchProgram(kind, message) {
  const status = kind === 'AGI' ? 'AGI غير متحقق' : 'ASI غير متحقق';
  return [
    `## برنامج بحث ${kind} في شيخة`,
    '',
    `- موضوع البحث: ${message || 'غير محدد'}`,
    `- حالة التحقق الفعلي: ${status}.`,
    '- التصنيف: بحث وتقييم وحوكمة مخاطر فقط.',
    '- لا يوجد ادعاء وعي أو تكافؤ بشري أو تفوق فائق.',
    '',
    '### المنهج',
    '1. تعريف فرضية قابلة للدحض.',
    '2. تحديد مقاييس واختبارات مستقلة.',
    '3. بناء تجربة قابلة للتكرار.',
    '4. تسجيل النتائج السلبية والإيجابية.',
    '5. مراجعة السلامة والقيود.',
    '6. نشر الحدود قبل أي ادعاء قدرة.'
  ].join('\n');
}

function buildMcpPlan(message) {
  return [
    '## خطة MCP محكومة',
    '',
    `- الهدف: ${message || 'غير محدد'}`,
    '- العقد المطلوب: schema للمدخل والمخرج، نطاق صلاحية، مرجع دليل، وسجل تدقيق.',
    '- التنفيذ الخارجي: لا يتم بلا تفويض أو عقد أو موافقة مناسبة.',
    '- الأسرار: لا تحفظ في Git ولا تظهر في المخرجات.'
  ].join('\n');
}

function buildSdkPlan(message) {
  return [
    '## خطة SDK / Fabric / MCP',
    '',
    `- التكامل: ${message || 'غير محدد'}`,
    '- SDK: عميل typed وعقد أخطاء وإصدارات.',
    '- Fabric: مسار مسجل وأولوية وترابط تشغيلي.',
    '- MCP: أداة محددة الصلاحية مع schema ودليل وتدقيق.',
    '- التحقق: tests ثم lint ثم governance ثم NO_DRIFT.'
  ].join('\n');
}

function runReadOnlyCli(workspaceRoot) {
  const cwd = workspaceRoot && fs.existsSync(workspaceRoot) ? workspaceRoot : process.cwd();
  const pkg = readJsonSafe(path.join(cwd, 'package.json'));

  return {
    cwd,
    branch: safeExec('git branch --show-current', cwd),
    status: safeExec('git status --short', cwd),
    scripts: pkg?.scripts || {},
    packageName: pkg?.name || null,
    packageVersion: pkg?.version || null
  };
}


function buildVSCodeToolsReport(vscodeTools) {
  if (!vscodeTools || vscodeTools.status !== 'ACTIVE') return '';

  const lines = [
    '',
    '## تقرير أدوات VS Code',
    '',
    `- Registry: ${vscodeTools.registry || 'UNKNOWN'}`,
    `- Workspace: ${vscodeTools.workspaceRoot || 'غير متوفر'}`,
    `- الفرع المحلي: ${vscodeTools.gitBranch || 'غير متوفر'}`,
    `- الملف النشط: ${vscodeTools.activeFile || 'لا يوجد ملف نشط'}`,
    `- اللغة: ${vscodeTools.languageId || 'غير متوفرة'}`
  ];

  if (vscodeTools.selectedText) {
    lines.push('', '### النص المحدد');
    lines.push(vscodeTools.selectedText.slice(0, 1200));
  }

  if (Array.isArray(vscodeTools.openEditors) && vscodeTools.openEditors.length) {
    lines.push('', '### الملفات المفتوحة');
    vscodeTools.openEditors.slice(0, 20).forEach(e => {
      lines.push(`- ${e.file} (${e.languageId || 'unknown'})${e.isDirty ? ' — معدل' : ''}`);
    });
  }

  if (Array.isArray(vscodeTools.diagnostics) && vscodeTools.diagnostics.length) {
    lines.push('', '### Diagnostics / Problems');
    vscodeTools.diagnostics.slice(0, 15).forEach(group => {
      lines.push(`- ${group.file}`);
      (group.diagnostics || []).slice(0, 10).forEach(d => {
        lines.push(`  - line ${d.line}:${d.character} severity=${d.severity} ${d.message}`);
      });
    });
  } else {
    lines.push('', '### Diagnostics / Problems');
    lines.push('- لا توجد مشاكل مرسلة من VS Code أو لم يتم فتح ملف يحتوي Diagnostics.');
  }

  if (vscodeTools.gitStatus) {
    lines.push('', '### Git status المحلي من VS Code');
    lines.push(vscodeTools.gitStatus);
  }

  return lines.join('\n');
}

function buildReport(message, workspace, cli) {
  const lines = [
    '## تقرير تنفيذي',
    '',
    `- نوع الطلب: ${classifyIntent(message)}`,
    `- المسار: SHEIKHA_EXECUTION_PIPELINE_V1`,
    '- الحوكمة: مفعلة قبل التنفيذ',
    '- مبدأ السلامة: لا ضرر ولا ضرار',
    ''
  ];

  if (cli.branch) lines.push(`- الفرع الحالي: ${cli.branch}`);
  if (cli.cwd) lines.push(`- مسار المشروع: ${cli.cwd}`);

  const changed = String(cli.status || '').split('\n').filter(Boolean);
  if (changed.length) {
    lines.push('', '### الملفات المعدلة');
    changed.slice(0, 50).forEach(x => lines.push(`- ${x}`));
  }

  if (cli.scripts && Object.keys(cli.scripts).length) {
    lines.push('', '### أوامر npm المتاحة');
    Object.keys(cli.scripts).slice(0, 30).forEach(k => lines.push(`- npm run ${k}`));
  }

  lines.push('', '### التوصية التالية');
  lines.push('- تشغيل فحص read-only أولاً.');
  lines.push('- ثم تشغيل الاختبارات بإذن ومراجعة.');
  lines.push('- ثم تجهيز patch/commit مستقل.');

  return lines.join('\n');
}

function buildDebugPlan(message, cli) {
  const lines = [
    '## Debug Pipeline',
    '',
    'تم تفعيل مسار التشخيص الآمن.',
    '',
    '### الخطوات',
    '1. قراءة حالة Git والفرع الحالي.',
    '2. تحديد الملفات المعدلة.',
    '3. اقتراح أوامر فحص آمنة.',
    '4. عدم تنفيذ تعديل أو حذف بدون مراجعة.',
    ''
  ];

  if (cli.branch) lines.push(`- الفرع الحالي: ${cli.branch}`);
  if (cli.status) lines.push('', '### Git status', cli.status);

  lines.push('', '### أوامر مقترحة');
  lines.push('```bash');
  lines.push('npm test');
  lines.push('npm run lint');
  lines.push('git status --short');
  lines.push('```');

  return lines.join('\n');
}

function executePipeline(payload = {}) {
  const message = String(payload.message || payload.prompt || '').trim();
  const workspace = payload.workspace || {};
  const workspaceRoot = workspace.workspaceRoot || payload.workspaceRoot || process.cwd();
  const intelligenceMode = normalizeIntelligenceMode(payload.mode);
  const intent = intentForMode(message, intelligenceMode);
  const cli = runReadOnlyCli(workspaceRoot);

  let answer;

  if (/^\s*شيخة\s*$/i.test(message) && intelligenceMode === 'smart') {
    answer = 'بسم الله الرحمن الرحيم\n\nأنا شيخة.\n\nما الذي تحتاج إليه من مساعدة أو عون؟';
  } else if (intent === 'GRAPHICS_LOGO_PLAN') {
    answer = [
      'بسم الله الرحمن الرحيم',
      '',
      'أنا شيخة.',
      '',
      '## تصور شعار شيخة',
      '',
      '- الاسم: شيخة',
      '- الأسلوب: عربي، وقور، تقني، بسيط.',
      '- الألوان: أخضر داكن، ذهبي، أبيض.',
      '- الرمز: حرف ش عربي هندسي أو قوس/درع مجرد بلا أرواح.',
      '- الاستخدام: VS Code Extension، الشات، الموقع، التقارير.',
      '',
      '### صيغة مختصرة للشعار',
      'شيخة',
      'حوكمة • معرفة • تنفيذ',
      '',
      '### مبدأ الهوية',
      'موحدة لله، ومنضبطة بالكتاب والسنة، بلا صور أرواح.'
    ].join('\n');
  } else if (intelligenceMode === 'rag') {
    answer = buildRagContract(message);
  } else if (intelligenceMode === 'agentic') {
    answer = buildAgenticPlan(message);
  } else if (intelligenceMode === 'multi-agent') {
    answer = buildMultiAgentPlan(message);
  } else if (intelligenceMode === 'agi-research') {
    answer = buildResearchProgram('AGI', message);
  } else if (intelligenceMode === 'asi-research') {
    answer = buildResearchProgram('ASI', message);
  } else if (intelligenceMode === 'mcp') {
    answer = buildMcpPlan(message);
  } else if (intelligenceMode === 'sdk') {
    answer = buildSdkPlan(message);
  } else if (intent === 'DEBUG_PIPELINE') {
    answer = buildDebugPlan(message, cli);
  } else if (intent === 'CLI_READ_ONLY') {
    answer = buildReport(message, workspace, cli);
  } else if (intent === 'REPORT_PIPELINE') {
    answer = buildReport(message, workspace, cli);
  } else if (intent === 'CONTENT_REPORT' && isFoundryTopic(message)) {
    answer = buildFoundryReport();
  } else {
    {
    const executed = modelExecutor.execute(message);
    answer = executed.success
      ? [
          'بسم الله الرحمن الرحيم',
          '',
          'أنا شيخة.',
          '',
          `المسار: ${executed.executor}`,
          `النموذج: ${executed.model}`,
          `نوع المهمة: ${executed.task}`,
          '',
          executed.answer
        ].join('\n')
      : [
          'بسم الله الرحمن الرحيم',
          '',
          'أنا شيخة.',
          '',
          executed.answer || executed.error || 'تعذر تنفيذ النموذج.'
        ].join('\n');
  }
  }

  const vscodeReport = buildVSCodeToolsReport(payload.vscodeTools);

  if (vscodeReport && /vscode|أدوات|الملف النشط|المشاكل|diagnostics|problems|فرع/i.test(message)) {
    answer = `${answer}\n${vscodeReport}`;
  }

  return {
    success: true,
    pipeline: 'SHEIKHA_EXECUTION_PIPELINE_V1',
    intent,
    intelligenceMode,
    claimStatus: {
      actualAgiReached: false,
      actualAsiReached: false,
      consciousnessClaimed: false,
      superhumanCapabilityClaimed: false
    },
    cli,
    vscodeTools: payload.vscodeTools || null,
    answer,
    governance: {
      engine: 'SHEIKHA_GOVERNANCE_PROTOCOL_V1',
      allowed: true,
      basis: 'التوحيد لله وحده، والرقمنة منضبطة بالكتاب والسنة، ولا ضرر ولا ضرار',
      humanReviewRequiredForExecution: true
    }
  };
}

module.exports = {
  executePipeline,
  classifyIntent,
  isFoundryTopic,
  buildFoundryReport,
  normalizeIntelligenceMode,
  intentForMode,
  buildRagContract,
  buildAgenticPlan,
  buildMultiAgentPlan,
  buildResearchProgram
};
