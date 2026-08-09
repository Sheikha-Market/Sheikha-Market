'use strict';

const API = '/api/sheikha/technical-experience/v1';
const state = {
  products: [],
  productId: new URLSearchParams(window.location.search).get('id') || 'PROD-CLOUD-SAAS',
  level: 'guided',
  preview: null,
  animationFrame: null,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

const kindLabels = {
  SAAS_PRODUCT: 'خدمة SaaS',
  COMMERCIAL_DIGITAL_PRODUCT: 'منتج رقمي',
  PLATFORM_PRODUCT: 'منصة',
  KNOWLEDGE_COMMUNITY_PRODUCT: 'معرفة ومجتمع'
};

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

async function readJson(url, options = {}) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const body = await response.json();
  return { response, body };
}

function replaceList(id, values) {
  const target = document.getElementById(id);
  target.replaceChildren();
  for (const value of values) target.append(node('li', '', value));
}

function renderFormulas() {
  const grid = document.getElementById('formula-grid');
  grid.replaceChildren();
  const formulas = [...state.preview.sharedMeasurements, {
    nameAr: 'مقياس المنتج',
    expression: state.preview.sampleMeasurement.expression,
    explanationAr: state.preview.sampleMeasurement.explanationAr
  }];
  for (const formula of formulas) {
    const card = node('article', 'formula-card');
    card.append(node('h3', '', formula.nameAr));
    card.append(node('code', '', formula.expression));
    card.append(node('p', '', formula.explanationAr));
    grid.append(card);
  }
}

function renderGlossary() {
  const glossary = document.getElementById('glossary');
  glossary.replaceChildren();
  for (const item of state.preview.glossary) {
    const entry = node('div');
    const term = node('dt', '', item.termAr);
    term.append(node('span', '', item.termEn));
    const definition = node('dd', '', item.definitionAr);
    definition.append(node('small', '', `مرادفات: ${item.synonymsAr.join('، ')}`));
    entry.append(term, definition);
    glossary.append(entry);
  }
}

function renderPaths() {
  const grid = document.getElementById('path-grid');
  grid.replaceChildren();
  for (const path of state.preview.availablePaths) {
    const card = node('article', `knowledge-path${path.id === state.level ? ' active' : ''}`);
    card.append(node('span', '', path.id.toUpperCase()));
    card.append(node('h3', '', path.nameAr));
    card.append(node('p', '', path.audienceAr));
    const list = node('ul');
    for (const tool of path.toolsAr) list.append(node('li', '', tool));
    card.append(list);
    grid.append(card);
  }
}

function renderEvidence() {
  const list = document.getElementById('evidence-list');
  list.replaceChildren();
  for (const evidence of state.preview.evidence) list.append(node('li', '', evidence));
}

function renderPreview() {
  const preview = state.preview;
  document.title = `${preview.product.nameAr} | الملف الهندسي لشيخة`;
  document.getElementById('product-discipline').textContent = preview.disciplineAr;
  document.getElementById('product-title').textContent = preview.product.nameAr;
  document.getElementById('product-mechanism').textContent = preview.mechanismAr;
  document.getElementById('product-status').textContent = preview.product.availability;
  document.getElementById('product-kind').textContent = kindLabels[preview.product.kind] || preview.product.kind;
  document.getElementById('product-pricing').textContent = preview.product.pricingMode === 'REQUEST_QUOTE' ? 'بطلب عرض' : preview.product.pricingMode;
  document.getElementById('architecture-pattern').textContent = preview.architecturePatternAr;
  document.getElementById('level-audience').textContent =
    `${preview.knowledgeLevel.audienceAr} ${preview.knowledgeLevel.outcomeAr}`;
  replaceList('product-inputs', preview.inputsAr);
  replaceList('product-outputs', preview.outputsAr);
  renderFormulas();
  renderGlossary();
  renderPaths();
  renderEvidence();
  if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
  state.animationFrame = null;
  drawProductFlow();
}

async function loadPreview() {
  const { response, body } = await readJson(
    `${API}/products/${encodeURIComponent(state.productId)}/preview?level=${state.level}`
  );
  if (!response.ok || body.ok === false) throw new Error(body.message || 'تعذر تحميل المنتج');
  state.preview = body.data;
  document.getElementById('full-dossier').hidden = true;
  document.getElementById('entitlement-state').className = 'entitlement-state';
  document.getElementById('entitlement-state').replaceChildren(
    node('strong', '', 'الوضع الافتراضي: منع'),
    node('span', '', 'لم يُنفذ تحقق الاستحقاق بعد.')
  );
  renderPreview();
}

async function loadPreviewSafely() {
  const mechanism = document.getElementById('product-mechanism');
  try {
    mechanism.textContent = 'جارٍ تحميل الوصف الهندسي الموثق.';
    await loadPreview();
  } catch (error) {
    mechanism.textContent = error.message;
    document.getElementById('full-dossier').hidden = true;
  }
}

function populateProductSelector() {
  const selector = document.getElementById('product-selector');
  selector.replaceChildren();
  for (const preview of state.products) {
    const option = node('option', '', preview.product.nameAr);
    option.value = preview.product.id;
    selector.append(option);
  }
  if (!state.products.some((preview) => preview.product.id === state.productId)) {
    state.productId = state.products[0]?.product.id || 'PROD-CLOUD-SAAS';
  }
  selector.value = state.productId;
}

function drawBox(context, box, label, accent) {
  context.fillStyle = '#0d3029';
  context.strokeStyle = accent;
  context.lineWidth = 1.5;
  context.fillRect(box.x - box.w / 2, box.y - box.h / 2, box.w, box.h);
  context.strokeRect(box.x - box.w / 2, box.y - box.h / 2, box.w, box.h);
  context.fillStyle = '#e7f2ee';
  context.font = 'bold 12px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, box.x, box.y);
}

function drawProductFlow() {
  const canvas = document.getElementById('product-flow-canvas');
  const context = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(rect.width * ratio) || canvas.height !== Math.round(rect.height * ratio)) {
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);

  const mobile = rect.width < 680;
  const labels = ['INPUT', 'VALIDATE', 'GOVERN', 'ANALYZE', 'OUTPUT'];
  const boxes = labels.map((label, index) => ({
    x: mobile ? rect.width / 2 : 95 + index * ((rect.width - 190) / 4),
    y: mobile ? 48 + index * 70 : rect.height / 2,
    w: mobile ? Math.min(220, rect.width - 70) : Math.min(145, (rect.width - 120) / 6),
    h: 46,
    label
  }));

  context.strokeStyle = 'rgba(50, 146, 133, 0.8)';
  context.lineWidth = 2;
  context.beginPath();
  for (let index = 0; index < boxes.length - 1; index += 1) {
    context.moveTo(boxes[index].x, boxes[index].y);
    context.lineTo(boxes[index + 1].x, boxes[index + 1].y);
  }
  context.stroke();

  const progress = state.reducedMotion ? 0.65 : (performance.now() / 3600) % 1;
  const scaled = progress * (boxes.length - 1);
  const segment = Math.min(Math.floor(scaled), boxes.length - 2);
  const local = scaled - segment;
  const start = boxes[segment];
  const end = boxes[segment + 1];
  const x = start.x + (end.x - start.x) * local;
  const y = start.y + (end.y - start.y) * local;
  context.fillStyle = '#ddb446';
  context.fillRect(x - 5, y - 5, 10, 10);

  boxes.forEach((box, index) => drawBox(
    context,
    box,
    box.label,
    index === 2 ? '#ddb446' : '#2ba4b6'
  ));
  if (!state.reducedMotion) state.animationFrame = requestAnimationFrame(drawProductFlow);
}

function dossierModule(title, items) {
  const module = node('section', 'dossier-module');
  module.append(node('h3', '', title));
  const list = node('ul');
  for (const item of items) list.append(node('li', '', item));
  module.append(list);
  return module;
}

function renderDossier(dossier) {
  const section = document.getElementById('full-dossier');
  const content = document.getElementById('dossier-content');
  const grid = node('div', 'dossier-grid');
  grid.append(
    dossierModule('الواجهات', dossier.engineering.interfaces),
    dossierModule('منهجيات القياس', dossier.scienceAndMathematics.methodsAr),
    dossierModule('مسار النشر', dossier.operations.deploymentPathAr),
    dossierModule('الفشل والتعافي', dossier.operations.failureAndRecoveryAr),
    dossierModule('الاختبارات', dossier.operations.testCommands),
    dossierModule('الأدلة', dossier.evidence)
  );
  content.replaceChildren(grid);
  section.hidden = false;
  section.scrollIntoView({ behavior: state.reducedMotion ? 'auto' : 'smooth' });
}

async function checkEntitlement() {
  const panel = document.getElementById('entitlement-state');
  const button = document.getElementById('check-entitlement');
  let token = '';
  try { token = localStorage.getItem('sheikha_token') || ''; } catch { token = ''; }
  button.disabled = true;
  panel.className = 'entitlement-state';
  panel.replaceChildren(node('strong', '', 'جارٍ التحقق'), node('span', '', 'يُراجع الخادم الهوية وسجل الاستحقاق.'));
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { response, body } = await readJson(
      `${API}/products/${encodeURIComponent(state.productId)}/dossier?level=${state.level}`,
      { headers }
    );
    if (!response.ok || body.ok === false) {
      panel.className = 'entitlement-state denied';
      panel.replaceChildren(
        node('strong', '', response.status === 401 ? 'يلزم تسجيل الدخول' : 'لا يوجد استحقاق موثق'),
        node('span', '', body.message || 'تعذر فتح الملف الكامل.')
      );
      return;
    }
    panel.className = 'entitlement-state allowed';
    panel.replaceChildren(node('strong', '', 'تم التحقق'), node('span', '', 'الملف التشغيلي الكامل متاح لهذا المنتج.'));
    renderDossier(body.data);
  } catch (error) {
    panel.className = 'entitlement-state denied';
    panel.replaceChildren(node('strong', '', 'تعذر التحقق'), node('span', '', error.message));
  } finally {
    button.disabled = false;
  }
}

function bindControls() {
  document.getElementById('product-selector').addEventListener('change', async (event) => {
    state.productId = event.target.value;
    window.history.replaceState(null, '', `?id=${encodeURIComponent(state.productId)}`);
    await loadPreviewSafely();
  });
  document.querySelectorAll('[data-level]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.level = button.dataset.level;
      document.querySelectorAll('[data-level]').forEach((item) =>
        item.classList.toggle('active', item === button)
      );
      await loadPreviewSafely();
    });
  });
  document.getElementById('check-entitlement').addEventListener('click', checkEntitlement);
}

async function activate() {
  try {
    const { response, body } = await readJson(`${API}/products?level=guided`);
    if (!response.ok || body.ok === false) throw new Error(body.message || 'تعذر تحميل المنتجات');
    state.products = body.data.products;
    populateProductSelector();
    bindControls();
    await loadPreviewSafely();
  } catch (error) {
    document.getElementById('product-mechanism').textContent = error.message;
  }
}

window.addEventListener('resize', () => {
  if (state.reducedMotion && state.preview) drawProductFlow();
});

window.addEventListener('pagehide', () => {
  if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
});

activate();
