'use strict';

const API = '/api/sheikha/workspace/v1';
const $ = id => document.getElementById(id);
const state = { operation: 'foundry', transport: 'sdk', products: [], sectors: [], plans: [], history: [], result: null,
  busy: false, inputVersion: 0, inputOrigin: 'مثال تجريبي', token: null, catalogLoaded: false };
const names = { foundry: 'Foundry', natural: 'البيانات الطبيعية', sensory: 'المستشعرات' };
const descriptions = {
  foundry: 'محاكاة شبكة الإنتاج والاتصالات. لا تصنيع فعلي ولا اتصال بأجهزة.',
  natural: 'قراءات يقدّمها المستخدم؛ المصدر والمعايرة غير متحققين. ساعة التقييم يحددها الإدخال.',
  sensory: 'تفسير دفعة محدودة؛ المثال التجريبي قديم عمدًا. لا إثبات مصدر ولا حماية إعادة تشغيل بين الطلبات.'
};
const errors = { BUSY: 'يوجد استدعاء قيد التنفيذ. حاول بعد اكتماله.', RATE_LIMITED: 'بلغت حد الاستدعاءات لهذه الدقيقة. انتظر قليلًا.',
  SESSION_REQUIRED: 'انتهت جلسة الخادم. حدّث الصفحة.', OPERATION_REJECTED_OR_UNAVAILABLE: 'رُفضت المعاملات أو تعذر اتصال MCP. راجع المثال وحدود الدفعة.',
  PLAN_INPUT_REJECTED: 'تعذر إنشاء المسودة. راجع المنتج والقطاع ونطاق الطلب.', REQUEST_REJECTED: 'تعذر قبول الطلب أو تجاوز الحجم المسموح.' };
function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function iconButton(title, onClick, icon = 'download') {
  const button = node('button', undefined, 'icon-button');
  button.type = 'button'; button.title = title; button.setAttribute('aria-label', title);
  const img = node('img', undefined, 'icon'); img.src = `/architecture-explorer/icons/${icon}.svg`; img.alt = '';
  button.append(img); button.addEventListener('click', onClick); return button;
}
function record(title, detail, action) {
  const row = node('div', undefined, 'record'), body = node('div');
  body.append(node('strong', title)); if (detail) body.append(node('small', detail));
  row.append(body); if (action) row.append(action); return row;
}
function date(value) { return value ? new Date(value).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'medium' }) : 'لا سجل'; }
async function api(path, body) {
  if (body !== undefined && !state.token) {
    const session = await fetch(`${API}/session`, { cache: 'no-store' });
    if (!session.ok) throw Error('تعذر فتح جلسة محلية.');
    state.token = (await session.json()).token;
  }
  const response = await fetch(API + path, { cache: 'no-store', signal: AbortSignal.timeout(20000),
    ...(body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sheikha-Session': state.token }, body: JSON.stringify(body) }) });
  const data = await response.json();
  if (!response.ok) throw Error(errors[data.error] || 'تعذر الوصول إلى الخدمة المحلية.');
  return data;
}
function download(value, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = node('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function route() {
  const catalogAnchor = location.hash === '#catalog';
  const [pathname, query = ''] = (catalogAnchor ? '/market' : (location.hash.slice(1) || '/sheikha')).split('?');
  const page = ['sheikha', 'market', 'operations', 'motion', 'architecture'].includes(pathname.slice(1)) ? pathname.slice(1) : 'sheikha';
  for (const section of document.querySelectorAll('[data-page]')) section.hidden = section.dataset.page !== page;
  for (const link of document.querySelectorAll('.topbar nav a')) {
    if (link.hash === `#/${page}`) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  }
  document.title = `${({ sheikha: 'شيخة', market: 'سوق شيخة', operations: 'لوحة التشغيل', motion: 'شيخة · الحركة والهوية', architecture: 'المعمارية' })[page]} | SHEIKHA`;
  if (page === 'market' && !state.catalogLoaded) loadCatalog();
  if (page === 'operations') {
    const op = new URLSearchParams(query).get('op');
    if (op && Object.hasOwn(names, op) && !state.busy && op !== state.operation) selectOperation(op);
    refreshStatus();
  }
  if (catalogAnchor) $('catalog').scrollIntoView(); else window.scrollTo(0, 0);
  $('main').focus({ preventScroll: true });
}

async function loadCatalog() {
  $('catalog-error').hidden = true; $('catalog-state').textContent = 'جارٍ قراءة السجل';
  try {
    const data = await api('/catalog');
    state.products = data.products; state.sectors = data.sectors; state.catalogLoaded = true;
    $('sector').replaceChildren(new Option('كل القطاعات', ''));
    for (const item of data.sectors) $('sector').add(new Option(item.nameAr, item.id));
    renderProducts();
    if (!data.localEvidencePassed) $('catalog-state').textContent += ' · أدلة السجل تحتاج مراجعة';
  } catch { $('catalog-error').hidden = false; $('catalog-state').textContent = 'السجل غير متاح'; }
}
function renderProducts() {
  const search = $('search').value.trim().toLocaleLowerCase(), sector = $('sector').value;
  const products = state.products.filter(p => (!sector || p.targetSectors.includes(sector)) && [p.nameAr, p.nameEn, p.summaryAr, p.id].join(' ').toLocaleLowerCase().includes(search));
  $('catalog-state').textContent = `${products.length} من ${state.products.length} · سجلات محلية`;
  $('products').replaceChildren();
  if (!products.length) $('products').append(node('p', 'لا توجد نتائج مطابقة للمرشحات.', 'empty'));
  for (const product of products) {
    const article = node('article', undefined, 'product'), img = node('img');
    const visuals = {
      'PROD-GOV-001': './assets/architecture.jpg', 'PROD-STAB-001': './assets/architecture.jpg',
      'PROD-DEC-001': './assets/architecture.jpg', 'PROD-CAP-001': './assets/architecture.jpg',
      'PROD-AICL-001': './assets/control-room.jpg', 'PROD-UGITAI-001': './assets/control-room.jpg',
      'PROD-CLOUD-SAAS': './assets/control-room.jpg',
      'PROD-RIYADH-ALJANNAH': '/images/sheikha-worldly-gardens-v1.png',
      'PROD-ENERGY': '/images/sheikha-worldly-gardens-v1.png',
      'PROD-MARKETPLACE': '/images/sheikha-industrial-market-hero-v1.png',
      'PROD-SUPPLY-CHAIN': '/images/sheikha-industrial-market-hero-v1.png'
    };
    img.src = visuals[product.id] || './assets/campus.png';
    img.alt = 'مرئي توضيحي للمجال، وليس إثبات جاهزية المنتج'; img.loading = 'lazy';
    const body = node('div', undefined, 'product-body'), id = node('span', product.id, 'product-id'); id.dir = 'ltr';
    body.append(id, node('h3', product.nameAr), node('p', product.summaryAr));
    const bottom = node('div', undefined, 'product-bottom'), button = node('button', 'طلب عرض سعر');
    button.addEventListener('click', () => openRfq(product));
    bottom.append(node('span', 'بطلب عرض · غير متحقق'), button); body.append(bottom); article.append(img, body); $('products').append(article);
  }
}
let selectedProduct;
function openRfq(product) {
  selectedProduct = product; $('rfq-form').reset(); $('rfq-error').textContent = '';
  $('rfq-product').textContent = product.nameAr; $('rfq-source').textContent = product.source;
  $('rfq-sector').replaceChildren();
  for (const sector of state.sectors.filter(s => product.targetSectors.includes(s.id))) $('rfq-sector').add(new Option(sector.nameAr, sector.id));
  $('rfq-sector').value = product.primarySector; $('rfq-dialog').showModal();
}
$('rfq-form').addEventListener('submit', async event => {
  event.preventDefault(); $('create-plan').disabled = true; $('rfq-error').textContent = '';
  try {
    const plan = await api('/plan', { productId: selectedProduct.id, sector: $('rfq-sector').value, intent: $('rfq-intent').value.trim() });
    state.plans.unshift(plan); state.plans = state.plans.slice(0, 20); renderPlans(); $('rfq-dialog').close();
    $('plans').scrollIntoView({ block: 'center' });
  } catch (error) { $('rfq-error').textContent = error.message; }
  finally { $('create-plan').disabled = false; }
});
function renderPlans() {
  $('plans').replaceChildren(...state.plans.map(plan => record(plan.product?.nameAr || 'طلب عرض سعر',
    `${plan.intent} · مسودة للمراجعة · ${date(plan.generatedAt)}`,
    iconButton('تنزيل مسودة الطلب', () => download(plan, `${plan.planId}.json`)))));
}

async function loadExample() {
  const version = ++state.inputVersion, operation = state.operation;
  $('run').disabled = true;
  try {
    const example = await api(`/examples/${operation}`);
    if (version !== state.inputVersion) return;
    $('arguments').value = JSON.stringify(example, null, 2);
    state.inputOrigin = 'مثال تجريبي'; $('input-origin').textContent = state.inputOrigin;
    $('run-state').textContent = 'لم يبدأ التشغيل'; $('run-state').classList.remove('error');
  } catch { if (version === state.inputVersion) { $('arguments').value = ''; $('run-state').textContent = 'تعذر تحميل المثال'; } }
  finally { if (version === state.inputVersion) $('run').disabled = state.busy; }
}
function clearResult() { state.result = null; $('result').hidden = true; $('result-json').textContent = ''; $('result-summary').replaceChildren(); }
function selectOperation(operation) {
  if (state.busy) return;
  state.operation = operation; clearResult();
  $('operation-title').textContent = names[operation]; $('operation-description').textContent = descriptions[operation];
  for (const button of document.querySelectorAll('[data-operation]')) button.setAttribute('aria-pressed', String(button.dataset.operation === operation));
  loadExample();
}
function setBusy(busy) {
  state.busy = busy;
  for (const element of document.querySelectorAll('[data-operation],[data-transport],#run,#arguments,#import-json,#load-example')) element.disabled = busy;
}
function resultSummary(response) {
  const result = response.result, rows = [];
  rows.push(record(`${names[response.operation]} · ${response.transport.toUpperCase()}`, `${date(response.completedAt)} · ${response.durationMs} ms · ${response.inputOrigin}`));
  if (response.operation === 'foundry') rows.push(record('اكتملت المحاكاة المحلية', 'لا تصنيع فعلي، لا أوامر للأجهزة، لا استدلال نموذج ذكاء.'));
  if (response.operation === 'natural') for (const summary of result.summaries || []) rows.push(record(`${summary.sourceId} · ${summary.metric}`, JSON.stringify(summary)));
  if (response.operation === 'sensory') for (const explanation of result.explanations || []) rows.push(record(explanation.sourceId, explanation.text));
  rows.push(record('الحدود محفوظة', 'لا نشر ولا دفع ولا اعتماد للإنتاج. بصمة المحتوى لا تثبت هوية المصدر.'));
  $('result-summary').replaceChildren(...rows);
}
function showResult(response) {
  state.result = response; $('result').hidden = false; resultSummary(response);
  $('result-json').textContent = JSON.stringify(response, null, 2);
}
function renderHistory() {
  $('history').replaceChildren(...state.history.map(item => record(`${names[item.operation]} · ${item.transport.toUpperCase()} · ${item.ok ? 'مكتمل محليًا' : 'لم يكتمل'}`,
    `${date(item.at)} · ${item.message || item.response.inputOrigin}`,
    item.ok ? iconButton('عرض نتيجة محفوظة في الجلسة', () => { showResult(item.response); $('result').scrollIntoView({ block: 'center' }); }, 'list') : null)));
}
$('run').addEventListener('click', async () => {
  if (state.busy) return;
  clearResult(); $('run-state').classList.remove('error');
  let args;
  try {
    if (new TextEncoder().encode($('arguments').value).length > 500 * 1024) throw Error();
    args = JSON.parse($('arguments').value);
  } catch { $('run-state').textContent = 'JSON غير صالح أو يتجاوز 500 KiB.'; $('run-state').classList.add('error'); return; }
  const request = { operation: state.operation, transport: state.transport, arguments: args }, inputOrigin = state.inputOrigin;
  setBusy(true); $('run-state').textContent = 'جارٍ تنفيذ الاستدعاء المحلي...';
  try {
    const response = { ...await api('/run', request), inputOrigin, submittedArguments: args };
    showResult(response); $('run-state').textContent = 'اكتمل الاستدعاء المحلي';
    state.history.unshift({ operation: request.operation, transport: request.transport, ok: true, at: response.completedAt, response });
  } catch (error) {
    $('run-state').textContent = error.message; $('run-state').classList.add('error');
    state.history.unshift({ operation: request.operation, transport: request.transport, ok: false, at: new Date().toISOString(), message: error.message });
  } finally { state.history = state.history.slice(0, 20); renderHistory(); setBusy(false); }
});
async function refreshStatus() {
  try {
    const status = await api('/status');
    $('connection-status').textContent = 'الخادم المحلي متاح'; $('connection-status').classList.remove('error');
    const visual = status.visualFoundry;
    $('visual-status').replaceChildren(
      record('خط الإنتاج اليومي', visual.draft ? `${visual.draft.id} · ${visual.draft.status} · ${date(visual.draft.checkedAt)}` : 'لا سجل إنتاج محفوظ'),
      record('Watch', `${visual.watch.freshRecord ? 'سجل حديث، العملية غير متحققة' : 'السجل قديم أو مفقود؛ التشغيل غير متحقق'} · ${date(visual.watch.recordedAt)}`),
      record('Guard', visual.guard ? `${visual.guard.decision} · ${visual.guard.assetCount} أصل · ${date(visual.guard.checkedAt)}` : 'لا سجل حارس محفوظ'),
      record('النشر والتوليد المدفوع', 'متوقفان في هذه المساحة؛ يلزم اعتماد مستقل للمزود والميزانية والنشر.')
    );
  } catch { $('connection-status').textContent = 'الخادم غير متاح؛ لا حالة حية'; $('connection-status').classList.add('error'); }
}
$('arguments').addEventListener('input', () => { state.inputVersion++; state.inputOrigin = 'مدخلات مستخدم غير متحققة'; $('input-origin').textContent = state.inputOrigin; clearResult(); $('run').disabled = state.busy; });
$('import-json').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file || state.busy) return;
  const version = ++state.inputVersion;
  try {
    if (file.size > 500 * 1024) throw Error();
    const content = await file.text(); JSON.parse(content);
    if (version !== state.inputVersion || state.busy) return;
    $('arguments').value = content; state.inputOrigin = 'ملف مستخدم غير متحقق'; $('input-origin').textContent = state.inputOrigin; clearResult();
    $('run-state').textContent = 'تم تحميل الملف محليًا؛ لم ينفذ بعد'; $('run-state').classList.remove('error');
  } catch { $('run-state').textContent = 'تعذر قراءة JSON، أو تجاوز الملف 500 KiB.'; $('run-state').classList.add('error'); }
  finally { event.target.value = ''; if (version === state.inputVersion) $('run').disabled = state.busy; }
});
for (const button of document.querySelectorAll('[data-operation]')) button.addEventListener('click', () => selectOperation(button.dataset.operation));
for (const button of document.querySelectorAll('[data-transport]')) button.addEventListener('click', () => {
  if (state.busy) return; state.transport = button.dataset.transport; clearResult();
  for (const item of document.querySelectorAll('[data-transport]')) item.setAttribute('aria-pressed', String(item === button));
});
$('load-example').addEventListener('click', () => { clearResult(); loadExample(); });
$('export-result').addEventListener('click', () => { if (state.result) download(state.result, `sheikha-${state.result.id}.json`); });
$('refresh-status').addEventListener('click', refreshStatus);
$('search').addEventListener('input', renderProducts); $('sector').addEventListener('change', renderProducts);
$('filters').addEventListener('submit', event => event.preventDefault());
$('filters').addEventListener('reset', () => setTimeout(renderProducts, 0));
$('retry-catalog').addEventListener('click', loadCatalog);
$('close-rfq').addEventListener('click', () => $('rfq-dialog').close());
$('clear-plans').addEventListener('click', () => { state.plans = []; renderPlans(); });
$('clear-history').addEventListener('click', () => { state.history = []; renderHistory(); clearResult(); });
setInterval(() => { if ($('watch-status').checked && !document.hidden && !document.querySelector('[data-page="operations"]').hidden) refreshStatus(); }, 30000);
window.addEventListener('hashchange', route);
selectOperation('foundry'); route();
