'use strict';

const API = '/api/sheikha/commerce/v1';
const dashboardState = {
  role: 'owner',
  sector: 'all',
  sectors: [],
  dashboard: null,
  view: 'overview'
};

const labels = {
  catalogReady: 'جاهز في الكتالوج',
  products: 'المنتجات والخدمات',
  saasServices: 'خدمات SaaS',
  sectors: 'القطاعات',
  workflows: 'مسارات العمل',
  LOCAL_EVIDENCE_VERIFIED: 'متحقق من الأدلة المحلية',
  NOT_CONNECTED: 'غير متصل ببيانات حية',
  SEPARATE_LIVE_FEED: 'مصدر حي منفصل',
  REQUEST_QUOTE_ONLY: 'بطلب عرض فقط'
};

const kindLabels = {
  SAAS_PRODUCT: 'SaaS',
  COMMERCIAL_DIGITAL_PRODUCT: 'رقمي',
  PLATFORM_PRODUCT: 'منصة',
  KNOWLEDGE_COMMUNITY_PRODUCT: 'معرفة ومجتمع'
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function readJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new Error(body.message || `${url}: ${response.status}`);
  }
  return body.data;
}

function sectorName(id) {
  if (id === 'all') return 'كل القطاعات';
  return dashboardState.sectors.find((sector) => sector.id === id)?.nameAr || id;
}

function renderKpis() {
  const grid = document.getElementById('kpi-grid');
  grid.replaceChildren();
  const summary = dashboardState.dashboard.summary;
  const entries = ['products', 'catalogReady', 'saasServices', 'sectors', 'workflows'];
  for (const key of entries) {
    const card = el('article', 'kpi');
    card.append(el('span', '', labels[key]));
    card.append(el('strong', '', summary[key]));
    card.append(el('small', '', key === 'products' ? 'من سجل موحد' : 'ضمن النطاق الحالي'));
    grid.append(card);
  }
}

function renderRoleFocus() {
  const role = dashboardState.dashboard.role;
  document.getElementById('role-name').textContent = role.nameAr;
  const list = document.getElementById('role-focus');
  list.replaceChildren();
  for (const item of role.focus) list.append(el('li', '', item));
}

function renderDataState() {
  const list = document.getElementById('data-state');
  list.replaceChildren();
  const names = {
    catalog: 'الكتالوج',
    liveTransactions: 'المعاملات الحية',
    verifiedMerchantListings: 'عروض التجار',
    prices: 'الأسعار'
  };
  for (const [key, value] of Object.entries(dashboardState.dashboard.dataState)) {
    const row = el('div');
    row.append(el('dt', '', names[key]));
    row.append(el('dd', '', labels[value] || value));
    list.append(row);
  }
}

function renderSectorPreview() {
  const grid = document.getElementById('sector-preview-grid');
  grid.replaceChildren();
  for (const sector of dashboardState.dashboard.sectors.slice(0, 8)) {
    const item = el('article', 'sector-preview-item');
    item.append(el('strong', '', sector.nameAr));
    item.append(el('span', '', sector.groupNameAr));
    item.append(el('p', '', sector.benefitAr));
    grid.append(item);
  }
}

function appendCell(row, content, strong) {
  const cell = el('td');
  cell.append(el(strong ? 'strong' : 'span', '', content));
  row.append(cell);
}

function renderProductTable() {
  const body = document.getElementById('product-table');
  body.replaceChildren();
  for (const product of dashboardState.dashboard.products) {
    const row = el('tr');
    appendCell(row, product.nameAr, true);
    appendCell(row, kindLabels[product.kind] || product.kind);
    appendCell(row, sectorName(product.primarySector));
    const stateCell = el('td');
    stateCell.append(el('span', 'state-badge', product.availability));
    row.append(stateCell);
    appendCell(row, 'بطلب عرض');
    body.append(row);
  }
}

function renderSectorTable() {
  const body = document.getElementById('sector-table');
  body.replaceChildren();
  for (const sector of dashboardState.dashboard.sectors) {
    const row = el('tr');
    appendCell(row, sector.nameAr, true);
    appendCell(row, sector.groupNameAr);
    appendCell(row, sector.productCount);
    appendCell(row, sector.benefitAr);
    const stateCell = el('td');
    stateCell.append(el('span', 'state-badge', 'عقد جاهز'));
    row.append(stateCell);
    body.append(row);
  }
}

function renderOperations() {
  const list = document.getElementById('operation-list');
  list.replaceChildren();
  for (const workflow of dashboardState.dashboard.workflows) {
    const item = el('li');
    item.append(el('span', '', String(workflow.order).padStart(2, '0')));
    item.append(el('strong', '', workflow.nameAr));
    item.append(el(
      'p',
      '',
      workflow.highImpact
        ? 'عملية عالية الأثر، تتطلب مراجعة وموافقة بشرية.'
        : 'يمكن إعداد خطتها ضمن حدود القراءة والتنسيق.'
    ));
    list.append(item);
  }
}

function renderDashboard() {
  const dashboard = dashboardState.dashboard;
  document.getElementById('health-state').textContent = 'Commerce Runtime نشط';
  document.getElementById('health-dot').classList.add('ready');
  document.getElementById('scope-label').textContent = sectorName(dashboardState.sector);
  renderKpis();
  renderRoleFocus();
  renderDataState();
  renderSectorPreview();
  renderProductTable();
  renderSectorTable();
  renderOperations();
}

async function loadDashboard() {
  document.getElementById('health-state').textContent = 'جارٍ تحديث البيانات';
  const params = new URLSearchParams({
    role: dashboardState.role,
    sector: dashboardState.sector
  });
  dashboardState.dashboard = await readJson(`${API}/dashboard?${params}`);
  renderDashboard();
}

function openView(view) {
  dashboardState.view = view;
  document.querySelectorAll('[data-panel]').forEach((panel) =>
    panel.classList.toggle('active', panel.dataset.panel === view)
  );
  document.querySelectorAll('[data-view]').forEach((button) =>
    button.classList.toggle('active', button.dataset.view === view)
  );
  const titles = {
    overview: ['لوحة التجارة والاقتصاد', 'رؤية واحدة للمنتجات والقطاعات ومسارات التشغيل المشتركة.'],
    products: ['المنتجات والخدمات', 'كتالوج السوق وSheikha Cloud SaaS في سجل تشغيلي واحد.'],
    sectors: ['القطاعات والأسواق', 'تكامل العمليات والمنفعة التشغيلية عبر كل قطاع.'],
    operations: ['مسارات العمليات', 'تنسيق مشترك مع بوابة بشرية للعمليات عالية الأثر.']
  };
  document.getElementById('view-title').textContent = titles[view][0];
  document.getElementById('view-description').textContent = titles[view][1];
  window.history.replaceState(null, '', `#${view}`);
}

function bindDashboardControls() {
  document.querySelectorAll('[data-view]').forEach((button) =>
    button.addEventListener('click', () => openView(button.dataset.view))
  );
  document.querySelectorAll('[data-open-view]').forEach((button) =>
    button.addEventListener('click', () => openView(button.dataset.openView))
  );
  document.getElementById('role-filter').addEventListener('change', async (event) => {
    dashboardState.role = event.target.value;
    await loadDashboard();
  });
  document.getElementById('dashboard-sector').addEventListener('change', async (event) => {
    dashboardState.sector = event.target.value;
    await loadDashboard();
  });
  document.getElementById('refresh-dashboard').addEventListener('click', loadDashboard);
}

async function activateDashboard() {
  const sectorData = await readJson(`${API}/sectors`);
  dashboardState.sectors = sectorData.sectors;
  const selector = document.getElementById('dashboard-sector');
  for (const sector of dashboardState.sectors) {
    const option = el('option', '', sector.nameAr);
    option.value = sector.id;
    selector.append(option);
  }
  bindDashboardControls();
  await loadDashboard();
  const requestedView = window.location.hash.slice(1);
  if (['overview', 'products', 'sectors', 'operations'].includes(requestedView)) {
    openView(requestedView);
  }
}

activateDashboard().catch((error) => {
  document.getElementById('health-state').textContent = 'تعذر تحميل لوحة التجارة';
  document.getElementById('view-description').textContent = error.message;
});
