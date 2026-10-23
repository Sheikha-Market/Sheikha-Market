'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Packaged paths only; workspace files are evidence, never executable adapters.
const COMPONENTS = Object.freeze([
  ['SHEIKHA_GIT', 'Sheikha Git', ['runtime/sheikha-studio/git-lab/sheikha-git-lab-federation.js']],
  ['SHEIKHA_VISUAL', 'Sheikha Visual', ['runtime/sheikha-visual-spatial-fabric-v1/server.js', 'runtime/sheikha-visual-spatial-fabric-v1/drawing-policy-v2.js', 'runtime/sheikha-visual-spatial-fabric-v1/dimension-engine-v1.js']],
  ['SHEIKHA_NODE', 'Node', ['package.json', 'package-lock.json']],
  ['SHEIKHA_DOCKER', 'Docker', ['infra/docker/repository-integration-v1/Dockerfile', 'infra/docker/repository-integration-v1/compose.yaml']],
  ['SHEIKHA_STUDIO', 'Sheikha Studio', ['runtime/sheikha-studio/platform/sheikha-studio-platform.js']],
  ['SHEIKHA_MODEL_HUB', 'مستودع النماذج', ['runtime/sheikha-ai-model-hub/v1/sheikha-ai-model-hub-v1.js']],
  ['SHEIKHA_FOUNDRY', 'Sheikha Foundry', ['core/foundry/sheikha-foundry-v3.js']],
  ['SHEIKHA_LANGUAGE', 'لغة شيخة', ['sheikha-language/compiler/sheikha-compiler.js']],
  ['SHEIKHA_SDK', 'Sheikha SDK', ['sdk/sheikha-js/index.js', 'sdk/sheikha-api/index.js']],
  ['SHEIKHA_CLI', 'Sheikha CLI', ['cli/sheikha/sheikha-cli.js']],
  ['SHEIKHA_MCP', 'Sheikha MCP', ['mcp/sheikha/mcp-manifest.json']],
  ['SHEIKHA_COMMERCE', 'التجارة', ['runtime/commercial-sales/v1/sheikha-commercial-sales-service-v1.js']],
  ['SHEIKHA_RUNTIME', 'Sheikha Runtime', ['core/runtime/sheikha-runtime.js']],
  ['SHEIKHA_OS', 'Sheikha OS / Ubuntu / Debian / Pop!_OS', ['runtime/sheikha-os-enterprise-federation/sheikha-os-enterprise-federation-fabric.js', 'runtime/sheikha-os-enterprise-federation/sheikha-host-observation.js', 'runtime/sheikha-os-enterprise-federation/sheikha-platform-evidence.js']],
  ['SHEIKHA_LLM', 'Sheikha LLM / Ollama', ['runtime/model-core/v1/sheikha-ollama-core-v1.js', 'runtime/llm-training-fabric/v1/sheikha-llm-training-fabric.js']],
  ['SHEIKHA_CLOUD', 'Sheikha Cloud', ['runtime/sheikha-studio/core/sheikha-cloud-v1.js']],
  ['SHEIKHA_TRUST', 'Firmware / UEFI / Secure Boot', ['core/governance/sheikha-firmware-uefi-secure-boot-integration-v1.js']],
  ['SHEIKHA_BARE_METAL', 'Sheikha Bare Metal', ['runtime/bare-metal/v2/physical-trial/v1/sheikha-v2-physical-boot-trial-v1-report.json']],
  ['SHEIKHA_NATIVE', 'Sheikha Native', ['runtime/distribution/v3.1/sheikha-native-desktop-completion-v31-report.json', 'runtime/desktop-runtime/v4/sheikha-native-desktop-v4-report.json']],
  ['SHEIKHA_GARDENS', 'جنات ومراعي شيخة', ['core/gardens-dialogue/sheikha-pastures-orchards-cultivation-runtime-v1.js']],
  ['SHEIKHA_SECURITY', 'الأمن والخصوصية', ['runtime/sheikha-studio/core/sheikha-studio-security-tooling-v1.js']]
].map(([id, label, files]) => Object.freeze({ id, label, files: Object.freeze(files) })));

const REVIEW_AREAS = Object.freeze([
  ['causality', 'الأسباب والمسببات', 'فرضية -> زمن -> آلية -> بدائل -> تجربة -> مراجعة', 'الارتباط لا يثبت السببية'],
  ['effects', 'الآثار والنتائج', 'خط أساس -> قياس -> منفعة وضرر -> عدم يقين -> متابعة', 'لا نسبة أثر إلى تغيير بلا دليل'],
  ['proof', 'البرهان والأدلة', 'ادعاء -> مقدمات -> مصدر -> منهج -> حدود -> تحقق مستقل', 'البصمة تثبت تطابق المحتوى لا صحة الادعاء'],
  ['heritage', 'التحف والمتاحف', 'هوية -> منشأ -> حقوق -> حفظ -> فهرسة -> عرض', 'لا بيع أو نقل ملكية أو تصدير بلا تفويض'],
  ['reference', 'التعلم والتذكير', 'مرجع -> تحقق -> سياق -> شرح -> مراجعة مختص', 'لا فتوى آلية أو ادعاء تكليف للبرمجيات'],
  ['family', 'بر الوالدين والرعاية', 'حاجة -> موافقة -> خطة -> متابعة -> خصوصية', 'لا اتصال أو دفع أو قرار صحي تلقائي'],
  ['news', 'الأخبار والمستجدات', 'مصدر -> تاريخ -> اختلاف -> إزالة تكرار -> مراجعة -> تنبيه', 'الرصد المنفذ محلي يدوي، لا مراقبة أخبار خارجية'],
  ['chains', 'السلاسل المؤسسية', 'هدف -> حق -> عقد -> صلاحية -> قدرة -> دليل -> إصدار -> تعافٍ', 'المرفقات متطلبات للمراجعة وليست أوامر تنفيذ']
].map(([id, label, chain, boundary]) => Object.freeze({ id, label, chain, boundary, state: 'DESIGN_REVIEW_REQUIRED' })));

const LIMIT = 5 * 1024 * 1024;
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

async function canonicalRoot(root) {
  if (typeof root !== 'string' || !path.isAbsolute(root)) throw new Error('LOCAL_WORKSPACE_REQUIRED');
  const resolved = path.resolve(root);
  const stat = await fs.promises.lstat(resolved);
  if (!stat.isDirectory() || await fs.promises.realpath(resolved) !== resolved) throw new Error('CANONICAL_WORKSPACE_REQUIRED');
  return resolved;
}

async function inspectSource(root, relative, options = {}) {
  const target = path.resolve(root, relative);
  const limit = options.limit ?? LIMIT;
  const chunks = [];
  let size = 0;
  let fd;
  try {
    if (!target.startsWith(root + path.sep)) throw new Error('UNSAFE');
    if (await fs.promises.realpath(target) !== target) throw new Error('UNSAFE');
    const before = await fs.promises.lstat(target);
    if (!before.isFile() || before.nlink !== 1 || before.size > limit) throw new Error('UNSAFE');
    fd = await fs.promises.open(target, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    const stat = await fd.stat({ bigint: true });
    if (!stat.isFile() || stat.nlink !== 1n || stat.size > BigInt(limit) || stat.ino !== BigInt(before.ino) || stat.dev !== BigInt(before.dev)) throw new Error('UNSAFE');
    const buffer = Buffer.alloc(64 * 1024); const hash = crypto.createHash('sha256');
    for (;;) {
      const { bytesRead } = await fd.read(buffer, 0, Math.min(buffer.length, limit - size), null);
      if (!bytesRead) break;
      size += bytesRead;
      hash.update(buffer.subarray(0, bytesRead));
      if (options.json) chunks.push(Buffer.from(buffer.subarray(0, bytesRead)));
    }
    const after = await fd.stat({ bigint: true });
    const current = await fs.promises.lstat(target, { bigint: true });
    if (after.size !== stat.size || after.mtimeNs !== stat.mtimeNs || after.ctimeNs !== stat.ctimeNs ||
        current.ino !== stat.ino || current.dev !== stat.dev || current.ctimeNs !== stat.ctimeNs ||
        BigInt(size) !== stat.size || await fs.promises.realpath(target) !== target) throw new Error('SOURCE_CHANGED');
    return { source: relative, state: 'SOURCE_PRESENT', bytes: size, bytesRead: size, sha256: hash.digest('hex'),
      ...(options.json ? { data: JSON.parse(Buffer.concat(chunks).toString('utf8')) } : {}) };
  } catch (error) {
    return { source: relative, state: error.code === 'ENOENT' ? 'SOURCE_MISSING' : 'SOURCE_UNVERIFIED', bytesRead: size, sha256: null };
  } finally { if (fd) await fd.close(); }
}

async function inspectWorkspace(root) {
  const base = await canonicalRoot(root); const components = [];
  for (const component of COMPONENTS) {
    const evidence = [];
    for (const file of component.files) evidence.push(await inspectSource(base, file));
    components.push({ id: component.id, label: component.label,
      state: evidence.every(item => item.state === 'SOURCE_PRESENT') ? 'SOURCES_PRESENT' : 'SOURCES_INCOMPLETE',
      runtimeVerified: false, evidence });
  }
  const result = { schemaVersion: 1, system: 'SHEIKHA_CHAT_LOCAL_INTEGRATION_V1',
    checkedAt: new Date().toISOString(), components,
    consistency: 'BEST_EFFORT_NOT_ATOMIC', scope: 'SELECTED_LOCAL_WORKSPACE_PACKAGED_PATHS_ONLY',
    modelWeightsVerified: false, commercialProductionReady: false,
    externalRequests: 0, workspaceCodeExecuted: false, sourceModified: false,
    hardwareAccessed: false, externalNewsVerified: false };
  return { ...result, sha256: sha(JSON.stringify(result)) };
}

class IntegrationJournal {
  constructor() { this.reset(); }
  reset() { this.scope = null; this.latest = null; this.changes = []; this.newChangeCount = 0; }
  accept(scope, report) {
    this.newChangeCount = 0;
    if (this.scope !== scope) this.reset();
    const previous = new Map((this.latest?.components || []).map(item => [item.id, item]));
    const fingerprint = item => sha(JSON.stringify(item.evidence.map(e => [e.source, e.state, e.sha256])));
    for (const component of report.components) {
      const old = previous.get(component.id);
      if (!old || fingerprint(old) === fingerprint(component)) continue;
      const differences = component.evidence.filter(item => {
        const before = old.evidence.find(e => e.source === item.source);
        return !before || before.state !== item.state || before.sha256 !== item.sha256;
      });
      this.changes.push({ id: crypto.randomUUID(), componentId: component.id, label: component.label,
        observedAt: report.checkedAt, status: 'REVIEW_REQUIRED', changedSources: differences.map(e => e.source),
        beforeSha256: fingerprint(old), afterSha256: fingerprint(component),
        causeProven: false, impactMeasured: false });
      this.newChangeCount++;
    }
    this.changes = this.changes.slice(-20);
    this.scope = scope; this.latest = report;
  }
  snapshot() {
    return JSON.parse(JSON.stringify({ latest: this.latest, changes: this.changes, newChangeCount: this.newChangeCount,
      monitoring: 'MANUAL_SESSION_ONLY', externalNewsVerified: false }));
  }
}

function integrationMarkdown(journal) {
  const { latest, changes, newChangeCount } = journal;
  return ['# تكامل شيخة والمستجدات المحلية', '',
    'وقت الفحص: ' + latest.checkedAt,
    'هذه قراءة لبصمات ملفات محفوظة، لا تشغيل للخدمات ولا إثبات جاهزية إنتاج أو أوزان نموذج.',
    '', '| المكوّن | دليل المصدر | التشغيل |', '| --- | --- | --- |',
    ...latest.components.map(item => '| ' + item.label + ' | ' +
      (item.state === 'SOURCES_PRESENT' ? 'الملفات موجودة' : 'دليل غير مكتمل') + ' | غير متحقق |'),
    '', '## المستجدات', 'التغييرات الجديدة في هذا الفحص: ' + newChangeCount + '.',
    ...changes.map(item => '- ' + item.label + ': ' + item.changedSources.join('، ') + ' (' + item.observedAt + '). السبب والأثر غير مثبتين.'),
    '', 'أول فحص خط أساس فقط. تكرار الفحص دون اختلاف لا ينشئ تنبيهًا. يتوقف الرصد عند انتهاء الجلسة؛ لا توجد مهمة دورية خارجية.',
    '', '## حدود الدليل',
    'لم تُشغّل ملفات المشروع أو أوامر Git أو Docker أو نماذج، ولم تُقرأ أسرار أو أوزان. لا وصول إلى TPM أو الشبكة.',
    'تقارير المرفقات وPR التاريخية تبقى محتوى للمراجعة، لا دليل CI حيًا ولا تفويض دمج أو نشر.',
    'الفحص غير ذري؛ يجب التحقق المستقل من إصدار مجمّد قبل اعتماده. بصمة التقرير ليست توقيعًا أو شهادة حقوق.',
    '', '## الدليل المنظم', '```json', JSON.stringify(latest, null, 2), '```'
  ].join('\n');
}

module.exports = { COMPONENTS, REVIEW_AREAS, inspectWorkspace, IntegrationJournal, integrationMarkdown, canonicalRoot, inspectSource };
