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
  if (/تقرير|report|حلل|تحليل|افحص/i.test(text)) return 'REPORT_PIPELINE';
  if (/فرع|branch|git status|ملفات معدلة|changed files/i.test(text)) return 'CLI_READ_ONLY';
  if (/وثائق|معمارية|حوكمة|docs|architecture|governance/i.test(text)) return 'RAG_LOOKUP';
  if (/مخطط|رسم|graph|diagram/i.test(text)) return 'GRAPHICS_PLAN';
  if (/sdk|api|client|تكامل/i.test(text)) return 'SDK_PLAN';

  return 'GENERAL_AGENT';
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
  const intent = classifyIntent(message);
  const cli = runReadOnlyCli(workspaceRoot);

  let answer;

  if (/^\s*شيخة\s*$/i.test(message)) {
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
  } else if (intent === 'DEBUG_PIPELINE') {
    answer = buildDebugPlan(message, cli);
  } else if (intent === 'CLI_READ_ONLY') {
    answer = buildReport(message, workspace, cli);
  } else if (intent === 'REPORT_PIPELINE') {
    answer = buildReport(message, workspace, cli);
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

module.exports = { executePipeline, classifyIntent };
