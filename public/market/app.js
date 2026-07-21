'use strict';

const API_ROOT = '/api/sheikha/commerce/v1';
const state = {
  runtime: null,
  products: [],
  sectors: [],
  workflows: [],
  merchantListings: [],
  kind: 'all',
  sector: 'all',
  search: ''
};

const statusLabels = {
  CATALOG_READY: 'جاهز للطلب',
  DISCOVERY_READY: 'جاهز للاستكشاف',
  MERCHANT_LISTING: 'عرض تاجر'
};

const kindLabels = {
  SAAS_PRODUCT: 'خدمة SaaS',
  COMMERCIAL_DIGITAL_PRODUCT: 'منتج رقمي',
  PLATFORM_PRODUCT: 'منصة',
  KNOWLEDGE_COMMUNITY_PRODUCT: 'معرفة ومجتمع',
  MERCHANT_LISTING: 'عرض تاجر'
};

const serviceLabels = {
  MARKETPLACE_PORTAL: 'بوابة السوق',
  SUPPLIER_PORTAL: 'بوابة المورد',
  BUYER_PORTAL: 'بوابة المشتري',
  RFQ_SERVICE: 'طلبات عروض الأسعار',
  QUOTATION_SERVICE: 'العروض السعرية',
  CONTRACT_SERVICE: 'العقود',
  ORDER_SERVICE: 'الطلبات',
  SHIPMENT_SERVICE: 'الشحنات',
  INVOICE_SERVICE: 'الفواتير',
  PROJECT_SERVICE: 'المشروعات',
  WORKFLOW_SERVICE: 'مسارات العمل',
  KNOWLEDGE_SERVICE: 'المعرفة',
  DASHBOARD_SERVICE: 'لوحات التحكم',
  API_GATEWAY_SERVICE: 'بوابة API'
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function readJson(url, options) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const body = await response.json();
  if (!response.ok || body.ok === false || body.success === false) {
    throw new Error(body.message || `${url}: ${response.status}`);
  }
  return body;
}

function productImage(product) {
  if (product.id === 'PROD-RIYADH-ALJANNAH') {
    return ['/images/sheikha-worldly-gardens-v1.png', false];
  }
  if (product.kind === 'SAAS_PRODUCT' || product.kind === 'COMMERCIAL_DIGITAL_PRODUCT') {
    return ['/images/sheikha-emblem-hd.png', true];
  }
  const sectorImages = {
    metals: '/assets/market-real/steel/cover.png',
    'precious-metals': '/assets/market-real/precious/cover.png',
    recycling: '/assets/market-real/scrap/cover.png',
    energy: '/assets/market-real/copper/cover.png'
  };
  return [
    sectorImages[product.primarySector] || '/images/sheikha-industrial-market-hero-v1.png',
    false
  ];
}

function sectorName(id) {
  return state.sectors.find((sector) => sector.id === id)?.nameAr || id;
}

function normalizeMerchantListing(listing) {
  const amount = Number(listing.price);
  return {
    id: `LISTING-${listing.id}`,
    originalId: listing.id,
    nameAr: String(listing.name || 'عرض تاجر'),
    nameEn: '',
    summaryAr: String(listing.description || 'عرض من سجل التجار المتصل بالسوق.'),
    kind: 'MERCHANT_LISTING',
    primarySector: 'metals',
    targetSectors: ['metals', 'marketplaces', 'commerce'],
    availability: 'MERCHANT_LISTING',
    seller: String(listing.seller || 'تاجر مسجل'),
    location: String(listing.location || 'غير محدد'),
    pricing: {
      mode: amount > 0 ? 'MERCHANT_DECLARED' : 'REQUEST_QUOTE',
      amount: amount > 0 ? amount : null,
      currency: String(listing.currency || ''),
      livePriceClaimed: false
    },
    salesAction: 'REQUEST_QUOTE',
    transactionReady: false
  };
}

function fillSelectors() {
  const filter = document.getElementById('sector-filter');
  const requestSector = document.getElementById('request-sector');
  for (const sector of state.sectors) {
    const option = element('option', '', sector.nameAr);
    option.value = sector.id;
    filter.append(option);
    requestSector.append(option.cloneNode(true));
  }

  const requestWorkflow = document.getElementById('request-workflow');
  for (const workflow of state.workflows) {
    const option = element('option', '', workflow.nameAr);
    option.value = workflow.id;
    if (workflow.id === 'RFQ_CREATION') option.selected = true;
    requestWorkflow.append(option);
  }
}

function renderSummary() {
  const coverage = state.runtime.coverage;
  document.getElementById('product-count').textContent = coverage.products;
  document.getElementById('sector-count').textContent = coverage.sectors;
  document.getElementById('saas-count').textContent = coverage.saasServices;
  document.getElementById('workflow-count').textContent = coverage.workflows;
  document.getElementById('runtime-state').textContent = 'الكتالوج المحلي متحقق بالأدلة';
  document.getElementById('runtime-dot').classList.add('ready');

  const merchantState = document.getElementById('merchant-feed-state');
  merchantState.textContent = state.merchantListings.length
    ? `${state.merchantListings.length} عرض تاجر من المصدر المتصل`
    : 'لا توجد عروض تجار متحققة في المصدر المتصل حاليًا';
}

function renderSaas() {
  const cloud = state.products.find((product) => product.id === 'PROD-CLOUD-SAAS');
  const list = document.getElementById('saas-services');
  list.replaceChildren();
  for (const service of cloud?.services || []) {
    list.append(element('li', '', serviceLabels[service] || service));
  }
}

function renderMarketGroups() {
  const grid = document.getElementById('market-group-grid');
  grid.replaceChildren();
  for (const group of state.runtime.marketGroups) {
    const article = element('article', 'market-group');
    article.append(element('h3', '', group.nameAr));
    article.append(element('p', '', group.benefitAr));
    const sectors = element('div', 'sector-list');
    for (const sector of group.sectors) {
      sectors.append(element('span', '', sectorName(sector)));
    }
    article.append(sectors);
    const button = element('button', '', 'عرض منتجات هذه العائلة');
    button.type = 'button';
    button.addEventListener('click', () => {
      state.sector = group.sectors[0];
      document.getElementById('sector-filter').value = state.sector;
      renderProducts();
      document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    });
    article.append(button);
    grid.append(article);
  }
}

function renderWorkflows() {
  const track = document.getElementById('workflow-track');
  track.replaceChildren();
  for (const workflow of state.workflows) {
    const item = element('li');
    item.append(element('span', '', String(workflow.order).padStart(2, '0')));
    item.append(element('strong', '', workflow.nameAr));
    item.append(element(
      'small',
      '',
      workflow.highImpact ? 'موافقة بشرية' : 'خطة محكومة'
    ));
    track.append(item);
  }
}

function activeProducts() {
  const all = [...state.products, ...state.merchantListings];
  return all.filter((product) => {
    const kindMatches = state.kind === 'all' || product.kind === state.kind;
    const sectorMatches = state.sector === 'all' ||
      product.targetSectors.includes(state.sector);
    const haystack = [product.nameAr, product.nameEn, product.summaryAr]
      .join(' ')
      .toLowerCase();
    const searchMatches = !state.search || haystack.includes(state.search);
    return kindMatches && sectorMatches && searchMatches;
  });
}

function formatPrice(product) {
  if (product.pricing.amount === null) return 'بطلب عرض';
  return `${product.pricing.amount.toLocaleString('ar-SA')} ${product.pricing.currency}`;
}

function openRequest(product) {
  const dialog = document.getElementById('request-dialog');
  document.getElementById('request-product-id').value =
    product.kind === 'MERCHANT_LISTING' ? '' : product.id;
  document.getElementById('request-product-name').textContent = product.nameAr;
  document.getElementById('request-sector').value = product.primarySector;
  document.getElementById('request-intent').value = `طلب نطاق وتفاصيل ${product.nameAr}`;
  const output = document.getElementById('request-result');
  output.className = '';
  output.textContent = '';
  dialog.showModal();
}

function productCard(product) {
  const card = element('article', 'product-card');
  const media = element('div', 'product-media');
  const imageData = productImage(product);
  const image = document.createElement('img');
  image.src = imageData[0];
  image.alt = '';
  image.loading = 'lazy';
  if (imageData[1]) image.className = 'emblem';
  media.append(image);
  media.append(element(
    'span',
    'status-chip',
    statusLabels[product.availability] || product.availability
  ));

  const body = element('div', 'product-body');
  body.append(element('span', 'product-type', kindLabels[product.kind] || product.kind));
  body.append(element('h3', '', product.nameAr));
  body.append(element('p', '', product.summaryAr));

  const meta = element('dl', 'product-meta');
  const sectorMeta = element('div');
  sectorMeta.append(element('dt', '', 'القطاع'));
  sectorMeta.append(element('dd', '', sectorName(product.primarySector)));
  const priceMeta = element('div');
  priceMeta.append(element('dt', '', 'السعر'));
  priceMeta.append(element('dd', '', formatPrice(product)));
  meta.append(sectorMeta, priceMeta);
  body.append(meta);

  if (product.route && product.salesAction === 'EXPLORE_PRODUCT') {
    const action = element('a', 'product-action', 'استكشف المنتج');
    action.href = product.route;
    body.append(action);
  } else {
    const action = element('button', 'product-action', 'طلب التفاصيل');
    action.type = 'button';
    action.addEventListener('click', () => openRequest(product));
    body.append(action);
  }
  card.append(media, body);
  return card;
}

function renderProducts() {
  const products = activeProducts();
  const grid = document.getElementById('product-grid');
  grid.replaceChildren();
  document.getElementById('result-count').textContent =
    `${products.length} منتجًا وخدمة`;
  if (!products.length) {
    grid.append(element('p', 'empty-state', 'لا توجد نتائج مطابقة لهذه المرشحات.'));
    return;
  }
  for (const product of products) grid.append(productCard(product));
}

async function submitOperationPlan(event) {
  event.preventDefault();
  const output = document.getElementById('request-result');
  output.className = 'visible';
  output.textContent = 'جارٍ إنشاء الخطة المحكومة...';
  try {
    const body = {
      sector: document.getElementById('request-sector').value,
      workflow: document.getElementById('request-workflow').value,
      productId: document.getElementById('request-product-id').value || undefined,
      intent: document.getElementById('request-intent').value
    };
    const response = await readJson(`${API_ROOT}/operations/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const plan = response.data;
    output.textContent = `${plan.status === 'PLAN_READY' ? 'الخطة جاهزة' : 'تتطلب موافقة بشرية'} · ${plan.planId} · لم يُنفذ أي عقد أو طلب أو دفع.`;
  } catch (error) {
    output.className = 'visible error';
    output.textContent = `تعذر إنشاء الخطة: ${error.message}`;
  }
}

function bindControls() {
  document.getElementById('catalog-search').addEventListener('input', (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderProducts();
  });
  document.getElementById('sector-filter').addEventListener('change', (event) => {
    state.sector = event.target.value;
    renderProducts();
  });
  document.querySelectorAll('[data-kind]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-kind]').forEach((item) =>
        item.classList.toggle('active', item === button)
      );
      state.kind = button.dataset.kind;
      renderProducts();
    });
  });
  document.getElementById('saas-request').addEventListener('click', () => {
    const cloud = state.products.find((product) => product.id === 'PROD-CLOUD-SAAS');
    if (cloud) openRequest(cloud);
  });
  document.getElementById('request-form').addEventListener('submit', submitOperationPlan);
  const dialog = document.getElementById('request-dialog');
  document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
  document.getElementById('cancel-dialog').addEventListener('click', () => dialog.close());
}

async function activateMarket() {
  const [runtimeResponse, sectorResponse, workflowResponse, catalogResponse] =
    await Promise.all([
      readJson(`${API_ROOT}/status`),
      readJson(`${API_ROOT}/sectors`),
      readJson(`${API_ROOT}/workflows`),
      readJson(`${API_ROOT}/catalog`)
    ]);
  state.runtime = runtimeResponse.data;
  state.sectors = sectorResponse.data.sectors;
  state.workflows = workflowResponse.data.workflows;
  state.products = catalogResponse.data.products;

  try {
    const merchantResponse = await readJson('/api/market/products');
    state.merchantListings = (merchantResponse.products || [])
      .map(normalizeMerchantListing);
  } catch {
    state.merchantListings = [];
  }

  fillSelectors();
  renderSummary();
  renderSaas();
  renderMarketGroups();
  renderWorkflows();
  renderProducts();
  bindControls();
}

activateMarket().catch((error) => {
  document.getElementById('runtime-state').textContent = 'تعذر قراءة الكتالوج';
  document.getElementById('market-data-state').textContent = error.message;
  const grid = document.getElementById('product-grid');
  grid.replaceChildren(element('p', 'empty-state', 'تعذر تحميل بيانات السوق المحلية.'));
});
