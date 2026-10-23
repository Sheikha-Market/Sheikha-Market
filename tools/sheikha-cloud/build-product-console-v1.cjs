#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { sha256, noSymlinks, readBounded, validateScope, verifyRequest, buildRegistry, probeGoogleServices, TOKEN_ENV } = require('../../core/cloud-fabric/sheikha-product-registry-v1.cjs');
const ROOT = path.resolve(__dirname, '../..');
const CONFIG = 'config/sheikha-cloud-products.v1.json';
const OUTPUT = 'runtime/cloud-products';
const VISUAL = 'runtime/visual-foundry/objects/1c581794b8ffab129a688186813755ed40539f8b270c10fe0918d595a3c28a0a.png';
const escapedJson = value => JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
const contentHash = value => crypto.createHash('sha256').update(value).digest('base64');

function renderConsole(registry, probe, { root = ROOT, visual } = {}) {
  const read = file => readBounded(path.join(root, file)).toString('utf8');
  const style = read('core/cloud-fabric/product-console.css');
  const script = read('core/cloud-fabric/product-console.js').replace(/__REGISTRY__|__PROBE__/g, key => escapedJson(key === '__REGISTRY__' ? registry : probe));
  const values = { STYLE: style, SCRIPT: script, VISUAL: `data:image/png;base64,${visual.toString('base64')}`,
    CSP: `default-src 'none'; img-src data:; script-src 'sha256-${contentHash(script)}'; style-src 'sha256-${contentHash(style)}'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'` };
  for (const [name, file] of Object.entries({ LAYERS: 'layers', LIST: 'list', NETWORK: 'network', BOOK: 'book-open', DOWNLOAD: 'download', CLEAR: 'filter-x', BACK: 'arrow-left', INFO: 'info' })) {
    values[`ICON_${name}`] = read(`public/architecture-explorer/icons/${file}.svg`).replace('<svg', '<svg aria-hidden="true"');
  }
  return read('core/cloud-fabric/product-console.html').replace(/@@([A-Z_]+)@@/g, (_, key) => {
    if (!(key in values)) throw new Error('UNKNOWN_TEMPLATE_TOKEN');
    return values[key];
  });
}

function atomic(file, content) {
  noSymlinks(file);
  const temporary = `${file}.${crypto.randomBytes(8).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(temporary, content, { mode: 0o600, flag: 'wx' });
    noSymlinks(file); fs.renameSync(temporary, file);
  } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

function saveSnapshot(output, files, report) {
  noSymlinks(output); fs.mkdirSync(output, { recursive: true, mode: 0o700 }); fs.chmodSync(output, 0o700);
  const snapshots = noSymlinks(path.join(output, 'snapshots'));
  fs.mkdirSync(snapshots, { recursive: true, mode: 0o700 }); fs.chmodSync(snapshots, 0o700);
  const id = sha256(JSON.stringify(report)).slice(0, 24), target = noSymlinks(path.join(snapshots, id));
  noSymlinks(path.join(output, 'index.html')); noSymlinks(path.join(output, 'latest.json'));
  const temporary = path.join(snapshots, `.build-${crypto.randomBytes(8).toString('hex')}`);
  fs.mkdirSync(temporary, { mode: 0o700 });
  try {
    for (const [name, value] of Object.entries({ ...files, 'build.json': JSON.stringify(report, null, 2) + '\n' })) {
      if (!/^[a-zA-Z0-9._-]+$/.test(name)) throw new Error('INVALID_OUTPUT_NAME');
      fs.writeFileSync(path.join(temporary, name), value, { mode: 0o600, flag: 'wx' });
    }
    if (fs.existsSync(target)) throw new Error('SNAPSHOT_ALREADY_EXISTS');
    fs.renameSync(temporary, target);
    atomic(path.join(output, 'latest.json'), JSON.stringify({ id, reportSha256: sha256(JSON.stringify(report)), snapshot: `snapshots/${id}` }, null, 2) + '\n');
    atomic(path.join(output, 'index.html'), `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=snapshots/${id}/index.html"><title>سجل منتجات شيخة</title><a href="snapshots/${id}/index.html">فتح سجل منتجات شيخة</a></html>`);
  } finally { if (fs.existsSync(temporary)) fs.rmSync(temporary, { recursive: true }); }
  return { id, entry: path.join(output, 'index.html'), snapshot: target };
}

async function run(args, { root = ROOT, env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const [command, ...rest] = args;
  if (!['build', 'probe'].includes(command)) throw new Error('USAGE_BUILD_OR_PROBE');
  let requestPath = null, probeRequested = command === 'probe';
  for (let index = 0; index < rest.length; index++) {
    if (rest[index] === '--request' && command === 'build' && !requestPath && rest[index + 1] && !rest[index + 1].startsWith('--')) requestPath = rest[++index];
    else if (rest[index] === '--probe' && command === 'build' && !probeRequested) probeRequested = true;
    else throw new Error('UNSUPPORTED_ARGUMENT');
  }
  const configBytes = readBounded(path.join(root, CONFIG));
  const scope = validateScope(JSON.parse(configBytes));
  const projectMap = JSON.parse(readBounded(path.join(root, 'runtime/external-alignment/google-cloud/project-mapping/sheikha-google-project-map.json')));
  if (projectMap.primaryProject?.projectId !== scope.projectId || projectMap.primaryProject?.projectNumber !== scope.projectNumber) throw new Error('LOCAL_PROJECT_MAPPING_MISMATCH');
  const requestBytes = requestPath ? readBounded(requestPath) : null;
  const request = requestBytes ? verifyRequest(requestBytes, scope) : null;
  const probe = probeRequested ? await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: env[TOKEN_ENV], fetchImpl })
    : { status: 'NOT_REQUESTED', complete: false, requestCount: 0, services: [], observedAt: null, productionEnabled: false };
  if (command === 'probe') return probe;
  const registry = buildRegistry(scope, { root, request });
  registry.effects.networkRequests = probe.requestCount;
  registry.effects.credentialsRead = Boolean(probeRequested && env[TOKEN_ENV]);
  const visual = readBounded(path.join(root, VISUAL), 5 * 1024 * 1024);
  if (sha256(visual) !== path.basename(VISUAL, '.png')) throw new Error('VISUAL_DIGEST_MISMATCH');
  const html = renderConsole(registry, probe, { root, visual });
  const review = [
    '# تجربة منتجات شيخة ومسار التعاون', '',
    'مسودة داخلية غير مرسلة وغير ملزمة. لا اتفاقية موقعة ولا اعتماد لعلامة مشتركة في هذه الحزمة.', '',
    `نطاق الطلب: ${registry.counts.products} بندًا في ${registry.counts.categories} مجالًا. كلها غير معتمدة كمنتجات مكتملة.`,
    'الأسماء المرجعية تتضمن خدمات من Google وأطراف أخرى ومداخل إدارة، ولا تمثل جميع منتجات Google.', '',
    '## النطاق الأولي المقترح',
    ...registry.products.filter(product => product.pilotPriority).map(product => `- ${product.nameAr}: ${product.acceptance}`), '',
    '## مسار التنفيذ',
    '1. تحديد مالك المنتج ومراجع مستقل والنتيجة المطلوبة.',
    '2. اختيار البيانات والبيئة والصلاحيات وأقصى تكلفة مقبولة.',
    '3. تنفيذ جرد قراءة محدود للمشروع بموافقة صاحبه.',
    '4. تنفيذ منتج أول في بيئة اختبار وإرفاق أدلة قبول فعلية.',
    '5. مراجعة بشرية قبل أي نشر أو شراء أو توسيع للصلاحيات.', '',
    '## ورقة مراجعة الشراكة',
    '- الجهة المقابلة والمخول بالتواصل: لم يُتحقق منهما.',
    '- الهدف المشترك ومؤشر النجاح: يحدد مع الطرف المقابل قبل الالتزام.',
    '- نطاق الخدمات وحقوق البيانات وموقع المعالجة: يحتاج اتفاقًا موثقًا.',
    '- الميزانية والمسؤوليات ومدة التجربة ومعايير الخروج: تحتاج موافقة الطرفين.',
    '- الاتفاقية والتفويض والتوقيع: تحتاج مراجعة مختصة وتوقيع المخولين؛ هذه الورقة ليست عقدًا.',
    '- وصف العلاقة والعلامة: شيخة علامة مستقلة؛ لا إعلان لشراكة أو علامة مشتركة دون سند.', '',
    '## حدود هذه الحزمة',
    'لم تتغير الخدمات أو الفوترة أو صلاحيات IAM. لا يرسل الفاحص مراسلات أو محتويات ملفات؛ عند تهيئة التفويض يستخدم رمز القراءة مع واجهة Google المحددة فقط.',
    'فحص services.list لا يُنشئ خدمات، ولا ينفذ BigQuery، ولا يثبت تشغيل أحمال العمل.',
    'التوليد الخارجي المتكرر متوقف: المزود والميزانية اليومية غير محددين. الإنتاج المحلي القائم منفصل ولم تُغير جدولته.', '',
    '## المراجع', ...scope.sources.map(source => `- [${source.purpose}](${source.url})`), ''
  ].join('\n');
  if (sha256(readBounded(path.join(root, CONFIG))) !== sha256(configBytes)) throw new Error('CONFIG_CHANGED_DURING_BUILD');
  if (requestPath && sha256(readBounded(requestPath)) !== request.sha256) throw new Error('REQUEST_CHANGED_DURING_BUILD');
  const files = { 'index.html': html, 'registry.json': JSON.stringify(registry, null, 2) + '\n', 'connection.json': JSON.stringify(probe, null, 2) + '\n',
    'pilot-review.ar.md': review, 'LUCIDE-LICENSE.txt': readBounded(path.join(root, 'public/architecture-explorer/icons/LICENSE')) };
  const report = { schema: 'SHEIKHA_PRODUCT_CONSOLE_BUILD_V1', builtAt: registry.observedAt, configSha256: sha256(configBytes),
    request, counts: registry.counts, connectionStatus: probe.status, networkRequests: probe.requestCount,
    artifacts: Object.fromEntries(Object.entries(files).map(([name, value]) => [name, sha256(value)])),
    requestAndConfigBytesUnchanged: true, productionEnabled: false, publicationApproved: false, partnershipEstablished: false };
  return { ...saveSnapshot(path.join(root, OUTPUT), files, report), ...registry.counts, connectionStatus: probe.status, requestMatched: Boolean(request), publicationApproved: false };
}

if (require.main === module) run(process.argv.slice(2)).then(result => {
  console.log(JSON.stringify(result, null, 2));
  if (process.argv[2] === 'probe' && !result.complete) process.exitCode = 2;
}).catch(error => {
  console.error(JSON.stringify({ status: 'BUILD_FAILED', code: /^[A-Z_]+$/.test(error.message) ? error.message : 'LOCAL_INPUT_OR_BUILD_ERROR', productionEnabled: false })); process.exitCode = 1;
});
module.exports = { run, renderConsole, saveSnapshot, escapedJson };
